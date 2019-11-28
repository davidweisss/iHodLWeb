var fs require('fs');
// key not synched on git
var key = fs.readFileSync('./selfCert.key');
var cert = fs.readFileSync('./selfCert.crt');
var https = require('https');
var http = require('http');
var express = require('express');
var fs = require('fs')
var url = require('url')
const secrets = require('./secrets')
const Client = require('bitcoin-core')
const client = new Client(secrets);


var https_options = {
	key: key,
	cert: cert
};

var PORT = 443;
var HOST = '0.0.0.0';
app = express();
app.get('/', function (req, res) {
	//res.sendFile('/home/davidweisss/BitcoinAPI/bitcoinAPI.html')
	client.getWalletInfo().then((data) => res.send('Wallet has:' + String(data.balance)+' BTC'));
})


app.get('/balance', function (req, res) {
	//res.sendFile('/home/davidweisss/BitcoinAPI/bitcoinAPI.html')
	res.set('Access-Control-Allow-Origin','*')
	client.getWalletInfo().then((data) => res.send(String(data.balance)));
})

app.get('/address.:address', function (req, res){ 
	//res.sendFile('/home/davidweisss/BitcoinAPI/bitcoinAPI.html')
	res.set('Access-Control-Allow-Origin','*')
	client.getReceivedByAddress(req.params.address)
		.then(
			(data) => {
				res.send(String(data))
			}
		)
}
																									)


server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);
// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
	res.end();
}).listen(80);
