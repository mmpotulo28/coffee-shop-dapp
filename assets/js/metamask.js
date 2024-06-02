const state = {
	connected: false,
	account: null,
};

async function connectWallet() {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum);
		window.ethereum.enable();

		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

		if (accounts.length > 0) {
			state.connected = true;
			state.account = accounts[0];
			alert(`Connected with ${state.account}`);
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

export { connectWallet, getState };
