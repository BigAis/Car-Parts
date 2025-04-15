<?php
/**
 * Main entry point for the API
 * 
 * This file handles all incoming requests to the API and routes them
 * to the appropriate controller.
 */

// Set headers for API
header('Content-Type: application/json');

// Include configuration files
require_once './config/database.php';
require_once './config/cors.php';

// Include utility files
require_once './utils/Response.php';
require_once './utils/Validator.php';

// Include middleware
require_once './middleware/AuthMiddleware.php';

// Get request method and URI
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path from URI if needed
// Adjust '/api' to match your actual base path
$base_path = '/api';
if (strpos($request_uri, $base_path) === 0) {
    $request_uri = substr($request_uri, strlen($base_path));
}

// Initialize authentication middleware
$authMiddleware = new AuthMiddleware();

// Process authentication for protected routes
// If authentication fails, the middleware will return a response and exit
if (!$authMiddleware->process($request_uri)) {
    // If process returns false, the middleware has already sent a response
    exit;
}

// Route the request to the appropriate handler
require_once './api/routes.php';

// If we reached this point, the route wasn't handled
Response::notFound('Endpoint not found');
?>