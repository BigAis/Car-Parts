<?php
/**
 * Orders Controller
 * 
 * Handles order creation and management
 */
class OrdersController {
    /**
     * Get all orders for the current user
     */
    public function getUserOrders() {
        // Get current user ID (would be provided by auth middleware)
        // For demo purposes, let's assume it's passed in a header
        $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
        
        if (!$userId) {
            Response::unauthorized('Unauthorized access');
        }
        
        // Get all orders for this user
        $sql = "SELECT o.* FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC";
        $result = executeQuery($sql, [$userId], 'i');
        
        if (!$result) {
            Response::serverError('Failed to fetch orders');
        }
        
        // Fetch all orders
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Get order items
            $orderItemsSql = "SELECT oi.*, i.part_id, i.condition, p.title, p.sku, p.image_url, 
                                   bp.business_name, bp.id as business_id
                            FROM order_items oi
                            JOIN inventory i ON oi.inventory_id = i.id
                            JOIN parts p ON i.part_id = p.id
                            JOIN business_profiles bp ON i.business_id = bp.id
                            WHERE oi.order_id = ?";
            
            $orderItemsResult = executeQuery($orderItemsSql, [$row['id']], 'i');
            
            $items = [];
            while ($itemRow = $orderItemsResult->fetch_assoc()) {
                $items[] = $itemRow;
            }
            
            $row['items'] = $items;
            $orders[] = $row;
        }
        
        // Return response
        Response::success($orders);
    }
    
    /**
     * Get a specific order by ID
     * 
     * @param int $id Order ID
     */
    public function getOrderById($id) {
        // Get current user ID (would be provided by auth middleware)
        // For demo purposes, let's assume it's passed in a header
        $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
        
        if (!$userId) {
            Response::unauthorized('Unauthorized access');
        }
        
        // Get order details
        $sql = "SELECT o.* FROM orders o WHERE o.id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            Response::notFound('Order not found');
        }
        
        $order = $result->fetch_assoc();
        
        // Check if order belongs to the current user
        if ($order['user_id'] != $userId) {
            Response::forbidden('You do not have permission to view this order');
        }
        
        // Get order items
        $orderItemsSql = "SELECT oi.*, i.part_id, i.condition, p.title, p.sku, p.image_url, 
                               bp.business_name, bp.id as business_id
                        FROM order_items oi
                        JOIN inventory i ON oi.inventory_id = i.id
                        JOIN parts p ON i.part_id = p.id
                        JOIN business_profiles bp ON i.business_id = bp.id
                        WHERE oi.order_id = ?";
        
        $orderItemsResult = executeQuery($orderItemsSql, [$id], 'i');
        
        $items = [];
        while ($itemRow = $orderItemsResult->fetch_assoc()) {
            $items[] = $itemRow;
        }
        
        $order['items'] = $items;
        
        // Return response
        Response::success($order);
    }
    
    /**
     * Create a new order
     * 
     * @param array $data Order data
     */
    public function createOrder($data) {
        // Get current user ID (would be provided by auth middleware)
        // For demo purposes, let's assume it's passed in a header
        $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
        
        if (!$userId) {
            Response::unauthorized('Unauthorized access');
        }
        
        // Validate required fields
        $requiredFields = ['shipping_address', 'billing_address', 'payment_method', 'items'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                Response::badRequest("Missing required field: {$field}");
            }
        }
        
        // Validate items
        if (!is_array($data['items']) || empty($data['items'])) {
            Response::badRequest('Order must contain at least one item');
        }
        
        // Start transaction
        $conn = getDbConnection();
        $conn->begin_transaction();
        
        try {
            // Calculate total amount and validate items
            $totalAmount = 0;
            $validatedItems = [];
            
            foreach ($data['items'] as $item) {
                if (empty($item['inventory_id']) || empty($item['quantity'])) {
                    throw new Exception('Each item must have inventory_id and quantity');
                }
                
                // Get inventory information
                $inventorySql = "SELECT i.*, p.title FROM inventory i 
                                 JOIN parts p ON i.part_id = p.id 
                                 WHERE i.id = ?";
                $inventoryResult = executeQuery($inventorySql, [$item['inventory_id']], 'i');
                
                if (!$inventoryResult || $inventoryResult->num_rows === 0) {
                    throw new Exception("Inventory item {$item['inventory_id']} not found");
                }
                
                $inventory = $inventoryResult->fetch_assoc();
                
                // Check if quantity is available
                if ($inventory['quantity'] < $item['quantity']) {
                    throw new Exception("Not enough stock for {$inventory['title']}. Available: {$inventory['quantity']}");
                }
                
                // Calculate price
                $price = $inventory['sale_price'] ?? $inventory['price'];
                $subtotal = $price * $item['quantity'];
                
                $validatedItems[] = [
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $subtotal
                ];
                
                $totalAmount += $subtotal;
            }
            
            // Create order record
            $orderSql = "INSERT INTO orders (user_id, total_amount, shipping_address, billing_address, 
                                           payment_method, payment_status, status, notes) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $orderParams = [
                $userId,
                $totalAmount,
                $data['shipping_address'],
                $data['billing_address'],
                $data['payment_method'],
                'pending',
                'pending',
                $data['notes'] ?? null
            ];
            
            $orderId = executeQuery($orderSql, $orderParams, 'idssssss');
            
            if (!$orderId) {
                throw new Exception('Failed to create order');
            }
            
            // Insert order items
            foreach ($validatedItems as $item) {
                $orderItemSql = "INSERT INTO order_items (order_id, inventory_id, quantity, price, subtotal) 
                                VALUES (?, ?, ?, ?, ?)";
                
                $orderItemParams = [
                    $orderId,
                    $item['inventory_id'],
                    $item['quantity'],
                    $item['price'],
                    $item['subtotal']
                ];
                
                $orderItemId = executeQuery($orderItemSql, $orderItemParams, 'iiidd');
                
                if (!$orderItemId) {
                    throw new Exception('Failed to create order item');
                }
                
                // Update inventory quantity
                $updateInventorySql = "UPDATE inventory 
                                      SET quantity = quantity - ? 
                                      WHERE id = ?";
                
                $result = executeQuery($updateInventorySql, [$item['quantity'], $item['inventory_id']], 'ii');
                
                if ($result === false) {
                    throw new Exception('Failed to update inventory quantity');
                }
            }
            
            // Commit transaction
            $conn->commit();
            
            // Return success with order ID
            Response::success(['id' => $orderId, 'message' => 'Order created successfully'], 201);
        } catch (Exception $e) {
            // Rollback transaction on error
            $conn->rollback();
            Response::badRequest($e->getMessage());
        }
    }
    
    /**
     * Update order status
     * 
     * @param int $id Order ID
     * @param array $data Updated order data
     */
    public function updateOrderStatus($id, $data) {
        // Get current user ID (would be provided by auth middleware)
        // For demo purposes, let's assume it's passed in a header
        $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
        
        if (!$userId) {
            Response::unauthorized('Unauthorized access');
        }
        
        // Check if order exists
        $checkSql = "SELECT o.*, u.user_type
                    FROM orders o
                    JOIN users u ON o.user_id = u.id 
                    WHERE o.id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if (!$checkResult || $checkResult->num_rows === 0) {
            Response::notFound('Order not found');
        }
        
        $order = $checkResult->fetch_assoc();
        
        // Check if status is provided
        if (empty($data['status'])) {
            Response::badRequest('Status is required');
        }
        
        // Validate status
        $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($data['status'], $validStatuses)) {
            Response::badRequest('Invalid status. Must be: ' . implode(', ', $validStatuses));
        }
        
        // Only allow status update if:
        // 1. User is the order owner and is cancelling (and order is not already shipped or delivered)
        // 2. User is a business associated with the order
        // 3. Admin user (future implementation)
        
        $allowUpdate = false;
        
        if ($order['user_id'] == $userId && $data['status'] === 'cancelled') {
            if (in_array($order['status'], ['shipped', 'delivered'])) {
                Response::badRequest('Cannot cancel an order that has been shipped or delivered');
            }
            $allowUpdate = true;
        } else {
            // Check if user is a business associated with the order
            $businessCheckSql = "SELECT DISTINCT bp.user_id 
                                FROM order_items oi
                                JOIN inventory i ON oi.inventory_id = i.id
                                JOIN business_profiles bp ON i.business_id = bp.id
                                WHERE oi.order_id = ?";
            
            $businessCheckResult = executeQuery($businessCheckSql, [$id], 'i');
            
            while ($row = $businessCheckResult->fetch_assoc()) {
                if ($row['user_id'] == $userId) {
                    $allowUpdate = true;
                    break;
                }
            }
        }
        
        if (!$allowUpdate) {
            Response::forbidden('You do not have permission to update this order');
        }
        
        // Update order status
        $updateSql = "UPDATE orders SET status = ? WHERE id = ?";
        $result = executeQuery($updateSql, [$data['status'], $id], 'si');
        
        if ($result === false) {
            Response::serverError('Failed to update order status');
        }
        
        // Return success
        Response::success(['message' => 'Order status updated successfully']);
    }
    
    /**
     * Cancel an order
     * 
     * @param int $id Order ID
     */
    public function cancelOrder($id) {
        // Call updateOrderStatus with cancelled status
        $this->updateOrderStatus($id, ['status' => 'cancelled']);
    }
}
?>