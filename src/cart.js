// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.count = 0;
        this.init();
    }

    init() {
        // Load cart from localStorage if available
        this.loadCart();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update cart UI
        this.updateCartUI();
    }

    loadCart() {
        const savedCart = localStorage.getItem('pokemonCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.calculateTotals();
        }
    }

    saveCart() {
        localStorage.setItem('pokemonCart', JSON.stringify(this.items));
    }

    setupEventListeners() {
        // Cart icon click
        const cartIcon = document.getElementById('cart-icon');
        const closeCart = document.getElementById('close-cart');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.openCart());
        }
        
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }
        
        // Listen for add to cart events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') && e.target.textContent === 'Add to Cart') {
                const card = e.target.closest('.featured-card') || e.target.closest('.product-card');
                if (card) {
                    const name = card.querySelector('h3').textContent;
                    const price = parseFloat(card.querySelector('.price').textContent.replace('$', ''));
                    const image = card.querySelector('img').src;
                    const types = Array.from(card.querySelectorAll('.type')).map(type => type.textContent);
                    
                    this.addItem({
                        id: name.toLowerCase().replace(/\s+/g, '-'),
                        name,
                        price,
                        image,
                        types,
                        quantity: 1
                    });
                    
                    // Show feedback
                    this.showAddedToCartFeedback();
                }
            }
        });
    }

    showAddedToCartFeedback() {
        // Create a feedback element
        const feedback = document.createElement('div');
        feedback.className = 'add-to-cart-feedback';
        feedback.textContent = 'Added to cart!';
        feedback.style.position = 'fixed';
        feedback.style.bottom = '20px';
        feedback.style.right = '20px';
        feedback.style.backgroundColor = 'var(--secondary-color)';
        feedback.style.color = 'white';
        feedback.style.padding = '10px 20px';
        feedback.style.borderRadius = '5px';
        feedback.style.zIndex = '1000';
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(20px)';
        feedback.style.transition = 'opacity 0.3s, transform 0.3s';
        
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after 2 seconds
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }

    openCart() {
        document.getElementById('cart-sidebar').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cart-sidebar').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    addItem(item) {
        // Check if item already exists in cart
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            this.items.push(item);
        }
        
        this.calculateTotals();
        this.saveCart();
        this.updateCartUI();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.calculateTotals();
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            this.calculateTotals();
            this.saveCart();
            this.updateCartUI();
        }
    }

    calculateTotals() {
        this.count = this.items.reduce((total, item) => total + item.quantity, 0);
        this.total = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartUI() {
        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.count;
        }
        
        // Update cart items
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <p>Your cart is empty</p>
                        <p>Add some Pokémon to get started!</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="cart-item-actions">
                                <button class="quantity-btn decrease-quantity">-</button>
                                <span class="cart-item-quantity">${item.quantity}</span>
                                <button class="quantity-btn increase-quantity">+</button>
                                <button class="remove-item">Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners to quantity buttons and remove buttons
                cartItems.querySelectorAll('.decrease-quantity').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const itemId = e.target.closest('.cart-item').dataset.id;
                        const item = this.items.find(i => i.id === itemId);
                        if (item) {
                            this.updateQuantity(itemId, item.quantity - 1);
                        }
                    });
                });
                
                cartItems.querySelectorAll('.increase-quantity').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const itemId = e.target.closest('.cart-item').dataset.id;
                        const item = this.items.find(i => i.id === itemId);
                        if (item) {
                            this.updateQuantity(itemId, item.quantity + 1);
                        }
                    });
                });
                
                cartItems.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const itemId = e.target.closest('.cart-item').dataset.id;
                        this.removeItem(itemId);
                    });
                });
            }
        }
        
        // Update cart total
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            cartTotal.textContent = `$${this.total.toFixed(2)}`;
        }
        
        // Update checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.style.display = this.items.length > 0 ? 'block' : 'none';
        }
        
        // If we're on the checkout page, update the order summary
        this.updateOrderSummary();
    }
    
    updateOrderSummary() {
        const orderSummaryItems = document.getElementById('order-summary-items');
        const orderTotal = document.getElementById('order-total');
        
        if (orderSummaryItems && orderTotal) {
            orderSummaryItems.innerHTML = this.items.map(item => `
                <div class="summary-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
            
            orderTotal.textContent = `$${this.total.toFixed(2)}`;
        }
    }
    
    clearCart() {
        this.items = [];
        this.calculateTotals();
        this.saveCart();
        this.updateCartUI();
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});