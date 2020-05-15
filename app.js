var express = require('express');
var ejs = require('ejs').__express;
var app = express();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var path = require('path');

//set region and create KMS
AWS.config.update({region: 'us-east-1'});
var kms = new AWS.KMS();

var tableName = "domain-passwords";
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

//Create application/x-www-forn-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);
app.use(express.static(__dirname + '/public'));

//render new ejs file
app.get('/', (req, res) => {
	res.render('index.ejs');
})

app.post('/process_post', urlencodedParser, (req,res) => {
	//Encrypt password
	var parameters = {
		KeyId: "arn:aws:kms:us-east-1:228610466131:key/f375a90d-f790-44ec-b31e-cd2e64901bf3",
		Plaintext: req.body.Password
	}

	var bufferObj;

	kms.encrypt(parameters, function(err, data) {
		if (err)
			console.log(err, err.stack)
		else
		{
			console.log(data.CiphertextBlob)
			
			var params = {
				ExpressionAttributeNames: {
					"#P": "Password"
				},
				ExpressionAttributeValues: {
					":p": {S: data.CiphertextBlob.toString('base64')}
				},
				Key: {
					"Domain": {S: req.body.Domain}
				},
				TableName: tableName,
				UpdateExpression: "SET #P = :p"
			};

			ddb.updateItem(params, function(err, dataPI) {
				if (err)
					console.error("Unable to add item: Error JSON:", JSON.stringify(err, null, 2));
				else
					res.end("Added/Updated Item: " + "Domain: " + req.body.Domain + ", Password: " + req.body.Password);
			})
		}
	})
})

app.get('/process_get', (req,res) => {
	//want to search in the "database" for correct value
	var returnValue;
	var params = {
		TableName: tableName,
		Key: {
			"Domain": {"S": req.query.Domain}
		}
	};
	ddb.getItem(params, function(err, data) {
		if (err || !data.Item)
		{
			console.log("Password not found for specified domain");
			res.end("Password not found for specified Domain: " + req.query.Domain);
		}
		else 
		{
			var paramsD = {
				KeyId: "arn:aws:kms:us-east-1:228610466131:key/f375a90d-f790-44ec-b31e-cd2e64901bf3",
				CiphertextBlob: Buffer.from(data.Item.Password.S, 'base64')
			};
			kms.decrypt(paramsD, function(err, dataD) {
				if (err)
				{
					console.log("Something went wrong while decrypting...");
					console.log(err, err.stack);
					res.end("Something went wrong while decrypting...");
				}
				else
					res.end("Password: " + dataD.Plaintext.toString("ascii"));
			})
		}
	})
})

var server = app.listen(8080, () => {
	var host = server.address().address
	var port = 8080

	console.log("Application is listening at http://%s:%s", host, port)
})