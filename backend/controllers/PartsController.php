<?php
/**
 * Parts Controller
 * 
 * Handles all operations related to parts
 */
class PartsController {
    /**
     * Get all parts with optional filters
     * 
     * @param array $params Query parameters for filtering
     */
    public function getAllParts($params = []) {
        // Build query
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id";
        
        $whereConditions = [];
        $queryParams = [];
        $paramTypes = '';
        
        // Filter by category
        if (!empty($params['category_id'])) {
            $whereConditions[] = "p.category_id = ?";
            $queryParams[] = (int)$params['category_id'];
            $paramTypes .= 'i';
        }
        
        // Filter by search term
        if (!empty($params['search'])) {
            $whereConditions[] = "(p.title LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)";
            $searchTerm = '%' . $params['search'] . '%';
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
            $queryParams[] = $searchTerm;
            $paramTypes .= 'sss';
        }
        
        // Filter by manufacturer
        if (!empty($params['manufacturer'])) {
            $whereConditions[] = "p.manufacturer = ?";
            $queryParams[] = $params['manufacturer'];
            $paramTypes .= 's';
        }
        
        // Add WHERE clause if filters exist
        if (!empty($whereConditions)) {
            $sql .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        // Add pagination
        $page = isset($params['page']) ? max(1, (int)$params['page']) : 1;
        $limit = isset($params['limit']) ? min(50, max(1, (int)$params['limit'])) : 20;
        $offset = ($page - 1) * $limit;
        
        $sql .= " LIMIT ?, ?";
        $queryParams[] = $offset;
        $queryParams[] = $limit;
        $paramTypes .= 'ii';
        
        // Execute query
        $result = executeQuery($sql, $queryParams, $paramTypes);
        
        if (!$result) {
            Response::serverError('Failed to fetch parts');
        }
        
        // Fetch all parts
        $parts = [];
        while ($row = $result->fetch_assoc()) {
            $parts[] = $row;
        }
        
        // Get total count for pagination
        $countSql = "SELECT COUNT(*) as total FROM parts p";
        if (!empty($whereConditions)) {
            $countSql .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        $countResult = executeQuery($countSql, array_slice($queryParams, 0, -2), substr($paramTypes, 0, -2));
        $totalCount = $countResult->fetch_assoc()['total'];
        
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
     * Get a part by ID
     * 
     * @param int $id Part ID
     */
    public function getPartById($id) {
        // Get part details
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id 
                WHERE p.id = ?";
        
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            Response::notFound('Part not found');
        }
        
        $part = $result->fetch_assoc();
        
        // Get compatible models
        $compatibilitySql = "SELECT pc.*, cm.name as model_name, cmk.name as make_name 
                            FROM part_compatibility pc 
                            JOIN car_models cm ON pc.model_id = cm.id 
                            JOIN car_makes cmk ON cm.make_id = cmk.id 
                            WHERE pc.part_id = ?";
        
        $compatibilityResult = executeQuery($compatibilitySql, [$id], 'i');
        
        $compatibility = [];
        while ($row = $compatibilityResult->fetch_assoc()) {
            $compatibility[] = $row;
        }
        
        // Get suppliers with inventory
        $inventorySql = "SELECT i.*, bp.business_name 
                        FROM inventory i 
                        JOIN business_profiles bp ON i.business_id = bp.id 
                        WHERE i.part_id = ? AND i.quantity > 0";
        
        $inventoryResult = executeQuery($inventorySql, [$id], 'i');
        
        $inventory = [];
        while ($row = $inventoryResult->fetch_assoc()) {
            $inventory[] = $row;
        }
        
        // Add to part data
        $part['compatibility'] = $compatibility;
        $part['inventory'] = $inventory;
        
        // Return response
        Response::success($part);
    }
    
    /**
     * Create a new part
     * 
     * @param array $data Part data
     */
    public function createPart($data) {
        // Validate required fields
        if (empty($data['title']) || empty($data['category_id']) || empty($data['sku'])) {
            Response::badRequest('Missing required fields');
        }
        
        // Check if SKU already exists
        $checkSql = "SELECT id FROM parts WHERE sku = ?";
        $checkResult = executeQuery($checkSql, [$data['sku']], 's');
        
        if ($checkResult->num_rows > 0) {
            Response::badRequest('Part with this SKU already exists');
        }
        
        // Insert part
        $sql = "INSERT INTO parts (category_id, title, description, sku, manufacturer, weight, dimensions, image_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            (int)$data['category_id'],
            $data['title'],
            $data['description'] ?? null,
            $data['sku'],
            $data['manufacturer'] ?? null,
            $data['weight'] ?? null,
            $data['dimensions'] ?? null,
            $data['image_url'] ?? null
        ];
        
        $types = 'issssdss';
        
        $partId = executeQuery($sql, $params, $types);
        
        if (!$partId) {
            Response::serverError('Failed to create part');
        }
        
        // Add compatibility if provided
        if (!empty($data['compatibility']) && is_array($data['compatibility'])) {
            $this->updateCompatibility($partId, $data['compatibility']);
        }
        
        // Return success with new part ID
        Response::success(['id' => $partId], 201);
    }
    
    /**
     * Update an existing part
     * 
     * @param int $id Part ID
     * @param array $data Part data
     */
    public function updatePart($id, $data) {
        // Check if part exists
        $checkSql = "SELECT id FROM parts WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Part not found');
        }
        
        // Build update query
        $updates = [];
        $params = [];
        $types = '';
        
        // Add fields to update if provided
        if (isset($data['category_id'])) {
            $updates[] = "category_id = ?";
            $params[] = (int)$data['category_id'];
            $types .= 'i';
        }
        
        if (isset($data['title'])) {
            $updates[] = "title = ?";
            $params[] = $data['title'];
            $types .= 's';
        }
        
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = $data['description'];
            $types .= 's';
        }
        
        if (isset($data['sku'])) {
            // Check if new SKU already exists for a different part
            $skuCheckSql = "SELECT id FROM parts WHERE sku = ? AND id != ?";
            $skuCheckResult = executeQuery($skuCheckSql, [$data['sku'], $id], 'si');
            
            if ($skuCheckResult->num_rows > 0) {
                Response::badRequest('Part with this SKU already exists');
            }
            
            $updates[] = "sku = ?";
            $params[] = $data['sku'];
            $types .= 's';
        }
        
        if (isset($data['manufacturer'])) {
            $updates[] = "manufacturer = ?";
            $params[] = $data['manufacturer'];
            $types .= 's';
        }
        
        if (isset($data['weight'])) {
            $updates[] = "weight = ?";
            $params[] = $data['weight'];
            $types .= 'd';
        }
        
        if (isset($data['dimensions'])) {
            $updates[] = "dimensions = ?";
            $params[] = $data['dimensions'];
            $types .= 's';
        }
        
        if (isset($data['image_url'])) {
            $updates[] = "image_url = ?";
            $params[] = $data['image_url'];
            $types .= 's';
        }
        
        // If no fields to update
        if (empty($updates)) {
            Response::badRequest('No fields to update');
        }
        
        // Add updated_at timestamp
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        
        // Build the query
        $sql = "UPDATE parts SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';
        
        // Execute update
        $result = executeQuery($sql, $params, $types);
        
        if ($result === false) {
            Response::serverError('Failed to update part');
        }
        
        // Update compatibility if provided
        if (isset($data['compatibility']) && is_array($data['compatibility'])) {
            $this->updateCompatibility($id, $data['compatibility']);
        }
        
        // Return success
        Response::success(['id' => $id, 'message' => 'Part updated successfully']);
    }
    
    /**
     * Delete a part
     * 
     * @param int $id Part ID
     */
    public function deletePart($id) {
        // Check if part exists
        $checkSql = "SELECT id FROM parts WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Part not found');
        }
        
        // Delete part (foreign key constraints will handle related data)
        $sql = "DELETE FROM parts WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if ($result === false) {
            Response::serverError('Failed to delete part');
        }
        
        // Return success
        Response::success(['message' => 'Part deleted successfully']);
    }
    
    /**
     * Get compatible parts for a vehicle
     * 
     * @param array $params Query parameters (make_id, model_id, year)
     */
    public function getCompatibleParts($params) {
        // Validate required parameters
        if (empty($params['model_id'])) {
            Response::badRequest('Model ID is required');
        }
        
        $modelId = (int)$params['model_id'];
        $year = !empty($params['year']) ? (int)$params['year'] : null;
        
        // Build query
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id 
                JOIN part_compatibility pcom ON p.id = pcom.part_id 
                WHERE pcom.model_id = ?";
        
        $queryParams = [$modelId];
        $types = 'i';
        
        // Add year filter if provided
        if ($year !== null) {
            $sql .= " AND (pcom.year_from IS NULL OR pcom.year_from <= ?) 
                      AND (pcom.year_to IS NULL OR pcom.year_to >= ?)";
            $queryParams[] = $year;
            $queryParams[] = $year;
            $types .= 'ii';
        }
        
        // Filter by category if provided
        if (!empty($params['category_id'])) {
            $sql .= " AND p.category_id = ?";
            $queryParams[] = (int)$params['category_id'];
            $types .= 'i';
        }
        
        // Add pagination
        $page = isset($params['page']) ? max(1, (int)$params['page']) : 1;
        $limit = isset($params['limit']) ? min(50, max(1, (int)$params['limit'])) : 20;
        $offset = ($page - 1) * $limit;
        
        $sql .= " LIMIT ?, ?";
        $queryParams[] = $offset;
        $queryParams[] = $limit;
        $types .= 'ii';
        
        // Execute query
        $result = executeQuery($sql, $queryParams, $types);
        
        if (!$result) {
            Response::serverError('Failed to fetch compatible parts');
        }
        
        // Fetch all parts
        $parts = [];
        while ($row = $result->fetch_assoc()) {
            $parts[] = $row;
        }
        
        // Return response
        Response::success($parts);
    }
    
    /**
     * Update part compatibility
     * 
     * @param int $partId Part ID
     * @param array $compatibility Array of compatibility data
     */
    private function updateCompatibility($partId, $compatibility) {
        // First, delete existing compatibility
        $deleteSql = "DELETE FROM part_compatibility WHERE part_id = ?";
        executeQuery($deleteSql, [$partId], 'i');
        
        // Insert new compatibility records
        foreach ($compatibility as $item) {
            if (empty($item['model_id'])) {
                continue;
            }
            
            $sql = "INSERT INTO part_compatibility (part_id, model_id, year_from, year_to, notes) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $params = [
                $partId,
                (int)$item['model_id'],
                !empty($item['year_from']) ? (int)$item['year_from'] : null,
                !empty($item['year_to']) ? (int)$item['year_to'] : null,
                $item['notes'] ?? null
            ];
            
            executeQuery($sql, $params, 'iiis');
        }
    }
}