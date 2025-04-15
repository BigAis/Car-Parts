<?php
/**
 * Authentication Middleware
 * 
 * This middleware handles JWT token validation and authentication
 */
class AuthMiddleware {
    private $excludedRoutes = [
        '/users/login',
        '/users/register',
        '/categories',
        '/parts',
        '/search',
        '/cars/makes',
        '/cars/models'
    ];
    
    /**
     * Process the request and validate authentication
     * 
     * @param string $requestUri The request URI
     * @return bool True if authenticated or exempt, false otherwise
     */
    public function process($requestUri) {
        // Check if the route is excluded from authentication
        foreach ($this->excludedRoutes as $route) {
            if (strpos($requestUri, $route) !== false) {
                return true;
            }
        }
        
        // Get the authorization header
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        // Check if the Authorization header exists
        if (empty($authHeader)) {
            Response::unauthorized('Authentication required');
            return false;
        }
        
        // Extract the token
        $parts = explode(' ', $authHeader);
        if (count($parts) !== 2 || $parts[0] !== 'Bearer') {
            Response::unauthorized('Invalid authentication format');
            return false;
        }
        
        $token = $parts[1];
        
        // Verify the token
        if (!$this->verifyToken($token)) {
            Response::unauthorized('Invalid or expired token');
            return false;
        }
        
        return true;
    }
    
    /**
     * Verify JWT token
     * 
     * @param string $token The JWT token
     * @return bool True if token is valid
     */
    private function verifyToken($token) {
        try {
            // Split the token
            $tokenParts = explode('.', $token);
            if (count($tokenParts) !== 3) {
                return false;
            }
            
            // Decode the payload
            $payload = json_decode(base64_decode($tokenParts[1]), true);
            
            // Check if the token has expired
            if (!isset($payload['exp']) || $payload['exp'] < time()) {
                return false;
            }
            
            // Verify signature (simplified for demo)
            // In production, use a proper JWT library
            $header = $tokenParts[0];
            $payload = $tokenParts[1];
            $signature = $tokenParts[2];
            
            // Secret key should be stored securely in environment variables
            $secret = 'your-secure-secret-key';
            
            $expectedSignature = base64_encode(
                hash_hmac('sha256', "$header.$payload", $secret, true)
            );
            
            if ($signature !== $expectedSignature) {
                return false;
            }
            
            // Store user ID for controllers to use
            $_SERVER['HTTP_X_USER_ID'] = $payload['sub'];
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>