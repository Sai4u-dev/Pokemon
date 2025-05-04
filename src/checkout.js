// DOM Elements
const checkoutForm = document.getElementById('checkout-form');
const checkoutFormContainer = document.getElementById('checkout-form-container');
const orderConfirmation = document.getElementById('order-confirmation');
const orderNumber = document.getElementById('order-number');

// Initialize the checkout page
function initializeCheckoutPage() {
    // Check if cart is empty
    if (window.cart && window.cart.items.length === 0) {
        // Redirect to home page if cart is empty
        window.location.href = '../index.html';
        return;
    }
    
    // Update order summary
    if (window.cart) {
        window.cart.updateOrderSummary();
    }
    
    // Add event listener to checkout form
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
}

// Handle checkout form submission
function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Process the order (in a real app, this would send data to a server)
    processOrder();
}

// Validate checkout form
function validateCheckoutForm() {
    // Get form elements
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    const postalCode = document.getElementById('postal-code');
    const country = document.getElementById('country');
    const cardName = document.getElementById('card-name');
    const cardNumber = document.getElementById('card-number');
    const expiryDate = document.getElementById('expiry-date');
    const cvv = document.getElementById('cvv');
    
    // Simple validation
    let isValid = true;
    
    // Check required fields
    const requiredFields = [fullname, email, address, city, postalCode, country, cardName, cardNumber, expiryDate, cvv];
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    // Email validation
    if (email.value.trim() && !isValidEmail(email.value)) {
        email.style.borderColor = 'red';
        isValid = false;
    }
    
    // Card number validation (simple check for 16 digits)
    if (cardNumber.value.trim() && !isValidCardNumber(cardNumber.value)) {
        cardNumber.style.borderColor = 'red';
        isValid = false;
    }
    
    // Expiry date validation (MM/YY format)
    if (expiryDate.value.trim() && !isValidExpiryDate(expiryDate.value)) {
        expiryDate.style.borderColor = 'red';
        isValid = false;
    }
    
    // CVV validation (3-4 digits)
    if (cvv.value.trim() && !isValidCVV(cvv.value)) {
        cvv.style.borderColor = 'red';
        isValid = false;
    }
    
    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Card number validation helper
function isValidCardNumber(cardNumber) {
    // Remove spaces and check if it's 16 digits
    const digitsOnly = cardNumber.replace(/\s+/g, '');
    return /^\d{16}$/.test(digitsOnly);
}

// Expiry date validation helper
function isValidExpiryDate(expiryDate) {
    // Check MM/YY format
    return /^\d{2}\/\d{2}$/.test(expiryDate);
}

// CVV validation helper
function isValidCVV(cvv) {
    // Check if it's 3-4 digits
    return /^\d{3,4}$/.test(cvv);
}

// Process the order
function processOrder() {
    // In a real app, this would send data to a server
    // For this demo, we'll just show the confirmation and clear the cart
    
    // Generate a random order number
    const randomOrderNumber = Math.floor(100000000 + Math.random() * 900000000);
    orderNumber.textContent = randomOrderNumber;
    
    // Show confirmation
    checkoutFormContainer.style.display = 'none';
    orderConfirmation.classList.add('show');
    
    // Clear the cart
    if (window.cart) {
        window.cart.clearCart();
    }
    
    // Scroll to confirmation
    orderConfirmation.scrollIntoView({ behavior: 'smooth' });
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeCheckoutPage);