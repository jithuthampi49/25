document.addEventListener("DOMContentLoaded", function () {
    const cartIcon = document.querySelector("#cart-icon");
    const cart = document.querySelector(".cart");
    const cartClose = document.querySelector("#cart-close");

    cartIcon.addEventListener("click", () => cart.classList.add("cart-active"));
    cartClose.addEventListener("click", () => cart.classList.remove("cart-active"));

    document.querySelectorAll(".add-cart").forEach(button => {
        button.addEventListener("click", event => {
            const productBox = event.target.closest(".box");
            const productTitle = productBox.querySelector(".product-title").textContent;

            const gramsDropdown = productBox.querySelector(".grams-dropdown");
            const selectedGrams = parseInt(gramsDropdown.value); 
            const selectedPrice = productBox.querySelector(".price").textContent.replace("₹", "").trim();

            const priceInPaise = Math.round(parseFloat(selectedPrice) * 100);

            if (isMobile()) {
                initiateRazorpayCheckout(productTitle, priceInPaise);
            } else {
                addToCart(productBox, selectedGrams, selectedPrice);
            }
        });
    });

    renderCart();
});

const isMobile = () => window.innerWidth <= 768;

const addToCart = (productBox, selectedGrams, selectedPrice) => {
    const productImgSrc = productBox.querySelector("img").src;
    const productTitle = productBox.querySelector(".product-title").textContent;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    for (let item of cart) {
        if (item.title === productTitle && item.grams === selectedGrams) {
            alert("This item with the selected grams is already in the cart.");
            return;
        }
    }

    const newItem = { 
        img: productImgSrc, 
        title: productTitle, 
        price: `₹${selectedPrice}`, 
        grams: selectedGrams, 
        quantity: 1 
    };

    cart.push(newItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    renderCart();
};

const renderCart = () => {
    const cartContent = document.querySelector(".cart-content");
    cartContent.innerHTML = "";

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.forEach((item, index) => {
        const cartBox = document.createElement("div");
        cartBox.classList.add("cart-box");
        cartBox.innerHTML = `
            <img src="${item.img}" class="cart-image">
            <div class="cart-detail">
                <h2 class="cart-product-title">${item.title}</h2>
                <span class="cart-price">${item.price}</span>
                <span class="cart-grams">${item.grams}gm</span>
                <div class="cart-quantity">
                    <button class="decrement" data-index="${index}">-</button>
                    <span class="number">${item.quantity}</span>
                    <button class="increment" data-index="${index}">+</button>
                </div>
            </div>
            <i class='bx bx-trash cart-remove' data-index="${index}"></i>
        `;

        cartContent.appendChild(cartBox);
    });

    attachCartEvents();
    updateTotalPriceAndWeight();
    updateCartCount(cart.length);
};

const attachCartEvents = () => {
    document.querySelectorAll(".cart-remove").forEach(button => {
        button.addEventListener("click", event => {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const index = event.target.getAttribute("data-index");
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        });
    });

    document.querySelectorAll(".increment, .decrement").forEach(button => {
        button.addEventListener("click", event => {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const index = event.target.getAttribute("data-index");

            if (event.target.classList.contains("increment")) {
                cart[index].quantity++;
            } else if (event.target.classList.contains("decrement") && cart[index].quantity > 1) {
                cart[index].quantity--;
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        });
    });
};

const updateTotalPriceAndWeight = () => {
    const totalPriceElement = document.querySelector(".total-price");
    const totalWeightElement = document.querySelector(".total-grams"); // Correct class for total weight
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;
    let totalWeight = 0;

    cart.forEach(item => {
        const itemPrice = parseFloat(item.price.replace("₹", ""));
        total += itemPrice * item.quantity;
        totalWeight += item.grams * item.quantity;
    });

    totalPriceElement.textContent = `₹${total.toFixed(2)}`;
    totalWeightElement.textContent = `${totalWeight} gm`;
};

let cartItemCount = 0;
const updateCartCount = count => {
    const cartItemCountBadge = document.querySelector(".cart-item-count");
    cartItemCount = count;
    if (cartItemCount > 0) {
        cartItemCountBadge.style.visibility = "visible";
        cartItemCountBadge.textContent = cartItemCount;
    } else {
        cartItemCountBadge.style.visibility = "hidden";
        cartItemCountBadge.textContent = "";
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const buyNowBtn = document.querySelector(".btn-buy");

    buyNowBtn.addEventListener("click", function () {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const totalAmount = cart.reduce((sum, item) => {
            const itemPrice = parseFloat(item.price.replace("₹", ""));
            return sum + itemPrice * item.quantity;
        }, 0);

        initiateRazorpayCheckout("Your Cart Items", Math.round(totalAmount * 100));
    });
});

function initiateRazorpayCheckout(productName, priceInPaise) {
    var options = {
        "key": "rzp_test_k8WUCdQR2VpySY",
        "amount": priceInPaise,
        "currency": "INR",
        "name": "Randall's Harvest",
        "description": productName,
        "image": "your_logo_url",
        "handler": function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            localStorage.removeItem("cart"); // Clear cart after purchase
            renderCart(); // Refresh cart UI to show empty state
        },
        "prefill": {
            "name": "Customer Name",
            "email": "customer@example.com",
            "contact": "9999999999"
        },
        "theme": {
            "color": "#F37254"
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
}
