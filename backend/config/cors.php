<?php
/**
 * CORS configuration
 * 
 * Cross-Origin Resource Sharing (CORS) is a mechanism that allows 
 * resources to be requested from another domain.
 */

// Define allowed origins
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
    // Add your production URLs here
];

// Get the origin of the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the origin is allowed
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Allow credentials
header('Access-Control-Allow-Credentials: true');

// Allow specific headers
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');

// Allow specific methods
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Cache preflight request for 1 hour
header('Access-Control-Max-Age: 3600');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return 200 OK status
    http_response_code(200);
    exit;
}
?>