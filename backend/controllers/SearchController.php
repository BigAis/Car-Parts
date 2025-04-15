<?php
/**
 * Search Controller
 * 
 * Handles search functionality across the marketplace
 */
class SearchController {
    /**
     * Search parts based on query parameters
     * 
     * @param array $params Search parameters
     */
    public function search($params) {
        // Get search type
        $searchType = $params['type'] ?? 'parts';
        
        // Call appropriate search method
        switch ($searchType) {
            case 'parts':
                return $this->searchParts($params);
            case 'categories':
                return $this->searchCategories($params);
            default:
                Response::badRequest('Invalid search type');
        }
    }
    
    /**
     * Search for parts
     * 
     * @param array $params Search parameters
     */
    private function searchParts($params) {
        // Get search query
        $query = $params['q'] ?? '';
        
        // Base SQL query
        $sql = "SELECT p.*, pc.name as category_name,
                (SELECT MIN(i.price) FROM inventory i WHERE i.part_id = p.id AND i.quantity > 0) as min_price,
                (SELECT COUNT(i.id) FROM inventory i WHERE i.part_id = p.id AND i.quantity > 0) as suppliers_count
                FROM parts p
                JOIN part_categories pc ON p.category_id = pc.id";
        
        $whereConditions = [];
        $queryParams = [];
        $paramTypes = '';
        
        // Add search query filter
        if (!empty($query)) {
            $whereConditions[] = "(p.title LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.manufacturer LIKE ?)";
            $searchTerm = '%' . $query . '%';
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
            $paramTypes .= 'ssss';
        }
        
        // Add category filter
        if (!empty($params['category_id'])) {
            $categoryIds = explode(',', $params['category_id']);
            $placeholders = array_fill(0, count($categoryIds), '?');
            $whereConditions[] = "p.category_id IN (" . implode(',', $placeholders) . ")";
            
            foreach ($categoryIds as $categoryId) {
                $queryParams[] = (int)$categoryId;
                $paramTypes .= 'i';
            }
        }
        
        // Add make/model/year compatibility filter
        if (!empty($params['model_id'])) {
            $modelId = (int)$params['model_id'];
            
            $sql .= " JOIN part_compatibility pc_compat ON p.id = pc_compat.part_id";
            $whereConditions[] = "pc_compat.model_id = ?";
            $queryParams[] = $modelId;
            $paramTypes .= 'i';
            
            // Add year filter if provided
            if (!empty($params['year'])) {
                $year = (int)$params['year'];
                $whereConditions[] = "(pc_compat.year_from IS NULL OR pc_compat.year_from <= ?)";
                $whereConditions[] = "(pc_compat.year_to IS NULL OR pc_compat.year_to >= ?)";
                $queryParams[] = $year;
                $queryParams[] = $year;
                $paramTypes .= 'ii';
            }
        }
        
        // Add price range filter
        if (!empty($params['min_price']) || !empty($params['max_price'])) {
            $priceJoin = " JOIN inventory i_price ON p.id = i_price.part_id";
            
            if (strpos($sql, 'i_price') === false) {
                $sql .= $priceJoin;
            }
            
            if (!empty($params['min_price'])) {
                $whereConditions[] = "i_price.price >= ?";
                $queryParams[] = (float)$params['min_price'];
                $paramTypes .= 'd';
            }
            
            if (!empty($params['max_price'])) {
                $whereConditions[] = "i_price.price <= ?";
                $queryParams[] = (float)$params['max_price'];
                $paramTypes .= 'd';
            }
            
            // Only show in-stock items for price filtering
            $whereConditions[] = "i_price.quantity > 0";
        }
        
        // Add in-stock filter
        if (isset($params['in_stock']) && $params['in_stock'] === 'true') {
            $inStockJoin = " JOIN inventory i_stock ON p.id = i_stock.part_id";
            
            if (strpos($sql, 'i_stock') === false && strpos($sql, 'i_price') === false) {
                $sql .= $inStockJoin;
            } else if (strpos($sql, 'i_price') !== false) {
                // Use the existing price join for stock check
                $whereConditions[] = "i_price.quantity > 0";
            } else {
                $whereConditions[] = "i_stock.quantity > 0";
            }
        }
        
        // Add manufacturer filter
        if (!empty($params['manufacturer'])) {
            $manufacturers = explode(',', $params['manufacturer']);
            $manufacturerPlaceholders = array_fill(0, count($manufacturers), '?');
            $whereConditions[] = "p.manufacturer IN (" . implode(',', $manufacturerPlaceholders) . ")";
            
            foreach ($manufacturers as $manufacturer) {
                $queryParams[] = $manufacturer;
                $paramTypes .= 's';
            }
        }
        
        // Add WHERE clause if conditions exist
        if (!empty($whereConditions)) {
            $sql .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        // Add GROUP BY to handle multiple inventory joins
        $sql .= " GROUP BY p.id";
        
        // Add sorting
        if (!empty($params['sort'])) {
            switch ($params['sort']) {
                case 'price_asc':
                    $sql .= " ORDER BY min_price ASC";
                    break;
                case 'price_desc':
                    $sql .= " ORDER BY min_price DESC";
                    break;
                case 'newest':
                    $sql .= " ORDER BY p.created_at DESC";
                    break;
                default:
                    // Default sorting by relevance (if search query provided) or newest
                    if (!empty($query)) {
                        $sql .= " ORDER BY (
                            CASE 
                                WHEN p.title LIKE ? THEN 4
                                WHEN p.sku = ? THEN 3 
                                WHEN p.manufacturer LIKE ? THEN 2
                                WHEN p.description LIKE ? THEN 1
                                ELSE 0
                            END
                        ) DESC, p.created_at DESC";
                        $exactQuery = $query;
                        $likeQuery = '%' . $query . '%';
                        $queryParams[] = $likeQuery;
                        $queryParams[] = $exactQuery;
                        $queryParams[] = $likeQuery;
                        $queryParams[] = $likeQuery;
                        $paramTypes .= 'ssss';
                    } else {
                        $sql .= " ORDER BY p.created_at DESC";
                    }
            }
        } else {
            // Default sorting by newest
            $sql .= " ORDER BY p.created_at DESC";
        }
        
        // Add pagination
        $page = isset($params['page']) ? max(1, (int)$params['page']) : 1;
        $limit = isset($params['limit']) ? min(50, max(1, (int)$params['limit'])) : 20;
        $offset = ($page - 1) * $limit;
        
        $paginatedSql = $sql . " LIMIT ?, ?";
        $queryParams[] = $offset;
        $queryParams[] = $limit;
        $paramTypes .= 'ii';
        
        // Execute query
        $result = executeQuery($paginatedSql, $queryParams, $paramTypes);
        
        if (!$result) {
            Response::serverError('Failed to search parts');
        }
        
        // Fetch all parts
        $parts = [];
        while ($row = $result->fetch_assoc()) {
            // Clean up NULL values for min_price
            if ($row['min_price'] === null) {
                $row['min_price'] = 0;
            }
            $parts[] = $row;
        }
        
        // Count total results without pagination
        $countSql = "SELECT COUNT(*) as total FROM (" . $sql . ") as count_query";
        $countParams = array_slice($queryParams, 0, -2); // Remove LIMIT params
        $countTypes = substr($paramTypes, 0, -2);
        
        $countResult = executeQuery($countSql, $countParams, $countTypes);
        $totalCount = $countResult->fetch_assoc()['total'];
        
        // Log search query to search history if user is logged in
        // TODO: Implement search history logging
        
        // Return response
        Response::success([
            'parts' => $parts,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
    }
    
    /**
     * Search for categories
     * 
     * @param array $params Search parameters
     */
    private function searchCategories($params) {
        // Get search query
        $query = $params['q'] ?? '';
        
        if (empty($query)) {
            Response::badRequest('Search query is required');
        }
        
        // Search categories
        $sql = "SELECT * FROM part_categories WHERE name LIKE ? OR description LIKE ?";
        $searchTerm = '%' . $query . '%';
        
        $result = executeQuery($sql, [$searchTerm, $searchTerm], 'ss');
        
        if (!$result) {
            Response::serverError('Failed to search categories');
        }
        
        // Fetch all categories
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
        
        // Return response
        Response::success($categories);
    }
}
?>