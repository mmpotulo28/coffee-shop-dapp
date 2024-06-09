// Owner can withdraw funds successfully
import { expect } from "chai";

const CoffeeShop = artifacts.require("CoffeeShop");

contract("CoffeeShop", function (accounts) {
  it("owner_can_withdraw_funds_successfully", async function () {
    const owner = accounts[0];
    const addr1 = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    // Send some funds to the contract
    await web3.eth.sendTransaction({
      from: addr1,
      to: coffeeShop.address,
      value: web3.utils.toWei("1", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(owner);

    // Withdraw funds
    await coffeeShop.withdrawFunds(web3.utils.toWei("1", "ether"));

    const finalBalance = await web3.eth.getBalance(owner);
    expect(finalBalance).to.be.above(initialBalance);
  });
});

// Non-owner trying to withdraw funds
contract("CoffeeShop", function (accounts) {
  it("non_owner_cannot_withdraw_funds", async function () {
    const owner = accounts[0];
    const addr1 = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    // Send some funds to the contract
    await web3.eth.sendTransaction({
      from: addr1,
      to: coffeeShop.address,
      value: web3.utils.toWei("1", "ether"),
    });

    // Try to withdraw funds as non-owner
    await expect(
      coffeeShop.withdrawFunds(web3.utils.toWei("1", "ether"), { from: addr1 })
    ).to.be.rejectedWith("Only the owner can call this function");
  });
});

// Users can place an order with correct payment amount
contract("CoffeeShop", function (accounts) {
  it("users_can_place_order_with_correct_payment_amount", async function () {
    const owner = accounts[0];
    const user = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    // Place an order with correct payment amount
    const coffeeName = "Latte";
    const image = "latte.jpg";
    const price = web3.utils.toWei("2", "ether");
    const quantity = 1;
    const status = "Pending";

    const initialBalance = await web3.eth.getBalance(coffeeShop.address);

    await coffeeShop.orderCoffee(coffeeName, image, price, quantity, status, { from: user, value: price });

    const ordersCount = await coffeeShop.getOrdersCount();
    const orders = await coffeeShop.getOrders();

    expect(ordersCount).to.equal(1);
    expect(orders[0].customer).to.equal(user);
    expect(orders[0].coffeeName).to.equal(coffeeName);
    expect(orders[0].image).to.equal(image);
    expect(orders[0].price).to.equal(price);
    expect(orders[0].quantity).to.equal(quantity);
    expect(orders[0].status).to.equal(status);

    const finalBalance = await web3.eth.getBalance(coffeeShop.address);
    expect(finalBalance).to.equal(initialBalance.add(price));
  });
});

// Total funds increase when an order is placed
contract("CoffeeShop", function (accounts) {
  it("total_funds_increase_when_order_placed", async function () {
    const owner = accounts[0];
    const addr1 = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    const initialBalance = await web3.eth.getBalance(coffeeShop.address);

    // Place an order
    await coffeeShop.orderCoffee("Latte", "latte.jpg", web3.utils.toWei("2", "ether"), 1, "pending", { from: addr1 });

    const finalBalance = await web3.eth.getBalance(coffeeShop.address);
    expect(finalBalance).to.be.above(initialBalance);
  });
});

// Users can retrieve all orders
contract("CoffeeShop", function (accounts) {
  it("should allow users to retrieve all orders", async function () {
    const coffeeShop = await CoffeeShop.deployed();

    // Order some coffee
    await coffeeShop.orderCoffee("Latte", "latte.jpg", web3.utils.toWei("3", "ether"), 1, "Pending");
    await coffeeShop.orderCoffee("Espresso", "espresso.jpg", web3.utils.toWei("2", "ether"), 2, "Completed");

    // Retrieve all orders
    const orders = await coffeeShop.getOrders();

    // Check if all orders are retrieved
    expect(orders.length).to.equal(2);
    expect(orders[0].coffeeName).to.equal("Latte");
    expect(orders[1].coffeeName).to.equal("Espresso");
  });
});

// Users can retrieve their specific orders
contract("CoffeeShop", function (accounts) {
  it("should allow users to retrieve their specific orders", async function () {
    const owner = accounts[0];
    const user = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    // Place an order for the user
    await coffeeShop.orderCoffee("Latte", "latte.jpg", web3.utils.toWei("3", "ether"), 1, "Pending", { from: user });

    // Retrieve user's orders
    const userOrders = await coffeeShop.getUserOrders(user);

    // Check if the order details match
    expect(userOrders.length).to.equal(1);
    expect(userOrders[0].customer).to.equal(user);
    expect(userOrders[0].coffeeName).to.equal("Latte");
    expect(userOrders[0].price).to.equal(web3.utils.toWei("3", "ether"));
    expect(userOrders[0].quantity).to.equal(1);
    expect(userOrders[0].status).to.equal("Pending");
  });
});

// Users can get the total number of orders
contract("CoffeeShop", function (accounts) {
  it("should return the total number of orders", async function () {
    const coffeeShop = await CoffeeShop.deployed();

    // Order some coffees
    await coffeeShop.orderCoffee("Latte", "latte.jpg", web3.utils.toWei("3", "ether"), 1, "pending");
    await coffeeShop.orderCoffee("Espresso", "espresso.jpg", web3.utils.toWei("2", "ether"), 2, "completed");

    // Get the total number of orders
    const ordersCount = await coffeeShop.getOrdersCount();

    // Assert the total number of orders
    expect(ordersCount).to.equal(2);
  });
});

// Retrieving orders when no orders exist
contract("CoffeeShop", function (accounts) {
  it("should return an empty array when no orders exist", async function () {
    const coffeeShop = await CoffeeShop.deployed();

    const orders = await coffeeShop.getOrders();
    expect(orders).to.be.an('array').that.is.empty;
  });
});

// Withdrawing more funds than available
contract("CoffeeShop", function (accounts) {
  it("should revert when trying to withdraw more funds than available", async function () {
    const owner = accounts[0];

    const coffeeShop = await CoffeeShop.deployed();

    // Send some funds to the contract
    await web3.eth.sendTransaction({
      from: owner,
      to: coffeeShop.address,
      value: web3.utils.toWei("1", "ether"),
    });

    // Try to withdraw more funds than available
    await expect(coffeeShop.withdrawFunds(web3.utils.toWei("2", "ether"))).to.be.rejected;
  });
});

// Placing an order with incorrect payment amount
contract("CoffeeShop", function (accounts) {
  it("should revert if payment amount is incorrect", async function () {
    const owner = accounts[0];
    const customer = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    // Place an order with incorrect payment amount
    await expect(coffeeShop.orderCoffee("Latte", "latte.jpg", web3.utils.toWei("2", "ether"), 1, "pending", { from: customer }))
      .to.be.rejectedWith("Incorrect payment amount");
  });
});

// Owner can check if an address is the owner
contract("CoffeeShop", function (accounts) {
  it("owner_can_check_if_address_is_owner", async function () {
    const owner = accounts[0];
    const addr1 = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    const isOwner = await coffeeShop.isOwner(owner);
    expect(isOwner).to.be.true;

    const isNotOwner = await coffeeShop.isOwner(addr1);
    expect(isNotOwner).to.be.false;
  });
});

// Users can place multiple orders
contract("CoffeeShop", function (accounts) {
  it("users_can_place_multiple_orders", async function () {
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    const coffeeShop = await CoffeeShop.deployed();

    // User 1 places an order
    await coffeeShop.orderCoffee("Latte", "latte.jpg", web3.utils.toWei("3", "ether"), 1, "Pending", { from: user1 });

    // User 2 places an order
    await coffeeShop.orderCoffee("Espresso", "espresso.jpg", web3.utils.toWei("2", "ether"), 2, "Pending", { from: user2 });

    const ordersCount = await coffeeShop.getOrdersCount();
    expect(ordersCount).to.equal(2);
  });
});

// Total funds do not change when checking balances
contract("CoffeeShop", function (accounts) {
  it("total_funds_do_not_change_when_checking_balances", async function () {
    const coffeeShop = await CoffeeShop.deployed();

    const initialTotalFunds = await coffeeShop.getBalance();

    // Check user balance
    const userBalance = await coffeeShop.getUserBalance();

    const finalTotalFunds = await coffeeShop.getBalance();
    expect(finalTotalFunds).to.equal(initialTotalFunds);
  });
});

// Users can retrieve their balance
contract("CoffeeShop", function (accounts) {
  it("users_can_retrieve_their_balance", async function () {
    const owner = accounts[0];
    const addr1 = accounts[1];

    const coffeeShop = await CoffeeShop.deployed();

    // Get user balance
    const userBalance = await coffeeShop.getUserBalance({ from: addr1 });

    expect(userBalance).to.equal(await web3.eth.getBalance(addr1));
  });
});
