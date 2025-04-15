/**
 * Cart Service
 * 
 * Manages the shopping cart functionality using localStorage
 */

// Get cart from localStorage
const getCart = () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  };
  
  // Save cart to localStorage and trigger an event
  const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch a storage event for other components to detect the change
    window.dispatchEvent(new Event('storage'));
    
    return cart;
  };
  
  // Add an item to the cart
  const addToCart = (item) => {
    const cart = getCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.inventory_id === item.inventory_id
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.push({
        inventory_id: item.inventory_id,
        part_id: item.part_id,
        title: item.title,
        price: item.price,
        image_url: item.image_url,
        quantity: item.quantity,
        business_name: item.business_name,
        condition: item.condition
      });
    }
    
    return saveCart(cart);
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (inventoryId, quantity) => {
    const cart = getCart();
    
    const updatedCart = cart.map(item => {
      if (item.inventory_id === inventoryId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    return saveCart(updatedCart);
  };
  
  // Remove an item from the cart
  const removeFromCart = (inventoryId) => {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.inventory_id !== inventoryId);
    
    return saveCart(updatedCart);
  };
  
  // Clear the entire cart
  const clearCart = () => {
    return saveCart([]);
  };
  
  // Get the total price of all items in the cart
  const getCartTotal = () => {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Get the total number of items in the cart
  const getCartCount = () => {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  };
  
  export default {
    getCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount
  };