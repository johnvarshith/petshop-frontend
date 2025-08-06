// Global Cart Object
let cart = [];

// Function to toggle cart visibility
function toggleCart() {
    const cartPopup = document.getElementById('cartPopup');
    cartPopup.classList.toggle('hidden');
    updateCartUI(); // Update the cart UI whenever it's toggled
}

// Function to add an item to the cart
function addToCart(name, price, quantity = 1, image) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += quantity; // Update quantity if item already exists
    } else {
        cart.push({ name, price, quantity, image }); // Add new item to cart
    }

    updateCartUI(); // Update the cart UI
    saveCartToLocalStorage(); // Save cart to localStorage
}

// Function to update the cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Clear existing items
    cartItems.innerHTML = '';

    // Add items to the cart UI
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'flex items-center justify-between';
        cartItem.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg">
                <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                </div>
            </div>
            <p class="font-semibold">$${itemTotal.toFixed(2)}</p>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update total
    cartTotal.textContent = total.toFixed(2);
}

// Function to save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI(); // Update the cart UI on page load
    }
}

// Load cart when the page loads
document.addEventListener('DOMContentLoaded', loadCartFromLocalStorage);