import { connectWallet, getAllOrders, getBalance, getContractBalance } from './metamask.js';

const pendingOrderItems = document.querySelector('.pending-order-items');
const customerWallet = document.querySelector('.customer-wallet');
const customerBalance = document.querySelector('.customer-balance');
const contractOrders = document.querySelector('.contract-orders');
const contractBalance = document.querySelector('.contract-balance');
const walletAddress = document.querySelector('.wallet-address');

async function renderPendingOrders() {
	const orders = await getAllOrders();

	if (orders.length === 0) {
		pendingOrderItems.innerHTML = '<p>No pending orders available</p>';
		return;
	}

	pendingOrderItems.innerHTML = '';

	for (let order of orders) {
		const orderHTML = `
      <div class="order-item">
							<img src="./assets/img/${order.image}" alt="${order.coffeeName}" />
							<div class="order-details">
								<h3>${order.coffeeName}</h3>
        <p class="order-user">User: ${order.customer}</p>
								<p>Order ID: 00${orders.indexOf(order)}</p>
								<p>Price: ${order.price / order.quantity}</p>
								<p>Quantity: ${order.quantity}</p>
								<p>Total: ${order.price}</p>
							</div> </div
						>
      `;
		pendingOrderItems.innerHTML += orderHTML;
	}
}

renderPendingOrders();
getDetails();

// get details
async function getDetails() {
	const { account } = await connectWallet();
	if (!account) {
		return;
	}
	customerWallet.textContent = account;
	walletAddress.textContent = account;
	let balance = await getBalance();
	customerBalance.textContent = `${balance} CELO`;

	const orders = await getAllOrders();
	contractOrders.textContent = orders.length;
}
