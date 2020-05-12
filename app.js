var express = require('express');
var ejs = require('ejs').__express;
var app = express();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');

//set credentials and region
AWS.config.update({region: 'us-east-1'});

var tableName = "domain-passwords";
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

//Create application/x-www-forn-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false})

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);
app.use(express.static(__dirname + '/public'));

//render new ejs file
app.get('/', (req, res) => {
	res.render('index.ejs');
})


app.post('/process_post', urlencodedParser, (req,res) => {
	//Prepare output in JSON format
	var response = {
		"Domain":{S: req.body.Domain},
		"Password":{S: req.body.Password}
	};
	console.log(response);
	
	// write/update response in the "database"
	var params = {
		TableName: tableName,
		Item: response
	};
	ddb.putItem(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});

	res.end("Domain and password recieved by server");
})

app.get('/process_get', (req,res) => {
	//want to search in the "database" for correct value
	
	var params = {
		TableName: tableName,
		Key: {
			"Domain": {"S": req.query.Domain}
		}
	};
	ddb.getItem(params, function(err, data) {
		if (err) res.end("Password not found for specified domain");
		else res.end(JSON.stringify(data));
	})
})

var server = app.listen(8080, () => {
	var host = server.address().address
	var port = 8080

	console.log("Application is listening at http://%s:%s", host, port)
})