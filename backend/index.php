<?php
/**
 * Main entry point for the API
 * 
 * This file handles all incoming requests to the API and routes them
 * to the appropriate controller.
 */

// Set headers for API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include configuration files
require_once './config/database.php';
require_once './config/cors.php';

// Include utility files
require_once './utils/Response.php';
require_once './utils/Validator.php';

// Get request method and URI
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path from URI if needed
// Adjust '/api' to match your actual base path
$base_path = '/api';
if (strpos($request_uri, $base_path) === 0) {
    $request_uri = substr($request_uri, strlen($base_path));
}

// Route the request to the appropriate handler
require_once './api/routes.php';

// If we reached this point, the route wasn't handled
Response::notFound('Endpoint not found');
?>