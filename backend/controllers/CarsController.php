<?php
/**
 * Cars Controller
 * 
 * Handles car makes and models operations
 */
class CarsController {
    /**
     * Get all car makes
     */
    public function getAllMakes() {
        $sql = "SELECT * FROM car_makes ORDER BY name ASC";
        $result = executeQuery($sql);
        
        if (!$result) {
            Response::serverError('Failed to fetch car makes');
        }
        
        $makes = [];
        while ($row = $result->fetch_assoc()) {
            $makes[] = $row;
        }
        
        Response::success($makes);
    }
    
    /**
     * Get models by make ID
     * 
     * @param int $makeId Make ID
     */
    public function getModelsByMake($makeId) {
        // Verify make exists
        $checkSql = "SELECT id FROM car_makes WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$makeId], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Car make not found');
        }
        
        // Get models for the make
        $sql = "SELECT * FROM car_models WHERE make_id = ? ORDER BY name ASC";
        $result = executeQuery($sql, [$makeId], 'i');
        
        if (!$result) {
            Response::serverError('Failed to fetch car models');
        }
        
        $models = [];
        while ($row = $result->fetch_assoc()) {
            $models[] = $row;
        }
        
        Response::success($models);
    }
    
    /**
     * Create a new car make
     * 
     * @param array $data Make data
     */
    public function createMake($data) {
        // Validate required fields
        if (empty($data['name'])) {
            Response::badRequest('Make name is required');
        }
        
        // Check if make already exists
        $checkSql = "SELECT id FROM car_makes WHERE name = ?";
        $checkResult = executeQuery($checkSql, [$data['name']], 's');
        
        if ($checkResult->num_rows > 0) {
            Response::badRequest('Car make already exists');
        }
        
        // Insert make
        $sql = "INSERT INTO car_makes (name) VALUES (?)";
        $makeId = executeQuery($sql, [$data['name']], 's');
        
        if (!$makeId) {
            Response::serverError('Failed to create car make');
        }
        
        Response::success(['id' => $makeId], 201);
    }
    
    /**
     * Create a new car model
     * 
     * @param array $data Model data
     */
    public function createModel($data) {
        // Validate required fields
        if (empty($data['make_id']) || empty($data['name'])) {
            Response::badRequest('Make ID and model name are required');
        }
        
        // Check if make exists
        $checkMakeSql = "SELECT id FROM car_makes WHERE id = ?";
        $checkMakeResult = executeQuery($checkMakeSql, [$data['make_id']], 'i');
        
        if ($checkMakeResult->num_rows === 0) {
            Response::badRequest('Car make not found');
        }
        
        // Check if model already exists for this make
        $checkModelSql = "SELECT id FROM car_models WHERE make_id = ? AND name = ?";
        $checkModelResult = executeQuery($checkModelSql, [$data['make_id'], $data['name']], 'is');
        
        if ($checkModelResult->num_rows > 0) {
            Response::badRequest('Car model already exists for this make');
        }
        
        // Insert model
        $sql = "INSERT INTO car_models (make_id, name, year_from, year_to) VALUES (?, ?, ?, ?)";
        
        $params = [
            (int)$data['make_id'],
            $data['name'],
            $data['year_from'] ?? null,
            $data['year_to'] ?? null
        ];
        
        $modelId = executeQuery($sql, $params, 'isii');
        
        if (!$modelId) {
            Response::serverError('Failed to create car model');
        }
        
        Response::success(['id' => $modelId], 201);
    }
    
    /**
     * Update car make
     * 
     * @param int $id Make ID
     * @param array $data Updated make data
     */
    public function updateMake($id, $data) {
        // Check if make exists
        $checkSql = "SELECT id FROM car_makes WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Car make not found');
        }
        
        // Validate required fields
        if (empty($data['name'])) {
            Response::badRequest('Make name is required');
        }
        
        // Check if new name already exists for another make
        $checkNameSql = "SELECT id FROM car_makes WHERE name = ? AND id != ?";
        $checkNameResult = executeQuery($checkNameSql, [$data['name'], $id], 'si');
        
        if ($checkNameResult->num_rows > 0) {
            Response::badRequest('Car make with this name already exists');
        }
        
        // Update make
        $sql = "UPDATE car_makes SET name = ? WHERE id = ?";
        $result = executeQuery($sql, [$data['name'], $id], 'si');
        
        if ($result === false) {
            Response::serverError('Failed to update car make');
        }
        
        Response::success(['message' => 'Car make updated successfully']);
    }
    
    /**
     * Update car model
     * 
     * @param int $id Model ID
     * @param array $data Updated model data
     */
    public function updateModel($id, $data) {
        // Check if model exists
        $checkSql = "SELECT id FROM car_models WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Car model not found');
        }
        
        // Build update query
        $updates = [];
        $params = [];
        $types = '';
        
        if (isset($data['name'])) {
            $updates[] = "name = ?";
            $params[] = $data['name'];
            $types .= 's';
        }
        
        if (isset($data['make_id'])) {
            // Check if make exists
            $checkMakeSql = "SELECT id FROM car_makes WHERE id = ?";
            $checkMakeResult = executeQuery($checkMakeSql, [$data['make_id']], 'i');
            
            if ($checkMakeResult->num_rows === 0) {
                Response::badRequest('Car make not found');
            }
            
            $updates[] = "make_id = ?";
            $params[] = (int)$data['make_id'];
            $types .= 'i';
        }
        
        if (isset($data['year_from'])) {
            $updates[] = "year_from = ?";
            $params[] = (int)$data['year_from'];
            $types .= 'i';
        }
        
        if (isset($data['year_to'])) {
            $updates[] = "year_to = ?";
            $params[] = (int)$data['year_to'];
            $types .= 'i';
        }
        
        if (empty($updates)) {
            Response::badRequest('No fields to update');
        }
        
        // Check if model name already exists for the same make
        if (isset($data['name']) && isset($data['make_id'])) {
            $checkDuplicateSql = "SELECT id FROM car_models WHERE name = ? AND make_id = ? AND id != ?";
            $checkDuplicateResult = executeQuery($checkDuplicateSql, [$data['name'], $data['make_id'], $id], 'sii');
            
            if ($checkDuplicateResult->num_rows > 0) {
                Response::badRequest('Car model with this name already exists for the selected make');
            }
        }
        
        // Add ID to parameters
        $params[] = $id;
        $types .= 'i';
        
        // Update model
        $sql = "UPDATE car_models SET " . implode(', ', $updates) . " WHERE id = ?";
        $result = executeQuery($sql, $params, $types);
        
        if ($result === false) {
            Response::serverError('Failed to update car model');
        }
        
        Response::success(['message' => 'Car model updated successfully']);
    }
    
    /**
     * Delete car make
     * 
     * @param int $id Make ID
     */
    public function deleteMake($id) {
        // Check if make exists
        $checkSql = "SELECT id FROM car_makes WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Car make not found');
        }
        
        // Check if make has models
        $checkModelsSql = "SELECT id FROM car_models WHERE make_id = ?";
        $checkModelsResult = executeQuery($checkModelsSql, [$id], 'i');
        
        if ($checkModelsResult->num_rows > 0) {
            Response::badRequest('Cannot delete make that has models. Delete all models first.');
        }
        
        // Delete make
        $sql = "DELETE FROM car_makes WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if ($result === false) {
            Response::serverError('Failed to delete car make');
        }
        
        Response::success(['message' => 'Car make deleted successfully']);
    }
    
    /**
     * Delete car model
     * 
     * @param int $id Model ID
     */
    public function deleteModel($id) {
        // Check if model exists
        $checkSql = "SELECT id FROM car_models WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Car model not found');
        }
        
        // Check if model is used in part compatibility
        $checkCompatSql = "SELECT id FROM part_compatibility WHERE model_id = ?";
        $checkCompatResult = executeQuery($checkCompatSql, [$id], 'i');
        
        if ($checkCompatResult->num_rows > 0) {
            Response::badRequest('Cannot delete model that is used in part compatibility. Remove compatibility entries first.');
        }
        
        // Delete model
        $sql = "DELETE FROM car_models WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if ($result === false) {
            Response::serverError('Failed to delete car model');
        }
        
        Response::success(['message' => 'Car model deleted successfully']);
    }
}
?>