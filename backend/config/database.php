<?php
/**
 * Database configuration and connection
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'car_parts_marketplace');
define('DB_USER', 'root'); // Update with your MySQL username
define('DB_PASS', '');     // Update with your MySQL password

/**
 * Get a database connection
 * 
 * @return mysqli A database connection
 */
function getDbConnection() {
    static $conn;
    
    // If connection already exists, return it
    if ($conn instanceof mysqli) {
        return $conn;
    }
    
    // Create a new connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        error_log('Database connection failed: ' . $conn->connect_error);
        die('Database connection failed. Please try again later.');
    }
    
    // Set charset to UTF-8
    $conn->set_charset('utf8');
    
    return $conn;
}

/**
 * Execute a query and return the result
 * 
 * @param string $sql The SQL query
 * @param array $params Parameters for prepared statement
 * @param string $types Types of parameters (i: integer, s: string, d: double, b: blob)
 * @return mixed Result object or boolean
 */
function executeQuery($sql, $params = [], $types = '') {
    $conn = getDbConnection();
    
    // Prepare statement
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        error_log('Query preparation failed: ' . $conn->error);
        return false;
    }
    
    // Bind parameters if any
    if (!empty($params)) {
        // If types string is not provided or does not match params count, generate it
        if (empty($types) || strlen($types) !== count($params)) {
            $types = '';
            foreach ($params as $param) {
                if (is_int($param)) {
                    $types .= 'i';
                } elseif (is_float($param)) {
                    $types .= 'd';
                } elseif (is_string($param)) {
                    $types .= 's';
                } else {
                    $types .= 'b';
                }
            }
        }
        
        // Create reference array for bind_param
        $bindParams = [$types];
        foreach ($params as $key => $value) {
            $bindParams[] = &$params[$key];
        }
        
        // Call bind_param with references
        call_user_func_array([$stmt, 'bind_param'], $bindParams);
    }
    
    // Execute statement
    $result = $stmt->execute();
    
    if (!$result) {
        error_log('Query execution failed: ' . $stmt->error);
        return false;
    }
    
    // Get result for SELECT queries
    $queryResult = $stmt->get_result();
    
    // Close statement
    $stmt->close();
    
    // Return insert_id for INSERT queries, affected_rows for UPDATE/DELETE, or result for SELECT
    if ($queryResult) {
        return $queryResult;
    } elseif (strpos(strtoupper($sql), 'INSERT') === 0) {
        return $conn->insert_id;
    } else {
        return $conn->affected_rows;
    }
}
?>