import products from './products.js';
const productItems = document.querySelector('.product-items');
const popupOrder = document.querySelector('.order-popup');

function renderProducts() {
	productItems.innerHTML = '';

	products.forEach((product) => {
		const productItem = document.createElement('div');
		productItem.classList.add('product-item');
		productItem.id = product.id;
		productItem.innerHTML = `
						<img src="./assets/img/${product.image}" alt="${product.name}" />
						<h3>${product.name}</h3>
						<div class="actions">
							<p>Price: R${product.price}</p>
							<button class="order-btn" id="${product.id}">Order</button>
						</div>
  `;

		productItems.appendChild(productItem);
	});
}

renderProducts();

// list click on products
const orderBtns = document.querySelectorAll('.order-btn');
orderBtns.forEach((btn) => {
	btn.addEventListener('click', (e) => {
		const productId = e.target.id;
		const product = products.find((product) => product.id == productId);
		showOrder(product);
	});
});

function showOrder(product) {
	const popupContent = `
 <h1>Place your Order</h1>
	<button class="close-btn"><i class="fa fa-sign-out-alt"></i></button>
 <div class="order-popup-content">
					<img src="./assets/img/${product.image}" alt="${product.name}" />
					<form id="order-form">
						<div class="form-group">
							<label for="quantity">Quantity</label>
							<input type="number" id="quantity" name="quantity" min="1" max="10" value="1" required />
						</div>
      <div class="form-group">
       <h3>Total: R<span id="total">${product.price}</span></h3>
      </div>
						<button type="submit">Place Order</button>
					</form>
				</div>
 `;

	popupOrder.innerHTML = popupContent;
	popupOrder.style.display = 'flex';

	const closeOrder = document.querySelector('.close-btn');
	closeOrder.addEventListener('click', () => {
		popupOrder.style.display = 'none';
	});

	const quantityInput = document.querySelector('#quantity');
	const total = document.querySelector('#total');
	quantityInput.addEventListener('input', () => {
		if (quantityInput.value < 1) {
			quantityInput.value = 1;
		} else if (quantityInput.value > 10) {
			quantityInput.value = 10;
		} else if (quantityInput.value % 1 !== 0) {
			quantityInput.value = Math.round(quantityInput.value);
		}
		total.textContent = quantityInput.value * product.price;
	});

	const orderForm = document.querySelector('#order-form');
	orderForm.addEventListener('submit', (e) => {
		e.preventDefault();
		placeOrder({ product, total: total.textContent });
	});
}

function placeOrder({ product, total }) {}
