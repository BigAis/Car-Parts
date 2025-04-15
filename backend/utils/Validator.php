<?php
/**
 * Validator utility class
 * 
 * Provides methods for validating input data
 */
class Validator {
    /**
     * @var array Validation errors
     */
    private static $errors = [];
    
    /**
     * Validate required fields
     * 
     * @param array $data Input data
     * @param array $fields Required field names
     * @return bool True if all required fields are present
     */
    public static function required($data, $fields) {
        $valid = true;
        
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                self::$errors[$field] = "The {$field} field is required";
                $valid = false;
            }
        }
        
        return $valid;
    }
    
    /**
     * Validate email format
     * 
     * @param string $email Email to validate
     * @param string $field Field name for error
     * @return bool True if email is valid
     */
    public static function email($email, $field = 'email') {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            self::$errors[$field] = "The {$field} must be a valid email address";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate minimum length
     * 
     * @param string $value Value to validate
     * @param int $length Minimum length
     * @param string $field Field name for error
     * @return bool True if value meets minimum length
     */
    public static function minLength($value, $length, $field) {
        if (strlen($value) < $length) {
            self::$errors[$field] = "The {$field} must be at least {$length} characters";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate maximum length
     * 
     * @param string $value Value to validate
     * @param int $length Maximum length
     * @param string $field Field name for error
     * @return bool True if value doesn't exceed maximum length
     */
    public static function maxLength($value, $length, $field) {
        if (strlen($value) > $length) {
            self::$errors[$field] = "The {$field} must not exceed {$length} characters";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate numeric value
     * 
     * @param mixed $value Value to validate
     * @param string $field Field name for error
     * @return bool True if value is numeric
     */
    public static function numeric($value, $field) {
        if (!is_numeric($value)) {
            self::$errors[$field] = "The {$field} must be a number";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate integer value
     * 
     * @param mixed $value Value to validate
     * @param string $field Field name for error
     * @return bool True if value is an integer
     */
    public static function integer($value, $field) {
        if (!filter_var($value, FILTER_VALIDATE_INT)) {
            self::$errors[$field] = "The {$field} must be an integer";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate minimum value
     * 
     * @param numeric $value Value to validate
     * @param numeric $min Minimum value
     * @param string $field Field name for error
     * @return bool True if value is greater than or equal to minimum
     */
    public static function min($value, $min, $field) {
        if ($value < $min) {
            self::$errors[$field] = "The {$field} must be at least {$min}";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate maximum value
     * 
     * @param numeric $value Value to validate
     * @param numeric $max Maximum value
     * @param string $field Field name for error
     * @return bool True if value is less than or equal to maximum
     */
    public static function max($value, $max, $field) {
        if ($value > $max) {
            self::$errors[$field] = "The {$field} must not exceed {$max}";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate value in array
     * 
     * @param mixed $value Value to validate
     * @param array $allowed Allowed values
     * @param string $field Field name for error
     * @return bool True if value is in allowed values
     */
    public static function inArray($value, $allowed, $field) {
        if (!in_array($value, $allowed)) {
            self::$errors[$field] = "The selected {$field} is invalid";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate date format
     * 
     * @param string $date Date to validate
     * @param string $format Expected date format
     * @param string $field Field name for error
     * @return bool True if date matches format
     */
    public static function date($date, $format = 'Y-m-d', $field = 'date') {
        $d = \DateTime::createFromFormat($format, $date);
        if (!$d || $d->format($format) !== $date) {
            self::$errors[$field] = "The {$field} must be a valid date in format {$format}";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate URL format
     * 
     * @param string $url URL to validate
     * @param string $field Field name for error
     * @return bool True if URL is valid
     */
    public static function url($url, $field = 'url') {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            self::$errors[$field] = "The {$field} must be a valid URL";
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate that passwords match
     * 
     * @param string $password Password
     * @param string $confirmPassword Confirmation password
     * @param string $field Field name for error
     * @return bool True if passwords match
     */
    public static function passwordsMatch($password, $confirmPassword, $field = 'confirm_password') {
        if ($password !== $confirmPassword) {
            self::$errors[$field] = "The passwords do not match";
            return false;
        }
        
        return true;
    }
    
    /**
     * Get all validation errors
     * 
     * @return array Validation errors
     */
    public static function getErrors() {
        return self::$errors;
    }
    
    /**
     * Check if validation has errors
     * 
     * @return bool True if there are validation errors
     */
    public static function hasErrors() {
        return !empty(self::$errors);
    }
    
    /**
     * Clear all validation errors
     */
    public static function clearErrors() {
        self::$errors = [];
    }
}
?>