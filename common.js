// Cart Management (common.js)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(item) {
    // Generate stable ID without Date.now()
    const stableId = `${item.name.toLowerCase().replace(/\s/g, '-')}-${item.price}`;
    const existing = cart.find(i => i.id === stableId);
    
    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.push({...item, id: stableId});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showBoughtMessage();
}

// Remove individual items
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Modern Cart Display with Remove Buttons
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartItems || !cartTotal || !cartCount) return;
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartItems.innerHTML += `
            <div class="flex justify-between items-center py-2 border-b">
                <div>
                    <h4 class="font-semibold">${item.name}</h4>
                    <p class="text-sm text-gray-600">
                        ${item.quantity} x $${item.price.toFixed(2)}
                        <button onclick="removeFromCart('${item.id}')" class="ml-2 text-red-500 hover:text-red-700">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </p>
                </div>
                <div class="font-semibold">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Modified checkout function
function checkout() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm w-full" id="checkoutModal">
            <div class="text-center">
                <h3 class="text-xl font-bold mb-2">Thank you for your purchase!</h3>
                <button onclick="closeCheckoutModal()" 
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;

    // Handle background click
    modal.onclick = function(e) {
        if (e.target === this) {
            closeCheckoutModal();
        }
    };

    document.body.appendChild(modal);
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    toggleCart();
}

function closeCheckoutModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black');
    if (modal) modal.remove();
}

// Product Quantity Handling
if (!window.cartInitialized) {
    window.cartInitialized = true;

    document.addEventListener('DOMContentLoaded', () => {
        // Event Delegation for Dynamic Elements
        document.addEventListener('click', (e) => {
            // Quantity Controls
            if (e.target.closest('.increment, .decrement')) {
                const button = e.target.closest('.increment, .decrement');
                const productCard = button.closest('.bg-white');
                const quantityElement = productCard.querySelector('.quantity');
                const priceElement = productCard.querySelector('.price');
                const subtotalElement = productCard.querySelector('.subtotal');
                
                let quantity = parseInt(quantityElement.textContent);
                const price = parseFloat(priceElement.textContent);

                button.classList.contains('increment') ? quantity++ : quantity = Math.max(1, quantity-1);
                
                quantityElement.textContent = quantity;
                subtotalElement.textContent = (quantity * price).toFixed(2);
            }
            
            // Buy Now Buttons
            if (e.target.closest('.bg-primary')) {
                const button = e.target.closest('.bg-primary');
                const productCard = button.closest('.bg-white');
                const name = productCard.querySelector('h3').textContent;
                const price = parseFloat(productCard.querySelector('.price').textContent);
                const quantity = parseInt(productCard.querySelector('.quantity').textContent);
                
                addToCart({
                    name: name,
                    price: price,
                    quantity: quantity
                });
            }
        });

        // Initialize cart display
        updateCartDisplay();
    });
}