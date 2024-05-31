const { Web3 } = require('web3');
const rpcURL = 'https://forno.celo.org';
const web3 = new Web3(rpcURL);

let myWallet = '0x47e74169f174fae15d374684a7e277e2ef3a7acf';
let fzarAddress = '0x9DD41d990B0C40b575EAa9d3e5c0d2d6112b2b85';

let ABI = [
	{
		constant: true,
		inputs: [{ name: '_owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: 'balance', type: 'uint256' }],
		type: 'function',
	},
];

async function getBalance() {
	let contract = new web3.eth.Contract(ABI, fzarAddress);

	let myBalance = await contract.methods.balanceOf(myWallet).call();

	let readableBalance = web3.utils.fromWei(myBalance, 'ether');

	console.log('My balance is R', readableBalance);
}

getBalance();
