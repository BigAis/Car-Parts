<?php
/**
 * API Routes
 * 
 * This file handles routing API requests to the appropriate controllers
 */

// Parse request URI into segments
$uri_segments = explode('/', trim($request_uri, '/'));
$resource = $uri_segments[0] ?? '';
$id = $uri_segments[1] ?? null;
$action = $uri_segments[2] ?? null;

// Check if the request body exists and parse JSON
$request_body = file_get_contents('php://input');
$data = !empty($request_body) ? json_decode($request_body, true) : [];

// Route based on resource
switch ($resource) {
    // Parts routes
    case 'parts':
        require_once './controllers/PartsController.php';
        $controller = new PartsController();
        
        if ($request_method === 'GET') {
            if ($id) {
                $controller->getPartById($id);
            } elseif ($action === 'compatible') {
                $controller->getCompatibleParts($_GET);
            } else {
                $controller->getAllParts($_GET);
            }
        } elseif ($request_method === 'POST') {
            $controller->createPart($data);
        } elseif ($request_method === 'PUT' && $id) {
            $controller->updatePart($id, $data);
        } elseif ($request_method === 'DELETE' && $id) {
            $controller->deletePart($id);
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Users routes
    case 'users':
        require_once './controllers/UsersController.php';
        $controller = new UsersController();
        
        if ($request_method === 'GET' && $id) {
            $controller->getUserById($id);
        } elseif ($request_method === 'POST' && $action === 'register') {
            $controller->register($data);
        } elseif ($request_method === 'POST' && $action === 'login') {
            $controller->login($data);
        } elseif ($request_method === 'PUT' && $id) {
            $controller->updateUser($id, $data);
        } elseif ($request_method === 'DELETE' && $id) {
            $controller->deleteUser($id);
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Categories routes
    case 'categories':
        require_once './controllers/CategoriesController.php';
        $controller = new CategoriesController();
        
        if ($request_method === 'GET') {
            if ($id) {
                $controller->getCategoryById($id);
            } else {
                $controller->getAllCategories();
            }
        } elseif ($request_method === 'POST') {
            $controller->createCategory($data);
        } elseif ($request_method === 'PUT' && $id) {
            $controller->updateCategory($id, $data);
        } elseif ($request_method === 'DELETE' && $id) {
            $controller->deleteCategory($id);
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Orders routes
    case 'orders':
        require_once './controllers/OrdersController.php';
        $controller = new OrdersController();
        
        if ($request_method === 'GET') {
            if ($id) {
                $controller->getOrderById($id);
            } else {
                $controller->getUserOrders();
            }
        } elseif ($request_method === 'POST') {
            $controller->createOrder($data);
        } elseif ($request_method === 'PUT' && $id) {
            $controller->updateOrderStatus($id, $data);
        } elseif ($request_method === 'DELETE' && $id) {
            $controller->cancelOrder($id);
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Inventory routes
    case 'inventory':
        require_once './controllers/InventoryController.php';
        $controller = new InventoryController();
        
        if ($request_method === 'GET') {
            if ($id) {
                $controller->getInventoryById($id);
            } elseif ($action === 'business' && isset($uri_segments[3])) {
                $controller->getBusinessInventory($uri_segments[3]);
            } else {
                $controller->getAllInventory($_GET);
            }
        } elseif ($request_method === 'POST') {
            $controller->addInventory($data);
        } elseif ($request_method === 'PUT' && $id) {
            $controller->updateInventory($id, $data);
        } elseif ($request_method === 'DELETE' && $id) {
            $controller->removeInventory($id);
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Search route
    case 'search':
        require_once './controllers/SearchController.php';
        $controller = new SearchController();
        
        if ($request_method === 'GET') {
            $controller->search($_GET);
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Car makes and models routes
    case 'cars':
        require_once './controllers/CarsController.php';
        $controller = new CarsController();
        
        if ($request_method === 'GET') {
            if ($action === 'makes') {
                $controller->getAllMakes();
            } elseif ($action === 'models' && isset($uri_segments[3])) {
                $controller->getModelsByMake($uri_segments[3]);
            } else {
                Response::badRequest('Invalid endpoint');
            }
        } else {
            Response::methodNotAllowed();
        }
        break;
    
    // Default - handle 404
    default:
        Response::notFound('Resource not found');
        break;
}
?>