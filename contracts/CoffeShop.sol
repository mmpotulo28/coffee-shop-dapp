// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract CoffeeShop {
    uint public totalFunds;

    receive() external payable {
        totalFunds += msg.value;
    }

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // check if the caller is the owner
    function isOwner(address account) public view returns (bool) {
        return account == owner;
    }

    function withdrawFunds(uint amount) public onlyOwner {
        require(amount <= totalFunds, "Insufficient funds");
        payable(msg.sender).transfer(amount);
        totalFunds -= amount;
    }

    function getBalance() public view returns (uint) {
        return totalFunds;
    }

    // get user balance
    function getUserBalance() public view returns (uint) {
        return msg.sender.balance;
    }

    struct Order {
        address customer;
        string coffeeName;
        string image;
        uint price;
        uint quantity;
        string status;
    }

    Order[] public orders;

    function orderCoffee(
        string memory coffeeName,
        string memory image,
        uint price,
        uint quantity,
        string memory status
    ) public payable {
        require(msg.value == price, "Incorrect payment amount");

        Order memory order = Order(
            msg.sender,
            coffeeName,
            image,
            price,
            quantity,
            status
        );
        orders.push(order);

        // use the recieve method to store the payment
        totalFunds += msg.value;
    }

    function getOrdersCount() public view returns (uint) {
        return orders.length;
    }

    // get orders
    function getOrders() public view returns (Order[] memory) {
        return orders;
    }

    // get user orders
    function getUserOrders(
        address account
    ) public view returns (Order[] memory) {
        uint userOrderCount = 0;
        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].customer == account) {
                userOrderCount++;
            }
        }

        Order[] memory userOrders = new Order[](userOrderCount);
        uint index = 0;
        for (uint i = 0; i < orders.length; i++) {
            if (orders[i].customer == account) {
                userOrders[index] = orders[i];
                index++;
            }
        }

        return userOrders;
    }
}
