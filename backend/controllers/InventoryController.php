<?php
/**
 * Inventory Controller
 * 
 * Handles inventory items for businesses
 */
class InventoryController {
    /**
     * Get all inventory items with filters
     * 
     * @param array $params Query parameters for filtering
     */
    public function getAllInventory($params = []) {
        // Build query
        $sql = "SELECT i.*, p.title as part_title, p.sku as part_sku, p.image_url as part_image, 
                       bp.business_name
                FROM inventory i 
                JOIN parts p ON i.part_id = p.id
                JOIN business_profiles bp ON i.business_id = bp.id";
        
        $whereConditions = [];
        $queryParams = [];
        $paramTypes = '';
        
        // Filter by business
        if (!empty($params['business_id'])) {
            $whereConditions[] = "i.business_id = ?";
            $queryParams[] = (int)$params['business_id'];
            $paramTypes .= 'i';
        }
        
        // Filter by part
        if (!empty($params['part_id'])) {
            $whereConditions[] = "i.part_id = ?";
            $queryParams[] = (int)$params['part_id'];
            $paramTypes .= 'i';
        }
        
        // Filter by condition
        if (!empty($params['condition'])) {
            $whereConditions[] = "i.condition = ?";
            $queryParams[] = $params['condition'];
            $paramTypes .= 's';
        }
        
        // Filter by price range
        if (!empty($params['min_price'])) {
            $whereConditions[] = "i.price >= ?";
            $queryParams[] = (float)$params['min_price'];
            $paramTypes .= 'd';
        }
        
        if (!empty($params['max_price'])) {
            $whereConditions[] = "i.price <= ?";
            $queryParams[] = (float)$params['max_price'];
            $paramTypes .= 'd';
        }
        
        // Filter by in-stock items only
        if (isset($params['in_stock']) && $params['in_stock'] === 'true') {
            $whereConditions[] = "i.quantity > 0";
        }
        
        // Add WHERE clause if filters exist
        if (!empty($whereConditions)) {
            $sql .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        // Add sorting
        if (!empty($params['sort'])) {
            switch ($params['sort']) {
                case 'price_asc':
                    $sql .= " ORDER BY i.price ASC";
                    break;
                case 'price_desc':
                    $sql .= " ORDER BY i.price DESC";
                    break;
                case 'newest':
                    $sql .= " ORDER BY i.created_at DESC";
                    break;
                default:
                    $sql .= " ORDER BY i.id DESC";
            }
        } else {
            $sql .= " ORDER BY i.id DESC";
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
            Response::serverError('Failed to fetch inventory items');
        }
        
        // Fetch all inventory items
        $inventoryItems = [];
        while ($row = $result->fetch_assoc()) {
            $inventoryItems[] = $row;
        }
        
        // Get total count for pagination
        $countSql = "SELECT COUNT(*) as total FROM inventory i";
        if (!empty($whereConditions)) {
            $countSql .= " WHERE " . implode(' AND ', $whereConditions);
        }
        
        $countResult = executeQuery($countSql, array_slice($queryParams, 0, -2), substr($paramTypes, 0, -2));
        $totalCount = $countResult->fetch_assoc()['total'];
        
        // Return response
        Response::success([
            'inventory' => $inventoryItems,
            'pagination' => [
                'total' => (int)$totalCount,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
    }
    
    /**
     * Get inventory by ID
     * 
     * @param int $id Inventory ID
     */
    public function getInventoryById($id) {
        $sql = "SELECT i.*, p.title as part_title, p.description as part_description, 
                       p.sku as part_sku, p.image_url as part_image, p.manufacturer as part_manufacturer,
                       bp.business_name, bp.address as business_address, bp.city as business_city,
                       bp.state as business_state, bp.country as business_country
                FROM inventory i 
                JOIN parts p ON i.part_id = p.id
                JOIN business_profiles bp ON i.business_id = bp.id
                WHERE i.id = ?";
        
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            Response::notFound('Inventory item not found');
        }
        
        $inventoryItem = $result->fetch_assoc();
        
        // Return response
        Response::success($inventoryItem);
    }
    
    /**
     * Get inventory for a specific business
     * 
     * @param int $businessId Business ID
     */
    public function getBusinessInventory($businessId) {
        // Verify business exists
        $checkBusinessSql = "SELECT id FROM business_profiles WHERE id = ?";
        $checkBusinessResult = executeQuery($checkBusinessSql, [$businessId], 'i');
        
        if ($checkBusinessResult->num_rows === 0) {
            Response::notFound('Business not found');
        }
        
        $sql = "SELECT i.*, p.title as part_title, p.sku as part_sku, p.image_url as part_image, 
                       p.category_id, pc.name as category_name
                FROM inventory i 
                JOIN parts p ON i.part_id = p.id
                JOIN part_categories pc ON p.category_id = pc.id
                WHERE i.business_id = ?
                ORDER BY i.created_at DESC";
        
        $result = executeQuery($sql, [$businessId], 'i');
        
        if (!$result) {
            Response::serverError('Failed to fetch business inventory');
        }
        
        // Fetch all inventory items
        $inventoryItems = [];
        while ($row = $result->fetch_assoc()) {
            $inventoryItems[] = $row;
        }
        
        // Return response
        Response::success($inventoryItems);
    }
    
    /**
     * Add an inventory item
     * 
     * @param array $data Inventory data
     */
    public function addInventory($data) {
        // Validate required fields
        $requiredFields = ['business_id', 'part_id', 'price', 'quantity', 'condition'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                Response::badRequest("Missing required field: {$field}");
            }
        }
        
        // Validate business exists
        $checkBusinessSql = "SELECT id FROM business_profiles WHERE id = ?";
        $checkBusinessResult = executeQuery($checkBusinessSql, [$data['business_id']], 'i');
        
        if ($checkBusinessResult->num_rows === 0) {
            Response::badRequest('Business not found');
        }
        
        // Validate part exists
        $checkPartSql = "SELECT id FROM parts WHERE id = ?";
        $checkPartResult = executeQuery($checkPartSql, [$data['part_id']], 'i');
        
        if ($checkPartResult->num_rows === 0) {
            Response::badRequest('Part not found');
        }
        
        // Validate condition
        if (!in_array($data['condition'], ['new', 'used', 'refurbished'])) {
            Response::badRequest('Invalid condition value. Must be: new, used, or refurbished');
        }
        
        // Validate price and quantity are positive
        if ($data['price'] <= 0) {
            Response::badRequest('Price must be greater than zero');
        }
        
        if ($data['quantity'] < 0) {
            Response::badRequest('Quantity cannot be negative');
        }
        
        // Check if inventory for this part and business already exists
        $checkDuplicateSql = "SELECT id FROM inventory WHERE business_id = ? AND part_id = ? AND condition = ?";
        $checkDuplicateResult = executeQuery($checkDuplicateSql, [
            $data['business_id'],
            $data['part_id'],
            $data['condition']
        ], 'iis');
        
        if ($checkDuplicateResult->num_rows > 0) {
            Response::badRequest('Inventory for this part, condition, and business already exists. Please update existing inventory instead.');
        }
        
        // Insert inventory
        $sql = "INSERT INTO inventory (business_id, part_id, price, sale_price, quantity, condition, shipping_cost, minimum_days, maximum_days) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data['business_id'],
            $data['part_id'],
            $data['price'],
            $data['sale_price'] ?? null,
            $data['quantity'],
            $data['condition'],
            $data['shipping_cost'] ?? null,
            $data['minimum_days'] ?? null,
            $data['maximum_days'] ?? null
        ];
        
        $inventoryId = executeQuery($sql, $params, 'iiddiidii');
        
        if (!$inventoryId) {
            Response::serverError('Failed to add inventory item');
        }
        
        // Return success with new inventory ID
        Response::success(['id' => $inventoryId], 201);
    }
    
    /**
     * Update an inventory item
     * 
     * @param int $id Inventory ID
     * @param array $data Updated inventory data
     */
    public function updateInventory($id, $data) {
        // Check if inventory exists
        $checkSql = "SELECT business_id FROM inventory WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Inventory item not found');
        }
        
        // Build update query
        $updates = [];
        $params = [];
        $types = '';
        
        if (isset($data['price'])) {
            if ($data['price'] <= 0) {
                Response::badRequest('Price must be greater than zero');
            }
            $updates[] = "price = ?";
            $params[] = $data['price'];
            $types .= 'd';
        }
        
        if (isset($data['sale_price'])) {
            $updates[] = "sale_price = ?";
            $params[] = $data['sale_price'];
            $types .= 'd';
        }
        
        if (isset($data['quantity'])) {
            if ($data['quantity'] < 0) {
                Response::badRequest('Quantity cannot be negative');
            }
            $updates[] = "quantity = ?";
            $params[] = $data['quantity'];
            $types .= 'i';
        }
        
        if (isset($data['condition'])) {
            if (!in_array($data['condition'], ['new', 'used', 'refurbished'])) {
                Response::badRequest('Invalid condition value. Must be: new, used, or refurbished');
            }
            $updates[] = "condition = ?";
            $params[] = $data['condition'];
            $types .= 's';
        }
        
        if (isset($data['shipping_cost'])) {
            $updates[] = "shipping_cost = ?";
            $params[] = $data['shipping_cost'];
            $types .= 'd';
        }
        
        if (isset($data['minimum_days'])) {
            $updates[] = "minimum_days = ?";
            $params[] = $data['minimum_days'];
            $types .= 'i';
        }
        
        if (isset($data['maximum_days'])) {
            $updates[] = "maximum_days = ?";
            $params[] = $data['maximum_days'];
            $types .= 'i';
        }
        
        // Add updated_at timestamp
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        
        // If no fields to update
        if (empty($updates)) {
            Response::badRequest('No fields to update');
        }
        
        // Build the query
        $sql = "UPDATE inventory SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';
        
        // Execute update
        $result = executeQuery($sql, $params, $types);
        
        if ($result === false) {
            Response::serverError('Failed to update inventory item');
        }
        
        // Return success
        Response::success(['id' => $id, 'message' => 'Inventory updated successfully']);
    }
    
    /**
     * Remove an inventory item
     * 
     * @param int $id Inventory ID
     */
    public function removeInventory($id) {
        // Check if inventory exists
        $checkSql = "SELECT id FROM inventory WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Inventory item not found');
        }
        
        // Check if inventory is used in any orders
        $checkOrdersSql = "SELECT id FROM order_items WHERE inventory_id = ?";
        $checkOrdersResult = executeQuery($checkOrdersSql, [$id], 'i');
        
        if ($checkOrdersResult->num_rows > 0) {
            Response::badRequest('Cannot delete inventory item that is associated with orders');
        }
        
        // Delete inventory
        $sql = "DELETE FROM inventory WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if ($result === false) {
            Response::serverError('Failed to delete inventory item');
        }
        
        // Return success
        Response::success(['message' => 'Inventory item deleted successfully']);
    }
}
?>