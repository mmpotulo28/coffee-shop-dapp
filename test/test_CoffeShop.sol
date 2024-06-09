// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "truffle/Assert.sol";
import "../contracts/CoffeeShop.sol";

contract TestCoffeeShop {
    CoffeeShop coffeeShop;

    function beforeEach() public {
        coffeeShop = new CoffeeShop();
    }

    function testOrderCoffee() public {
        string memory coffeeName = "Espresso";
        string memory image = "espresso.jpg";
        uint price = 100;
        uint quantity = 1;
        string memory status = "Pending";

        coffeeShop.orderCoffee{value: price}(
            coffeeName,
            image,
            price,
            quantity,
            status
        );

        Assert.equal(
            coffeeShop.getOrdersCount(),
            1,
            "Incorrect number of orders"
        );
        Assert.equal(coffeeShop.getBalance(), price, "Incorrect total funds");
    }

    function testWithdrawFunds() public {
        uint amount = 100;
        coffeeShop.withdrawFunds(amount);

        Assert.equal(
            coffeeShop.getBalance(),
            0,
            "Incorrect total funds after withdrawal"
        );
    }

    function testGetUserOrders() public {
        address account = address(this);

        string memory coffeeName1 = "Cappuccino";
        string memory image1 = "cappuccino.jpg";
        uint price1 = 150;
        uint quantity1 = 2;
        string memory status1 = "Completed";

        string memory coffeeName2 = "Latte";
        string memory image2 = "latte.jpg";
        uint price2 = 120;
        uint quantity2 = 1;
        string memory status2 = "Pending";

        coffeeShop.orderCoffee{value: price1}(
            coffeeName1,
            image1,
            price1,
            quantity1,
            status1
        );
        coffeeShop.orderCoffee{value: price2}(
            coffeeName2,
            image2,
            price2,
            quantity2,
            status2
        );

        CoffeeShop.Order[] memory userOrders = coffeeShop.getUserOrders(
            account
        );

        Assert.equal(userOrders.length, 2, "Incorrect number of user orders");
        Assert.equal(
            userOrders[0].coffeeName,
            coffeeName1,
            "Incorrect coffee name for first order"
        );
        Assert.equal(
            userOrders[1].coffeeName,
            coffeeName2,
            "Incorrect coffee name for second order"
        );
    }
}
