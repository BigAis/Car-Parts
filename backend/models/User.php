<?php
/**
 * User Model
 * 
 * Handles user data operations
 */
class User {
    private $id;
    private $username;
    private $email;
    private $password;
    private $userType;
    private $firstName;
    private $lastName;
    private $phone;
    private $createdAt;
    private $updatedAt;
    
    /**
     * Find a user by ID
     * 
     * @param int $id User ID
     * @return array|null User data or null if not found
     */
    public static function findById($id) {
        $sql = "SELECT * FROM users WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            return null;
        }
        
        return $result->fetch_assoc();
    }
    
    /**
     * Find a user by email
     * 
     * @param string $email User email
     * @return array|null User data or null if not found
     */
    public static function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $result = executeQuery($sql, [$email], 's');
        
        if (!$result || $result->num_rows === 0) {
            return null;
        }
        
        return $result->fetch_assoc();
    }
    
    /**
     * Find a user by username
     * 
     * @param string $username Username
     * @return array|null User data or null if not found
     */
    public static function findByUsername($username) {
        $sql = "SELECT * FROM users WHERE username = ?";
        $result = executeQuery($sql, [$username], 's');
        
        if (!$result || $result->num_rows === 0) {
            return null;
        }
        
        return $result->fetch_assoc();
    }
    
    /**
     * Create a new user
     * 
     * @param array $data User data
     * @return int|false New user ID or false on failure
     */
    public static function create($data) {
        $sql = "INSERT INTO users (username, email, password, user_type, first_name, last_name, phone) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data['username'],
            $data['email'],
            $data['password'], // Should be hashed before calling this method
            $data['user_type'],
            $data['first_name'],
            $data['last_name'],
            $data['phone']
        ];
        
        return executeQuery($sql, $params, 'sssssss');
    }
    
    /**
     * Update a user
     * 
     * @param int $id User ID
     * @param array $data User data to update
     * @return bool True on success, false on failure
     */
    public static function update($id, $data) {
        $updates = [];
        $params = [];
        $types = '';
        
        if (isset($data['first_name'])) {
            $updates[] = "first_name = ?";
            $params[] = $data['first_name'];
            $types .= 's';
        }
        
        if (isset($data['last_name'])) {
            $updates[] = "last_name = ?";
            $params[] = $data['last_name'];
            $types .= 's';
        }
        
        if (isset($data['email'])) {
            $updates[] = "email = ?";
            $params[] = $data['email'];
            $types .= 's';
        }
        
        if (isset($data['phone'])) {
            $updates[] = "phone = ?";
            $params[] = $data['phone'];
            $types .= 's';
        }
        
        if (isset($data['password'])) {
            $updates[] = "password = ?";
            $params[] = $data['password']; // Should be hashed before calling this method
            $types .= 's';
        }
        
        if (empty($updates)) {
            return false;
        }
        
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';
        
        $result = executeQuery($sql, $params, $types);
        
        return $result !== false;
    }
    
    /**
     * Delete a user
     * 
     * @param int $id User ID
     * @return bool True on success, false on failure
     */
    public static function delete($id) {
        $sql = "DELETE FROM users WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        return $result !== false;
    }
}
?>