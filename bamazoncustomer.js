var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  runPurchase();
});

function runPurchase(){
  inquirer
  .prompt({
    name: "action",
    type: "list",
    message: "Here is a list of all available items for sale!",
    choices: [
    "Press 'enter' to view a list of the available inventory",
    ]
  })
.then(function(answer) {
      var query = "SELECT * FROM products";
      connection.query(query, { artist: answer.artist }, function(err, res) {
        for (var i = 0; i < res.length; i++) {
          console.log("Item ID: " + res[i].item_ID + " || Item: " + res[i].product_name + " || Department: " + res[i].department_name);
        }
        purchaseItem();
      })
    })
}

function purchaseItem(){
	console.log('\n  ');
	inquirer.prompt([{
		name: "id",
		type: "input",
		message: " Enter the Item ID of the product you want to purchase",

	}, {
		name: "quantity",
		type: "input",
		message: " Enter the quantity you want to purchase",

	}]).then(function(answer) {
		// Query the database for info about the item including the quantity currently in stock. 
		connection.query('SELECT product_name, department_name, price, stock_quantity FROM products WHERE ?', {Item_ID: answer.id}, function(err,res) {
			
		console.log('\n  You would like to buy ' + answer.quantity + ' ' + res[0].product_name + ' ' + res[0].department_name + ' at $' + res[0].price + ' each'
			);
			if (res[0].stock_quantity >= answer.quantity) {
				//setting new availablity based on ordering

				var itemQuantity = res[0].stock_quantity - answer.quantity;
				connection.query("UPDATE products SET ? WHERE ?", [
				{
					stock_quantity: itemQuantity
				}, {
					ItemID: answer.id
				}], function(err,res) {
					});	
				var cost = res[0].price * answer.quantity;
				console.log('\n  Order fulfilled! Your cost is $' + cost.toFixed(2) + '\n');
				// Order completed
				customerPrompt();
					
			} else {
				//If quantity exceeds availability 
				console.log('\n  Sorry, We can not fill that order!\n');
				// Order not completed
				customerPrompt();
			}
		})
    });
}

var customerPrompt = function() {
    inquirer.prompt({
        name: "action",
        type: "list",

        message: " Would like to continue shopping?\n",
        choices: ["Yes", "No"]
    }).then(function(answer) {
        switch(answer.action) {
            case 'Yes':
                displayForUser();
            break;

            case 'No':
                connection.end();
            break;
        }
    })
};

// Start app by Prompting the customer
customerPrompt();