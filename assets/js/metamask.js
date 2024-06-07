let state = {
	connected: false,
	account: null,
};

async function connectWallet() {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum);
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

		if (accounts.length > 0) {
			state.connected = true;
			state.account = accounts[0];
		} else {
			alert('Please connect with MetaMask to use this dApp!');
		}
	} else {
		alert('Please install MetaMask to use this dApp!');
	}

	// load contract
	state = (await loadContract(window.web3)) || state;
	return state;
}

// load smart contract
async function loadContract(web3) {
	console.log('loading contract');
	const { origin } = window.location;
	const response = await fetch(`${origin}/abis/CoffeeShop.json`);
	const data = await response.json();
	const networkId = await web3.eth.net.getId();
	const network = data.networks[networkId];

	if (!network) {
		alert(
			'Contract not deployed to the current network. Please select another network with Metamask.',
		);
		return;
	}

	const { abi } = data;
	const { address } = network;
	const contract = new web3.eth.Contract(abi, address);

	state.contract = contract;
	state.address = address;
	state.networkId = networkId;

	console.log(state);

	return state;
}

async function payTo({ account, placeOrderBtn, order }) {
	try {
		placeOrderBtn.textContent = 'Processing...';
		const { contract } = state;
		const { product, quantity, total } = order;
		const coffeeName = product.name;
		let price = total;
		const { image } = product;

		let celoTotal = total / 13.92;

		const txObject = {
			from: account,
			to: contract.options.address,
			gas: 300000, // Increase the gas value to 300000 or higher
			gasPrice: web3.utils.toWei('10', 'gwei'),
			value: total,
			data: contract.methods.orderCoffee(coffeeName, image, price, quantity).encodeABI(),
		};

		const tx = await contract.methods.orderCoffee(coffeeName, image, price, quantity).send(txObject);

		// get balanceof contract
		const balance = await contract.methods.getBalance().call();
		// get number of orders
		const orderCount = await contract.methods.getOrdersCount().call();
		// get all orders
		const orders = await contract.methods.getOrders().call();

		console.log('balance:', balance);
		console.log('orderCount:', orderCount);
		console.log('orders:', orders);

		console.log(tx);
		alert('Order placed successfully!');
		placeOrderBtn.textContent = 'Order Placed!';
		placeOrderBtn.disabled = true;
	} catch (error) {
		console.error(error);
		alert(`Error placing order: ${error.message}`);
		placeOrderBtn.textContent = 'Try Again!';
	}
}

async function getOrders() {
	const { contract } = await connectWallet();
	const orders = await contract.methods.getOrders().call();
	return orders;
}

async function getUserBalance() {
	const { contract } = await connectWallet();
	const balance = await contract.methods.getUserBalance().call();
	return balance;
}

export { connectWallet, payTo, getOrders, getUserBalance };
