<?php
/**
 * Part Model
 * 
 * Handles part data operations
 */
class Part {
    private $id;
    private $categoryId;
    private $title;
    private $description;
    private $sku;
    private $manufacturer;
    private $weight;
    private $dimensions;
    private $imageUrl;
    private $createdAt;
    private $updatedAt;
    
    /**
     * Find a part by ID
     * 
     * @param int $id Part ID
     * @return array|null Part data or null if not found
     */
    public static function findById($id) {
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id 
                WHERE p.id = ?";
        
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            return null;
        }
        
        return $result->fetch_assoc();
    }
    
    /**
     * Find parts by category ID
     * 
     * @param int $categoryId Category ID
     * @param int $limit Number of results to return
     * @param int $offset Offset for pagination
     * @return array Parts data
     */
    public static function findByCategory($categoryId, $limit = 20, $offset = 0) {
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id 
                WHERE p.category_id = ? 
                LIMIT ?, ?";
        
        $result = executeQuery($sql, [$categoryId, $offset, $limit], 'iii');
        
        if (!$result) {
            return [];
        }
        
        $parts = [];
        while ($row = $result->fetch_assoc()) {
            $parts[] = $row;
        }
        
        return $parts;
    }
    
    /**
     * Search parts by keyword
     * 
     * @param string $keyword Search term
     * @param int $limit Number of results to return
     * @param int $offset Offset for pagination
     * @return array Parts data
     */
    public static function search($keyword, $limit = 20, $offset = 0) {
        $searchTerm = '%' . $keyword . '%';
        
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id 
                WHERE p.title LIKE ? OR p.description LIKE ? OR p.sku LIKE ? 
                LIMIT ?, ?";
        
        $result = executeQuery($sql, [$searchTerm, $searchTerm, $searchTerm, $offset, $limit], 'sssii');
        
        if (!$result) {
            return [];
        }
        
        $parts = [];
        while ($row = $result->fetch_assoc()) {
            $parts[] = $row;
        }
        
        return $parts;
    }
    
    /**
     * Get all parts with optional pagination
     * 
     * @param int $limit Number of results to return
     * @param int $offset Offset for pagination
     * @return array Parts data
     */
    public static function getAll($limit = 20, $offset = 0) {
        $sql = "SELECT p.*, pc.name as category_name 
                FROM parts p 
                JOIN part_categories pc ON p.category_id = pc.id 
                ORDER BY p.id DESC 
                LIMIT ?, ?";
        
        $result = executeQuery($sql, [$offset, $limit], 'ii');
        
        if (!$result) {
            return [];
        }
        
        $parts = [];
        while ($row = $result->fetch_assoc()) {
            $parts[] = $row;
        }
        
        return $parts;
    }
    
    /**
     * Create a new part
     * 
     * @param array $data Part data
     * @return int|false New part ID or false on failure
     */
    public static function create($data) {
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
        
        return executeQuery($sql, $params, 'issssdss');
    }
    
    /**
     * Update a part
     * 
     * @param int $id Part ID
     * @param array $data Part data to update
     * @return bool True on success, false on failure
     */
    public static function update($id, $data) {
        $updates = [];
        $params = [];
        $types = '';
        
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
        
        if (empty($updates)) {
            return false;
        }
        
        $sql = "UPDATE parts SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';
        
        $result = executeQuery($sql, $params, $types);
        
        return $result !== false;
    }
    
    /**
     * Delete a part
     * 
     * @param int $id Part ID
     * @return bool True on success, false on failure
     */
    public static function delete($id) {
        $sql = "DELETE FROM parts WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        return $result !== false;
    }
}
?>