<?php
/**
 * Response utility class
 * 
 * Handles API responses with appropriate status codes
 */
class Response {
    /**
     * Send a success response with data
     * 
     * @param mixed $data The data to send
     * @param int $statusCode HTTP status code (default: 200)
     */
    public static function success($data, $statusCode = 200) {
        self::send(['success' => true, 'data' => $data], $statusCode);
    }
    
    /**
     * Send an error response with message
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code (default: 400)
     * @param array $errors Optional validation errors
     */
    public static function error($message, $statusCode = 400, $errors = null) {
        $response = ['success' => false, 'message' => $message];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        self::send($response, $statusCode);
    }
    
    /**
     * Send a 400 Bad Request response
     * 
     * @param string $message Error message
     * @param array $errors Optional validation errors
     */
    public static function badRequest($message = 'Bad request', $errors = null) {
        self::error($message, 400, $errors);
    }
    
    /**
     * Send a 401 Unauthorized response
     * 
     * @param string $message Error message
     */
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    /**
     * Send a 403 Forbidden response
     * 
     * @param string $message Error message
     */
    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }
    
    /**
     * Send a 404 Not Found response
     * 
     * @param string $message Error message
     */
    public static function notFound($message = 'Not found') {
        self::error($message, 404);
    }
    
    /**
     * Send a 405 Method Not Allowed response
     * 
     * @param string $message Error message
     */
    public static function methodNotAllowed($message = 'Method not allowed') {
        self::error($message, 405);
    }
    
    /**
     * Send a 500 Internal Server Error response
     * 
     * @param string $message Error message
     */
    public static function serverError($message = 'Internal server error') {
        self::error($message, 500);
    }
    
    /**
     * Send the response with JSON encoding and status code
     * 
     * @param mixed $data The data to send
     * @param int $statusCode HTTP status code
     */
    private static function send($data, $statusCode) {
        // Set HTTP response code
        http_response_code($statusCode);
        
        // Output JSON
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        // End script execution
        exit;
    }
}
?>