var express = require('express')
var fs = require('fs');
var key = fs.readFileSync('/etc/letsencrypt/live/iHodL.rocks/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/iHodL.rocks/fullchain.pem')
var https = require('https');
var http = require('http');
var https_options = {
	key: key,
	cert: cert
};
var PORT = 443;
var HOST = '0.0.0.0';
app = express();
app.get('/', function (req, res) {
	res.sendFile('/home/davidweisss/Belbit/app/build/index.html')
})
app.use(express.static('/home/davidweisss/Belbit/app/build'));
server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
	res.end();
}).listen(80);
