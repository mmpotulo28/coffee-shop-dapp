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

	// check if user is owner
	isOwner();

	return state;
}

async function getBalance() {
	let ABI = [
		{
			constant: true,
			inputs: [{ name: '_owner', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ name: 'balance', type: 'uint256' }],
			type: 'function',
		},
	];

	let myWallet = state.account;
	let tokenAddress = '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9';

	let contract = new window.web3.eth.Contract(ABI, tokenAddress);
	let myBalance = await contract.methods.balanceOf(myWallet).call();
	let readableBalance = window.web3.utils.fromWei(myBalance, 'ether');

	// send({ account: '0x0717329c677ab484eaa73f4c8eed92a2fa948746' });
	return readableBalance;
}

async function send({ account }) {
	const gasPrice = await window.web3.eth.getGasPrice();
	const nonce = await window.web3.eth.getTransactionCount(state.account);
	const tx = {
		from: state.account,
		gas: 21000,
		to: account,
		value: window.web3.utils.toWei('1', 'ether'),
		gasPrice: gasPrice,
		nonce: nonce,
	};

	let receipt;
	try {
		receipt = await window.web3.eth.sendTransaction(tx);
		console.log('Transaction receipt:', receipt);
	} catch (error) {
		alert(`Error sending transaction: ${error.message}`);
	}

	return receipt;
}

async function payTo({ account, placeOrderBtn, order }) {
	try {
		placeOrderBtn.textContent = 'Processing...';
		const { contract } = state;
		const { product, quantity, total } = order;
		const coffeeName = product.name;
		let price = total;
		const { image } = product;
		const status = 'pending';

		let celoTotal = total / 13.92;

		const txObject = {
			from: account,
			to: contract.options.address,
			gas: 300000,
			gasPrice: web3.utils.toWei('10', 'gwei'),
			value: total,
			data: contract.methods.orderCoffee(coffeeName, image, price, quantity, status).encodeABI(),
		};

		const tx = await contract.methods
			.orderCoffee(coffeeName, image, price, quantity, status)
			.send(txObject);

		// get all orders
		const orders = await contract.methods.getUserOrders(state.account).call();
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
	const orders = await contract.methods.getUserOrders(state.account).call();
	return orders;
}

// get contract balance
async function getContractBalance() {
	const { contract } = await connectWallet();
	const balance = await contract.methods.getBalance().call();
	return balance;
}

// change owner
async function changeOwner({ account }) {
	const { contract } = await connectWallet();
	try {
		const tx = await contract.methods.changeOwner(account).send({ from: state.account });
		return tx;
	} catch (error) {
		console.error(error);
		alert(`Error changing owner: ${error.message}`);
	}
}

// check if user is owner
async function isOwner() {
	const owner = await state.contract.methods.isOwner(state.account).call();
	console.log('isOwner:', owner);
}

// get all orders
async function getAllOrders() {
	const { contract } = await connectWallet();
	try {
		const orders = await contract.methods.getOrders().call();
		return orders;
	} catch (error) {
		console.error(error);
		alert(`Error getting orders: ${error.message}`);
	}
}

// update order status
async function updateOrderStatus({ orderId, status }) {
	const { contract } = await connectWallet();
	try {
		const tx = await contract.methods
			.changeOrderStatus(orderId, status)
			.send({ from: state.account });
		return tx;
	} catch (error) {
		console.error(error);
		alert(`Error updating order status: ${error.message}`);
	}
}

export { connectWallet, payTo, getOrders, getBalance, isOwner };
