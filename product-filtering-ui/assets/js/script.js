/*
  auther : sijanthapa171
*/


const products = [
  {
    name: 'Sony Playstation 5',
    url: 'assets/images/playstation-5.png',
    category: 'games',
    price: 499.99,
  },
  {
    name: 'Samsung Galaxy',
    url: 'assets/images/samsung-galaxy.png',
    category: 'smartphones',
    price: 399.99,
  },
  {
    name: 'Cannon EOS Camera',
    url: 'assets/images/cannon-eos-camera.png',
    category: 'cameras',
    price: 749.99,
  },
  {
    name: 'Sony A7 Camera',
    url: 'assets/images/sony-a7-camera.png',
    category: 'cameras',
    price: 1999.99,
  },
  {
    name: 'LG TV',
    url: 'assets/images/lg-tv.png',
    category: 'televisions',
    price: 799.99,
  },
  {
    name: 'Nintendo Switch',
    url: 'assets/images/nintendo-switch.png',
    category: 'games',
    price: 299.99,
  },
  {
    name: 'Xbox Series X',
    url: 'assets/images/xbox-series-x.png',
    category: 'games',
    price: 499.99,
  },
  {
    name: 'Samsung TV',
    url: 'assets/images/samsung-tv.png',
    category: 'televisions',
    price: 1099.99,
  },
  {
    name: 'Google Pixel',
    url: 'assets/images/google-pixel.png',
    category: 'smartphones',
    price: 499.99,
  },
  {
    name: 'Sony ZV1F Camera',
    url: 'assets/images/sony-zv1f-camera.png',
    category: 'cameras',
    price: 799.99,
  },
  {
    name: 'Toshiba TV',
    url: 'assets/images/toshiba-tv.png',
    category: 'televisions',
    price: 499.99,
  },
  {
    name: 'iPhone 14',
    url: 'assets/images/iphone-14.png',
    category: 'smartphones',
    price: 999.99,
  },
];

// Get DOM elements
const productsWrapper = document.getElementById('products-wrapper');
const checkboxes = document.querySelectorAll('.check');
const filtersContainer = document.getElementById('filters-container');
const searchInput = document.getElementById('search');
const cartButton = document.getElementById('cart-button');
const cartCount = document.getElementById('cart-count');

// Initialize cart item count
let cartItemCount = 0;

// Initialize products
const productElements = [];

// Loop over the products and create the product elements
products.forEach((product) => {
  const productElement = createProductElement(product);
  productElements.push(productElement);
  productsWrapper.appendChild(productElement);
});

// Add filter event listeners
filtersContainer.addEventListener('change', filterProducts);
searchInput.addEventListener('input', filterProducts);

// Create product element
function createProductElement(product) {
  const productElement = document.createElement('div');

  productElement.className = 'item space-y-2';

  productElement.innerHTML = `<div
  class="bg-gray-100 flex justify-center relative overflow-hidden group cursor-pointer border rounded-xl"
>
  <img
    src="${product.url}"
    alt="${product.name}"
    class="w-full h-full object-cover"
  />
  <button class="status bg-black text-white absolute bottom-0 left-0 right-0 text-center py-2 translate-y-full transition group-hover:translate-y-0"
    >Add To Cart</button
  >
</div>
<p class="text-xl">${product.name}</p>
<strong>$${product.price.toLocaleString()}</strong>`;

  productElement
    .querySelector('.status')
    .addEventListener('click', updateCart);

  return productElement;
}

// Toggle add/remove from cart
function updateCart(e) {
  const statusEl = e.target;

  if (statusEl.classList.contains('added')) {
    // Remove from cart
    statusEl.classList.remove('added');
    statusEl.innerText = 'Add To Cart';
    statusEl.classList.remove('bg-red-600');
    statusEl.classList.add('bg-gray-800');

    cartItemCount--;
  } else {
    // Add to cart
    statusEl.classList.add('added');
    statusEl.innerText = 'Remove From Cart';
    statusEl.classList.remove('bg-gray-800');
    statusEl.classList.add('bg-red-600');

    cartItemCount++;
  }

  // Update cart item count
  cartCount.innerText = cartItemCount.toString();
}

// Filter products by search or checkbox
function filterProducts() {
  // Get search term
  const searchTerm = searchInput.value.trim().toLowerCase();
  // Get checked categories
  const checkedCategories = Array.from(checkboxes)
    .filter((check) => check.checked)
    .map((check) => check.id);

  // Loop over products and check for matches
  productElements.forEach((productElement, index) => {
    const product = products[index];

    // Check to see if product matches the search or checked items
    const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm);
    const isInCheckedCategory =
      checkedCategories.length === 0 ||
      checkedCategories.includes(product.category);

    // Show or hide product based on matches
    if (matchesSearchTerm && isInCheckedCategory) {
      productElement.classList.remove('hidden');
    } else {
      productElement.classList.add('hidden');
    }
  });
}