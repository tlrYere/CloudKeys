var express = require('express');
var ejs = require('ejs').__express;
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

//Create application/x-www-forn-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false})

// original way to render webpage
// app.use(express.static('public'));
// app.get('/index.htm', (req, res) => {
// 	res.sendFile(__dirname + "/" + "index.htm");
// })

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
	response = {
		Domain:req.body.Domain,
		Password:req.body.Password
	};
	console.log(response);
	// write/update response in the "database"

	var data = JSON.stringify(response);

	fs.writeFileSync(__dirname + "/private/passwords/" + req.body.Domain + ".json", data);

	res.end("Domain and password recieved by server");
})

app.get('/process_get', (req,res) => {
	//want to search in the "database" for correct value
	fs.readdir(__dirname + "/private/passwords/", (err, files) => {
		files.forEach(file => {
			if (file === (req.query.Domain + ".json"))
			{
				var rawdata = fs.readFileSync(__dirname + "/private/passwords/" + file);
				var domainPasswordObject = JSON.parse(rawdata);
				console.log(domainPasswordObject);

				res.end(JSON.stringify(domainPasswordObject));
				//res.send("Password for " + req.query.domain_name + ": " + domainPasswordObject.Password);
			}
		})
		// if password not found, return this message
		res.end("Password not found for specified domain");
		}
	)
})

var server = app.listen(9001, () => {
	var host = server.address().address
	var port = server.address().port

	console.log("Application is listening at http://%s:%s", host, port)
})