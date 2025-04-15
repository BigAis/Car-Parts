<?php
/**
 * Categories Controller
 * 
 * Handles operations related to part categories
 */
class CategoriesController {
    /**
     * Get all categories
     */
    public function getAllCategories() {
        // Retrieve all categories
        $sql = "SELECT * FROM part_categories ORDER BY name ASC";
        $result = executeQuery($sql);
        
        if (!$result) {
            Response::serverError('Failed to fetch categories');
        }
        
        // Fetch all categories
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = $row;
        }
        
        // Build category hierarchy
        $categoryTree = $this->buildCategoryTree($categories);
        
        // Return response
        Response::success($categories);
    }
    
    /**
     * Get a category by ID
     * 
     * @param int $id Category ID
     */
    public function getCategoryById($id) {
        // Get category details
        $sql = "SELECT * FROM part_categories WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if (!$result || $result->num_rows === 0) {
            Response::notFound('Category not found');
        }
        
        $category = $result->fetch_assoc();
        
        // Get subcategories if any
        $subCategoriesSql = "SELECT * FROM part_categories WHERE parent_id = ?";
        $subCategoriesResult = executeQuery($subCategoriesSql, [$id], 'i');
        
        $subcategories = [];
        while ($row = $subCategoriesResult->fetch_assoc()) {
            $subcategories[] = $row;
        }
        
        $category['subcategories'] = $subcategories;
        
        // Get parts count in this category
        $partCountSql = "SELECT COUNT(*) as count FROM parts WHERE category_id = ?";
        $partCountResult = executeQuery($partCountSql, [$id], 'i');
        $partCount = $partCountResult->fetch_assoc()['count'];
        
        $category['parts_count'] = (int)$partCount;
        
        // Return response
        Response::success($category);
    }
    
    /**
     * Create a new category
     * 
     * @param array $data Category data
     */
    public function createCategory($data) {
        // Validate required fields
        if (empty($data['name'])) {
            Response::badRequest('Category name is required');
        }
        
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateSlug($data['name']);
        }
        
        // Check if slug already exists
        $checkSlugSql = "SELECT id FROM part_categories WHERE slug = ?";
        $checkSlugResult = executeQuery($checkSlugSql, [$data['slug']], 's');
        
        if ($checkSlugResult->num_rows > 0) {
            Response::badRequest('Category with this slug already exists');
        }
        
        // Check if parent category exists if provided
        if (!empty($data['parent_id'])) {
            $checkParentSql = "SELECT id FROM part_categories WHERE id = ?";
            $checkParentResult = executeQuery($checkParentSql, [$data['parent_id']], 'i');
            
            if ($checkParentResult->num_rows === 0) {
                Response::badRequest('Parent category not found');
            }
        }
        
        // Insert category
        $sql = "INSERT INTO part_categories (name, slug, parent_id, description, image_url) 
                VALUES (?, ?, ?, ?, ?)";
        
        $params = [
            $data['name'],
            $data['slug'],
            $data['parent_id'] ?? null,
            $data['description'] ?? null,
            $data['image_url'] ?? null
        ];
        
        $types = 'ssis';
        if ($params[2] === null) {
            $types = 'ssss'; // Adjust type for NULL parent_id
        }
        
        $categoryId = executeQuery($sql, $params, $types);
        
        if (!$categoryId) {
            Response::serverError('Failed to create category');
        }
        
        // Return success with new category ID
        Response::success(['id' => $categoryId], 201);
    }
    
    /**
     * Update an existing category
     * 
     * @param int $id Category ID
     * @param array $data Updated category data
     */
    public function updateCategory($id, $data) {
        // Check if category exists
        $checkSql = "SELECT id FROM part_categories WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Category not found');
        }
        
        // Build update query
        $updates = [];
        $params = [];
        $types = '';
        
        if (isset($data['name'])) {
            $updates[] = "name = ?";
            $params[] = $data['name'];
            $types .= 's';
            
            // Update slug if name is updated and slug is not provided
            if (!isset($data['slug'])) {
                $data['slug'] = $this->generateSlug($data['name']);
                $updates[] = "slug = ?";
                $params[] = $data['slug'];
                $types .= 's';
            }
        }
        
        if (isset($data['slug'])) {
            // Check if the slug already exists for a different category
            $checkSlugSql = "SELECT id FROM part_categories WHERE slug = ? AND id != ?";
            $checkSlugResult = executeQuery($checkSlugSql, [$data['slug'], $id], 'si');
            
            if ($checkSlugResult->num_rows > 0) {
                Response::badRequest('Category with this slug already exists');
            }
            
            $updates[] = "slug = ?";
            $params[] = $data['slug'];
            $types .= 's';
        }
        
        if (isset($data['parent_id'])) {
            // Check if parent category exists
            if ($data['parent_id'] !== null) {
                $checkParentSql = "SELECT id FROM part_categories WHERE id = ?";
                $checkParentResult = executeQuery($checkParentSql, [$data['parent_id']], 'i');
                
                if ($checkParentResult->num_rows === 0) {
                    Response::badRequest('Parent category not found');
                }
                
                // Prevent circular reference
                if ($data['parent_id'] == $id) {
                    Response::badRequest('A category cannot be its own parent');
                }
            }
            
            $updates[] = "parent_id = ?";
            $params[] = $data['parent_id'];
            $types .= 'i';
        }
        
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = $data['description'];
            $types .= 's';
        }
        
        if (isset($data['image_url'])) {
            $updates[] = "image_url = ?";
            $params[] = $data['image_url'];
            $types .= 's';
        }
        
        // If no fields to update
        if (empty($updates)) {
            Response::badRequest('No fields to update');
        }
        
        // Build the query
        $sql = "UPDATE part_categories SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= 'i';
        
        // Execute update
        $result = executeQuery($sql, $params, $types);
        
        if ($result === false) {
            Response::serverError('Failed to update category');
        }
        
        // Return success
        Response::success(['id' => $id, 'message' => 'Category updated successfully']);
    }
    
    /**
     * Delete a category
     * 
     * @param int $id Category ID
     */
    public function deleteCategory($id) {
        // Check if category exists
        $checkSql = "SELECT id FROM part_categories WHERE id = ?";
        $checkResult = executeQuery($checkSql, [$id], 'i');
        
        if ($checkResult->num_rows === 0) {
            Response::notFound('Category not found');
        }
        
        // Check if category has subcategories
        $checkSubcategoriesSql = "SELECT id FROM part_categories WHERE parent_id = ?";
        $checkSubcategoriesResult = executeQuery($checkSubcategoriesSql, [$id], 'i');
        
        if ($checkSubcategoriesResult->num_rows > 0) {
            Response::badRequest('Cannot delete category with subcategories. Remove subcategories first.');
        }
        
        // Check if category has parts
        $checkPartsSql = "SELECT id FROM parts WHERE category_id = ?";
        $checkPartsResult = executeQuery($checkPartsSql, [$id], 'i');
        
        if ($checkPartsResult->num_rows > 0) {
            Response::badRequest('Cannot delete category with parts. Remove parts first or move them to another category.');
        }
        
        // Delete category
        $sql = "DELETE FROM part_categories WHERE id = ?";
        $result = executeQuery($sql, [$id], 'i');
        
        if ($result === false) {
            Response::serverError('Failed to delete category');
        }
        
        // Return success
        Response::success(['message' => 'Category deleted successfully']);
    }
    
    /**
     * Build category tree structure
     * 
     * @param array $categories Flat array of categories
     * @param int|null $parentId Parent ID to start from
     * @return array Nested category tree
     */
    private function buildCategoryTree($categories, $parentId = null) {
        $tree = [];
        
        foreach ($categories as $category) {
            if ($category['parent_id'] == $parentId) {
                $children = $this->buildCategoryTree($categories, $category['id']);
                if ($children) {
                    $category['children'] = $children;
                }
                $tree[] = $category;
            }
        }
        
        return $tree;
    }
    
    /**
     * Generate slug from name
     * 
     * @param string $name Category name
     * @return string Slug
     */
    private function generateSlug($name) {
        // Convert to lowercase
        $slug = strtolower($name);
        
        // Replace non-alphanumeric characters with hyphens
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        
        // Remove leading/trailing hyphens
        $slug = trim($slug, '-');
        
        return $slug;
    }
}
?>