<?php
/**
 * Order Model
 * 
 * Handles order data operations
 */
class Order {
    private $id;
    private $userId;
    private $totalAmount;
    private $shippingAddress;
    private $billingAddress;
    private $paymentMethod;
    private $paymentStatus;
    private $status;
    private $trackingNumber;
    private $notes;
    private $createdAt;
    private $updatedAt;
    
    /**
     * Find an order by ID
     * 
     * @param int $id Order ID
     * @return array|null Order data or null if not found
     */
    public static function findById($id) {
        $sql = "SELECT * FROM orders WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            return null;
        }
        
        return $result->fetch_assoc();
    }
    
    /**
     * Find orders by user ID
     * 
     * @param int $userId User ID
     * @return array Orders data
     */
    public static function findByUserId($userId) {
        $sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
        $result = executeQuery($sql, [$userId], 'i');
        
        if (!$result) {
            return [];
        }
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        
        return $orders;
    }
    
    /**
     * Get order items by order ID
     * 
     * @param int $orderId Order ID
     * @return array Order items data
     */
    public static function getOrderItems($orderId) {
        $sql = "SELECT oi.*, i.part_id, i.condition, p.title, p.sku, p.image_url, 
                       bp.business_name, bp.id as business_id
                FROM order_items oi
                JOIN inventory i ON oi.inventory_id = i.id
                JOIN parts p ON i.part_id = p.id
                JOIN business_profiles bp ON i.business_id = bp.id
                WHERE oi.order_id = ?";
        
        $result = executeQuery($sql, [$orderId], 'i');
        
        if (!$result) {
            return [];
        }
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        
        return $items;
    }
    
    /**
     * Create a new order
     * 
     * @param array $data Order data
     * @return int|false New order ID or false on failure
     */
    public static function create($data) {
        $sql = "INSERT INTO orders (user_id, total_amount, shipping_address, billing_address, 
                                   payment_method, payment_status, status, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data['user_id'],
            $data['total_amount'],
            $data['shipping_address'],
            $data['billing_address'],
            $data['payment_method'],
            $data['payment_status'] ?? 'pending',
            $data['status'] ?? 'pending',
            $data['notes'] ?? null
        ];
        
        return executeQuery($sql, $params, 'idssssss');
    }
    
    /**
     * Create order items
     * 
     * @param int $orderId Order ID
     * @param array $items Order items data
     * @return bool True on success, false on failure
     */
    public static function createOrderItems($orderId, $items) {
        $conn = getDbConnection();
        $success = true;
        
        foreach ($items as $item) {
            $sql = "INSERT INTO order_items (order_id, inventory_id, quantity, price, subtotal) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $params = [
                $orderId,
                $item['inventory_id'],
                $item['quantity'],
                $item['price'],
                $item['subtotal']
            ];
            
            $result = executeQuery($sql, $params, 'iiidd');
            
            if ($result === false) {
                $success = false;
                break;
            }
        }
        
        return $success;
    }
    
    /**
     * Update order status
     * 
     * @param int $id Order ID
     * @param string $status New status
     * @return bool True on success, false on failure
     */
    public static function updateStatus($id, $status) {
        $sql = "UPDATE orders SET status = ? WHERE id = ?";
        $result = executeQuery($sql, [$status, $id], 'si');
        
        return $result !== false;
    }
    
    /**
     * Cancel an order
     * 
     * @param int $id Order ID
     * @return bool True on success, false on failure
     */
    public static function cancel($id) {
        return self::updateStatus($id, 'cancelled');
    }
}
?>