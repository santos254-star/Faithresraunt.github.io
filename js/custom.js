// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}

function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function applyMenuSearch() {
    var query = getQueryParam('q');
    if (!query) return;
    var term = query.toLowerCase();
    var boxes = document.querySelectorAll('.filters-content .box');
    var found = false;

    boxes.forEach(function(box) {
        var title = box.querySelector('h5');
        var description = box.querySelector('p');
        var titleText = title ? title.textContent.toLowerCase() : '';
        var descText = description ? description.textContent.toLowerCase() : '';
        var parent = box.closest('.col-sm-6');

        if (parent) {
            if (titleText.indexOf(term) !== -1 || descText.indexOf(term) !== -1) {
                parent.style.display = 'block';
                found = true;
            } else {
                parent.style.display = 'none';
            }
        }
    });

    if (!found) {
        var content = document.querySelector('.filters-content');
        if (content) {
            var message = document.createElement('div');
            message.className = 'search-no-results';
            message.textContent = 'No menu items found for "' + query + '".';
            content.insertBefore(message, content.firstChild);
        }
    }

    var headerInput = document.querySelector('.search-input');
    if (headerInput) {
        headerInput.value = query;
        var headerForm = headerInput.closest('.search-form');
        if (headerForm) {
            headerForm.classList.add('open');
        }
    }
}

function toggleHeaderSearch(event) {
    var button = event.target.closest('.nav_search-btn');
    if (!button) return false;
    event.preventDefault();
    var form = button.closest('.search-form');
    if (!form) return false;

    var input = form.querySelector('.search-input');
    if (!input) return false;

    if (!form.classList.contains('open')) {
        form.classList.add('open');
        input.focus();
    } else if (input.value.trim() === '') {
        form.classList.remove('open');
    } else {
        var query = encodeURIComponent(input.value.trim());
        window.location.href = 'menu.html?q=' + query;
    }
    return true;
}

function closeHeaderSearch(event) {
    var clickInside = event.target.closest('.search-form');
    if (clickInside) return;

    var openForms = document.querySelectorAll('.search-form.open');
    openForms.forEach(function(form) {
        form.classList.remove('open');
    });
}

getYear();


// isotope js
$(window).on('load', function () {
    $('.filters_menu li').click(function () {
        $('.filters_menu li').removeClass('active');
        $(this).addClass('active');

        var data = $(this).attr('data-filter');
        $grid.isotope({
            filter: data
        })
    });

    var $grid = $(".grid").isotope({
        itemSelector: ".all",
        percentPosition: false,
        masonry: {
            columnWidth: ".all"
        }
    });

    applyMenuSearch();
});

// nice select
$(document).ready(function() {
    $('select').niceSelect();
    applyMenuSearch();

    document.addEventListener('click', function(event) {
        if (!toggleHeaderSearch(event)) {
            closeHeaderSearch(event);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            var input = document.activeElement;
            if (input && input.classList.contains('search-input')) {
                event.preventDefault();
                var query = input.value.trim();
                if (query) {
                    window.location.href = 'menu.html?q=' + encodeURIComponent(query);
                } else {
                    var form = input.closest('.search-form');
                    if (form) {
                        form.classList.remove('open');
                    }
                }
            }
        }
    });
  });

/** google_map js **/
function myMap() {
    var embu = { lat: -0.5204, lng: 37.4570 };
    var mapProp = {
        center: embu,
        zoom: 14,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    new google.maps.Marker({
        position: embu,
        map: map,
        title: 'Embu, Kenya'
    });

    var input = document.getElementById('mapSearchInput');
    if (input && google.maps.places) {
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();
            if (!places || places.length === 0) {
                return;
            }

            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                if (!place.geometry || !place.geometry.location) {
                    return;
                }

                bounds.extend(place.geometry.location);
                new google.maps.Marker({
                    map: map,
                    position: place.geometry.location
                });
            });

            map.fitBounds(bounds);
        });
    }
}

// client section owl carousel
$(".client_owl-carousel").owlCarousel({
    loop: true,
    margin: 0,
    dots: false,
    nav: true,
    navText: [],
    autoplay: true,
    autoplayHoverPause: true,
    navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>'
    ],
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        1000: {
            items: 2
        }
    }
});

(function() {
    var cart = [];
    var cartPanel = document.getElementById('cartPanel');
    var cartToggle = document.getElementById('cartToggle');
    var closeCart = document.getElementById('closeCart');
    var placeOrderButton = document.getElementById('placeOrder');
    var cartCount = document.getElementById('cartCount');
    var cartItemsContainer = document.getElementById('cartItems');
    var cartTotal = document.getElementById('cartTotal');
    var paymentInstructions = document.getElementById('paymentInstructions');
    var mpesaNumberInput = document.getElementById('mpesaNumber');

    function formatPrice(value) {
        return value.toFixed(0);
    }

    function validateMpesaNumber(number) {
        if (!number) return false;
        var cleaned = number.replace(/[^0-9+]/g, '');
        if (cleaned.startsWith('+254')) {
            return cleaned.length === 13;
        }
        if (cleaned.startsWith('254')) {
            return cleaned.length === 12;
        }
        return cleaned.length === 10 && cleaned.startsWith('07');
    }

    function showPaymentInstructions(amount, userNumber) {
        if (!paymentInstructions) return;
        var numberText = userNumber ? ' from <strong>' + userNumber + '</strong>' : '';
        paymentInstructions.innerHTML = '<strong>Pay with M-Pesa</strong><br>' +
            'Please send <strong>KSh ' + formatPrice(amount) + '</strong> to:<br>' +
            'Number <strong>0117030765</strong>' + numberText + '<br>' +
            'Use your name as the reference and keep the M-Pesa receipt.';
        paymentInstructions.classList.add('open');
    }


    function getCartQuantity() {
        return cart.reduce(function(total, item) {
            return total + item.quantity;
        }, 0);
    }

    function getCartAmount() {
        return cart.reduce(function(total, item) {
            return total + item.price * item.quantity;
        }, 0);
    }

    function updateCartUI() {
        if (!cartCount || !cartItemsContainer || !cartTotal) return;

        if (paymentInstructions && cart.length > 0) {
            paymentInstructions.classList.remove('open');
        }

        cartCount.textContent = getCartQuantity();
        cartTotal.textContent = formatPrice(getCartAmount());

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(function(item) {
            return '<div class="cart-item">' +
                '<div class="cart-item-name">' + item.name + '</div>' +
                '<div class="cart-item-details">Qty: ' + item.quantity + ' × KSh ' + formatPrice(item.price) + ' = KSh ' + formatPrice(item.price * item.quantity) + '</div>' +
                '<button class="cart-remove" data-key="' + item.key + '">Remove</button>' +
                '</div>';
        }).join('');
    }

    function openCart() {
        if (cartPanel) {
            cartPanel.classList.add('open');
        }
    }

    function closeCartPanel() {
        if (cartPanel) {
            cartPanel.classList.remove('open');
        }
    }

    function addToCart(name, price) {
        var key = name + '|' + price;
        var existing = cart.find(function(item) {
            return item.key === key;
        });

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ key: key, name: name, price: price, quantity: 1 });
        }

        updateCartUI();
        openCart();
    }

    function removeFromCart(key) {
        cart = cart.filter(function(item) {
            return item.key !== key;
        });
        updateCartUI();
    }

    function placeOrder() {
        if (cart.length === 0) {
            alert('Your cart is empty. Add items before placing an order.');
            return;
        }

        if (!mpesaNumberInput) {
            alert('Enter your M-Pesa number before payment.');
            return;
        }

        var userNumber = mpesaNumberInput.value.trim();
        if (!validateMpesaNumber(userNumber)) {
            alert('Please enter a valid M-Pesa number. Use 07XXXXXXXX or +2547XXXXXXXX.');
            mpesaNumberInput.focus();
            return;
        }

        var amount = getCartAmount();
        
        // Save order to localStorage for reports
        var order = {
            timestamp: new Date().toISOString(),
            items: cart.map(function(item) {
                return {
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                };
            }),
            total: amount,
            phone: userNumber
        };
        
        var orders = JSON.parse(localStorage.getItem('faithOrders')) || [];
        orders.push(order);
        localStorage.setItem('faithOrders', JSON.stringify(orders));
        
        showPaymentInstructions(amount, userNumber);
        
        // Clear cart after successful order
        cart = [];
        updateCartUI();
        
        // Scroll to payment instructions
        if (paymentInstructions) {
            setTimeout(function() {
                paymentInstructions.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    document.addEventListener('click', function(event) {
        var target = event.target;
        var button = target.matches('.add-to-cart') ? target : target.closest('.add-to-cart');

        if (button) {
            event.preventDefault();
            var name = button.getAttribute('data-name') || '';
            var price = parseFloat(button.getAttribute('data-price')) || 0;
            addToCart(name, price);
            return;
        }

        if (target === cartToggle || target.closest('#cartToggle')) {
            event.preventDefault();
            openCart();
            return;
        }

        if (target === closeCart || target.closest('#closeCart')) {
            event.preventDefault();
            closeCartPanel();
            return;
        }

        if (target === placeOrderButton || target.closest('#placeOrder')) {
            event.preventDefault();
            placeOrder();
            return;
        }

        if (target.matches('.cart-remove')) {
            event.preventDefault();
            var key = target.getAttribute('data-key');
            removeFromCart(key);
            return;
        }
    });

    updateCartUI();
})();