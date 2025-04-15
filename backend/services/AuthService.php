<?php
/**
 * Authentication Service
 * 
 * Handles user authentication and JWT token generation
 */
class AuthService {
    /**
     * Authenticate a user with email and password
     * 
     * @param string $email User email
     * @param string $password User password
     * @return array|false User data and token if successful, false otherwise
     */
    public static function authenticate($email, $password) {
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
        
        $result = executeQuery($sql, [$email], 's');
        
        if ($result->num_rows === 0) {
            return false;
        }
        
        $user = $result->fetch_assoc();
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            return false;
        }
        
        // Generate JWT token
        $token = self::generateToken($user);
        
        // Remove password from result
        unset($user['password']);
        
        return [
            'user' => $user,
            'token' => $token
        ];
    }
    
    /**
     * Generate JWT token for a user
     * 
     * @param array $user User data
     * @return string JWT token
     */
    public static function generateToken($user) {
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
     * Validate a JWT token
     * 
     * @param string $token JWT token
     * @return array|false Payload if valid, false otherwise
     */
    public static function validateToken($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        // Verify signature
        $secret = 'your-secure-secret-key';
        $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        
        if ($signature !== $expectedSignature) {
            return false;
        }
        
        // Decode payload
        $decodedPayload = json_decode(base64_decode($payload), true);
        
        // Check expiration
        if (!isset($decodedPayload['exp']) || $decodedPayload['exp'] < time()) {
            return false;
        }
        
        return $decodedPayload;
    }
    
    /**
     * Register a new user
     * 
     * @param array $data User registration data
     * @return bool True on success, false on failure
     */
    public static function register($data) {
        // Hash password
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Start transaction
        $conn = getDbConnection();
        $conn->begin_transaction();
        
        try {
            // Insert user
            $userId = User::create($data);
            
            if (!$userId) {
                throw new Exception('Failed to create user');
            }
            
            // Create profile based on user type
            if ($data['user_type'] === 'business') {
                $businessData = [
                    'user_id' => $userId,
                    'business_name' => $data['business_name'],
                    'address' => $data['address'],
                    'city' => $data['city'],
                    'state' => $data['state'] ?? null,
                    'postal_code' => $data['postal_code'],
                    'country' => $data['country'],
                    'tax_id' => $data['tax_id'] ?? null,
                    'phone' => $data['phone']
                ];
                
                $sql = "INSERT INTO business_profiles (user_id, business_name, address, city, state, postal_code, country, tax_id, phone) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $params = array_values($businessData);
                $types = 'issssssss';
                
                $profileId = executeQuery($sql, $params, $types);
                
                if (!$profileId) {
                    throw new Exception('Failed to create business profile');
                }
            } else {
                // Create customer profile
                $sql = "INSERT INTO customer_profiles (user_id) VALUES (?)";
                $profileId = executeQuery($sql, [$userId], 'i');
                
                if (!$profileId) {
                    throw new Exception('Failed to create customer profile');
                }
            }
            
            // Commit transaction
            $conn->commit();
            
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $conn->rollback();
            return false;
        }
    }
}
?>