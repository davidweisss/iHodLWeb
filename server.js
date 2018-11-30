var express = require('express')
var fs = require('fs');
var key = fs.readFileSync('/etc/letsencrypt/live/ihodl.rocks/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/ihodl.rocks/fullchain.pem')
var https = require('https')
var http = require('http');
var https_options = {
	key: key,
	cert: cert
};
var PORT = 443;
var HOST = '0.0.0.0';
var bodyParser = require("body-parser")

var makeRequest = require("./bitmexAPI.js")
app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('/home/davidweisss/iHodLWeb/public/'))

app.get('/', function (req, res) {
	console.log("Logging")
	res.sendFile('/home/davidweisss/iHodLWeb/index.html')
})

app.get('/xbtusd', function (req, res) {
	(async function main() {
		console.log("Getting xbtusd quote")
		try {
			const result = await makeRequest('GET', 'position', {
				filter: { symbol: 'XBTUSD' },
				columns: ['currentQty', 'avgEntryPrice'],
			});
			console.log(result);
		} catch (e) {
			console.error(e);
		};
	}());
})

app.post('/requestReceipt.html', (req, res) => {
	const bitcoinPublicKey= req.body.bitcoinPublicKey
	const shippingAddress= req.body.shippingAddress
	fs.appendFileSync('/home/davidweisss/reservations', Date.now() + "\n" + bitcoinPublicKey + "\n" + shippingAddress + "\n"  );

	console.log(bitcoinPublicKey, shippingAddress)
	res.sendFile('/home/davidweisss/iHodLWeb/public/requestReceipt.html')
})

server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
	res.end();
}).listen(80);
