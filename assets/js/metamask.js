const state = {
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
			return state;
		} else {
			alert('Please connect with MetaMask to use this dApp!');
		}
	} else {
		alert('Please install MetaMask to use this dApp!');
	}
}

function getState() {
	return state;
}

async function payTo({ account, amount, placeOrderBtn }) {
	// convert ammount from rands  to cUSD using the current exhange rate
	amount = amount / 16;

	// convert amount to wei
	amount = window.web3.utils.toWei(amount.toString(), 'ether');
	console.log(amount);

	placeOrderBtn.textContent = 'Processing...';

	if (account) {
		const options = {
			to: '0x28323adb899EE5ea8E4C3C24DFe3E38E1117C559',
			value: amount,
			from: account,
			gas: 5000000,
		};

		await window.web3.eth
			.sendTransaction(options)
			.on('receipt', (receipt) => {
				console.log(`Transaction successful! Transaction hash: ${receipt.transactionHash}`);
				placeOrderBtn.textContent = 'Order Placed!';
				placeOrderBtn.disabled = true;
			})
			.on('error', (error) => {
				console.error(error);
				alert('Transaction failed!', error);
				placeOrderBtn.textContent = 'Place Order';
			});
	} else {
		alert('Please connect with MetaMask to use this dApp!');
		placeOrderBtn.textContent = 'Place Order';
	}
}

export { connectWallet, getState, payTo };
