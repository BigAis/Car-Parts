<?php
/**
 * Users Controller
 * 
 * Handles user registration, authentication, and profile management
 */
class UsersController {
    /**
     * Register a new user
     * 
     * @param array $data User data
     */
    public function register($data) {
        // Validate required fields
        $requiredFields = ['username', 'email', 'password', 'user_type', 'first_name', 'last_name', 'phone'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                Response::badRequest("Missing required field: {$field}");
            }
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::badRequest('Invalid email format');
        }
        
        // Validate user type
        if (!in_array($data['user_type'], ['customer', 'business'])) {
            Response::badRequest('Invalid user type');
        }
        
        // Check if business type has required business fields
        if ($data['user_type'] === 'business') {
            $businessFields = ['business_name', 'address', 'city', 'postal_code', 'country'];
            foreach ($businessFields as $field) {
                if (empty($data[$field])) {
                    Response::badRequest("Missing required business field: {$field}");
                }
            }
        }
        
        // Check if username already exists
        $checkUsernameSql = "SELECT id FROM users WHERE username = ?";
        $checkUsernameResult = executeQuery($checkUsernameSql, [$data['username']], 's');
        
        if ($checkUsernameResult->num_rows > 0) {
            Response::badRequest('Username already exists');
        }
        
        // Check if email already exists
        $checkEmailSql = "SELECT id FROM users WHERE email = ?";
        $checkEmailResult = executeQuery($checkEmailSql, [$data['email']], 's');
        
        if ($checkEmailResult->num_rows > 0) {
            Response::badRequest('Email already exists');
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Start transaction
        $conn = getDbConnection();
        $conn->begin_transaction();
        
        try {
            // Insert user
            $insertUserSql = "INSERT INTO users (username, email, password, user_type, first_name, last_name, phone) 
                              VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $userParams = [
                $data['username'],
                $data['email'],
                $hashedPassword,
                $data['user_type'],
                $data['first_name'],
                $data['last_name'],
                $data['phone']
            ];
            
            $userId = executeQuery($insertUserSql, $userParams, 'sssssss');
            
            if (!$userId) {
                throw new Exception('Failed to create user');
            }
            
            // If business user, create business profile
            if ($data['user_type'] === 'business') {
                $insertBusinessSql = "INSERT INTO business_profiles (user_id, business_name, address, city, state, postal_code, country, tax_id, phone) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $businessParams = [
                    $userId,
                    $data['business_name'],
                    $data['address'],
                    $data['city'],
                    $data['state'] ?? null,
                    $data['postal_code'],
                    $data['country'],
                    $data['tax_id'] ?? null,
                    $data['phone']
                ];
                
                $businessProfileId = executeQuery($insertBusinessSql, $businessParams, 'issssssss');
                
                if (!$businessProfileId) {
                    throw new Exception('Failed to create business profile');
                }
            } else {
                // Create customer profile
                $insertCustomerSql = "INSERT INTO customer_profiles (user_id) VALUES (?)";
                $customerProfileId = executeQuery($insertCustomerSql, [$userId], 'i');
                
                if (!$customerProfileId) {
                    throw new Exception('Failed to create customer profile');
                }
            }
            
            // Commit transaction
            $conn->commit();
            
            // Return success
            Response::success(['message' => 'User registered successfully'], 201);
        } catch (Exception $e) {
            // Rollback transaction on error
            $conn->rollback();
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * User login
     * 
     * @param array $data Login credentials
     */
    public function login($data) {
        // Validate required fields
        if (empty($data['email']) || empty($data['password'])) {
            Response::badRequest('Email and password are required');
        }
        
        // Get user by email
        $sql = "SELECT u.*, 
                CASE 
                    WHEN u.user_type = 'business' THEN bp.id 
                    ELSE cp.id 
                END as profile_id
                FROM users u 
                LEFT JOIN business_profiles bp ON u.id = bp.user_id AND u.user_type = 'business'
                LEFT JOIN customer_profiles cp ON u.id = cp.user_id AND u.user_type = 'customer'
                WHERE u.email = ?";
        
        $result = executeQuery($sql, [$data['email']], 's');
        
        if ($result->num_rows === 0) {
            Response::unauthorized('Invalid email or password');
        }
        
        $user = $result->fetch_assoc();
        
        // Verify password
        if (!password_verify($data['password'], $user['password'])) {
            Response::unauthorized('Invalid email or password');
        }
        
        // Generate JWT token
        $token = $this->generateToken($user);
        
        // Remove password from response
        unset($user['password']);
        
        // Return user data and token
        Response::success([
            'user' => $user,
            'token' => $token
        ]);
    }
    
    /**
     * Get user profile by ID
     * 
     * @param int $id User ID
     */
    public function getUserById($id) {
        // Check if user is authorized to view this profile
        // This would require authentication middleware
        
        // Get user data
        $sql = "SELECT u.id, u.username, u.email, u.user_type, u.first_name, u.last_name, u.phone, u.created_at 
                FROM users u 
                WHERE u.id = ?";
        
        $result = executeQuery($sql, [$id], 'i');
        
        if ($result->num_rows === 0) {
            Response::notFound('User not found');
        }
        
        $user = $result->fetch_assoc();
        
        // Get additional profile data based on user type
        if ($user['user_type'] === 'business') {
            $profileSql = "SELECT * FROM business_profiles WHERE user_id = ?";
        } else {
            $profileSql = "SELECT * FROM customer_profiles WHERE user_id = ?";
        }
        
        $profileResult = executeQuery($profileSql, [$id], 'i');
        
        if ($profileResult->num_rows > 0) {
            $user['profile'] = $profileResult->fetch_assoc();
        }
        
        // Return user data
        Response::success($user);
    }
    
    /**
     * Update user profile
     * 
     * @param int $id User ID
     * @param array $data Updated user data
     */
    public function updateUser($id, $data) {
        // Authorization check would go here
        
        // Get user data to check if exists
        $checkSql = "SELECT id, user_type FROM users WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('User not found');
        }
        
        $user = $checkResult->fetch_assoc();
        
        // Start transaction
        $conn = getDbConnection();
        $conn->begin_transaction();
        
        try {
            // Update user fields if provided
            $userUpdates = [];
            $userParams = [];
            $userTypes = '';
            
            if (isset($data['first_name'])) {
                $userUpdates[] = "first_name = ?";
                $userParams[] = $data['first_name'];
                $userTypes .= 's';
            }
            
            if (isset($data['last_name'])) {
                $userUpdates[] = "last_name = ?";
                $userParams[] = $data['last_name'];
                $userTypes .= 's';
            }
            
            if (isset($data['phone'])) {
                $userUpdates[] = "phone = ?";
                $userParams[] = $data['phone'];
                $userTypes .= 's';
            }
            
            if (isset($data['password'])) {
                $userUpdates[] = "password = ?";
                $userParams[] = password_hash($data['password'], PASSWORD_DEFAULT);
                $userTypes .= 's';
            }
            
            // Update user if fields provided
            if (!empty($userUpdates)) {
                $userParams[] = $id;
                $userTypes .= 'i';
                
                $updateUserSql = "UPDATE users SET " . implode(', ', $userUpdates) . " WHERE id = ?";
                $result = executeQuery($updateUserSql, $userParams, $userTypes);
                
                if ($result === false) {
                    throw new Exception('Failed to update user');
                }
            }
            
            // Update profile based on user type
            if ($user['user_type'] === 'business' && isset($data['business'])) {
                // Update business profile
                $this->updateBusinessProfile($id, $data['business']);
            } elseif ($user['user_type'] === 'customer' && isset($data['customer'])) {
                // Update customer profile
                $this->updateCustomerProfile($id, $data['customer']);
            }
            
            // Commit transaction
            $conn->commit();
            
            // Return success
            Response::success(['message' => 'User updated successfully']);
        } catch (Exception $e) {
            // Rollback transaction on error
            $conn->rollback();
            Response::serverError($e->getMessage());
        }
    }
    
    /**
     * Delete user account
     * 
     * @param int $id User ID
     */
    public function deleteUser($id) {
        // Authorization check would go here
        
        // Check if user exists
        $checkSql = "SELECT id FROM users WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('User not found');
        }
        
        // Delete user (foreign key constraints will handle related data)
        $deleteSql = "DELETE FROM users WHERE id = ?";
        $result = executeQuery($deleteSql, [$id], 'i');
        
        if ($result === false) {
            Response::serverError('Failed to delete user');
        }
        
        // Return success
        Response::success(['message' => 'User deleted successfully']);
    }
    
    /**
     * Generate JWT token for user authentication
     * 
     * @param array $user User data
     * @return string JWT token
     */
    private function generateToken($user) {
        // This is a simplified version. In production, use a proper JWT library.
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        
        $payload = [
            'sub' => $user['id'],
            'name' => $user['username'],
            'email' => $user['email'],
            'type' => $user['user_type'],
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24) // 24 hours
        ];
        
        $payload = base64_encode(json_encode($payload));
        
        // Secret key should be stored securely in environment variables
        $secret = 'your-secure-secret-key';
        
        $signature = hash_hmac('sha256', "$header.$payload", $secret, true);
        $signature = base64_encode($signature);
        
        return "$header.$payload.$signature";
    }
    
    /**
     * Update business profile
     * 
     * @param int $userId User ID
     * @param array $data Profile data
     */
    private function updateBusinessProfile($userId, $data) {
        $updates = [];
        $params = [];
        $types = '';
        
        if (isset($data['business_name'])) {
            $updates[] = "business_name = ?";
            $params[] = $data['business_name'];
            $types .= 's';
        }
        
        if (isset($data['address'])) {
            $updates[] = "address = ?";
            $params[] = $data['address'];
            $types .= 's';
        }
        
        if (isset($data['city'])) {
            $updates[] = "city = ?";
            $params[] = $data['city'];
            $types .= 's';
        }
        
        if (isset($data['state'])) {
            $updates[] = "state = ?";
            $params[] = $data['state'];
            $types .= 's';
        }
        
        if (isset($data['postal_code'])) {
            $updates[] = "postal_code = ?";
            $params[] = $data['postal_code'];
            $types .= 's';
        }
        
        if (isset($data['country'])) {
            $updates[] = "country = ?";
            $params[] = $data['country'];
            $types .= 's';
        }
        
        if (isset($data['tax_id'])) {
            $updates[] = "tax_id = ?";
            $params[] = $data['tax_id'];
            $types .= 's';
        }
        
        if (isset($data['website'])) {
            $updates[] = "website = ?";
            $params[] = $data['website'];
            $types .= 's';
        }
        
        if (isset($data['logo_url'])) {
            $updates[] = "logo_url = ?";
            $params[] = $data['logo_url'];
            $types .= 's';
        }
        
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = $data['description'];
            $types .= 's';
        }
        
        if (empty($updates)) {
            return;
        }
        
        $params[] = $userId;
        $types .= 'i';
        
        $sql = "UPDATE business_profiles SET " . implode(', ', $updates) . " WHERE user_id = ?";
        $result = executeQuery($sql, $params, $types);
        
        if ($result === false) {
            throw new Exception('Failed to update business profile');
        }
    }
    
    /**
     * Update customer profile
     * 
     * @param int $userId User ID
     * @param array $data Profile data
     */
    private function updateCustomerProfile($userId, $data) {
        $updates = [];
        $params = [];
        $types = '';
        
        if (isset($data['address'])) {
            $updates[] = "address = ?";
            $params[] = $data['address'];
            $types .= 's';
        }
        
        if (isset($data['city'])) {
            $updates[] = "city = ?";
            $params[] = $data['city'];
            $types .= 's';
        }
        
        if (isset($data['state'])) {
            $updates[] = "state = ?";
            $params[] = $data['state'];
            $types .= 's';
        }
        
        if (isset($data['postal_code'])) {
            $updates[] = "postal_code = ?";
            $params[] = $data['postal_code'];
            $types .= 's';
        }
        
        if (isset($data['country'])) {
            $updates[] = "country = ?";
            $params[] = $data['country'];
            $types .= 's';
        }
        
        if (empty($updates)) {
            return;
        }
        
        $params[] = $userId;
        $types .= 'i';
        
        $sql = "UPDATE customer_profiles SET " . implode(', ', $updates) . " WHERE user_id = ?";
        $result = executeQuery($sql, $params, $types);
        
        if ($result === false) {
            throw new Exception('Failed to update customer profile');
        }
    }
}