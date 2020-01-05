const bitcoinRPCConf = require('./bitcoinRPCConf')
const Client = require('bitcoin-core')
const client = new Client(bitcoinRPCConf)

// util to compute unspent outputs for an address
var sumListUnspent = arr => arr.length > 0 ? arr.map( x => x.amount).reduce((x, y) => x+y) : 0
var getAddressBalance = async (addr) => {var utxos = await client.listUnspent(0, 999999999, [addr])
return(sumListUnspent(utxos))};

var fs = require('fs')
var https = require('https')
var http = require('http');
var bodyParser = require("body-parser")
var express = require('express')

// ssl
var key = fs.readFileSync('/etc/letsencrypt/live/ihodl.rocks/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/ihodl.rocks/fullchain.pem')
// graphql
var graphqlHTTP = require('express-graphql');
var { buildSchema, graphql } = require('graphql');

var schema = buildSchema(`
	  input CampaignInput {
		      cause: String
		      goal: Float
		      who: String
			}

	  type Campaign {
		      id: String
		      cause: String
		      goal: Float
		      raised: String
		      who: String
		      status: String
			}
	type Mutation {
		      createCampaign(id: String): Campaign
		      detailsCampaign(id: String, input: CampaignInput): Campaign
		      }

	 type Query {
		      getCampaign(id: String): Campaign 
		    }
	`);

// db rw
var dbExists = id => fs.existsSync("public/campaigns/"+id+".json")
var dbRead = id => JSON.parse(fs.readFileSync("public/campaigns/"+id+".json"))
var dbWrite = campaign  => fs.writeFileSync("public/campaigns/"+campaign.id+".json",JSON.stringify(campaign, null, 2))

// if (fs.existsSync("public/campaigns/"+id+".json")){
class Campaign{
  constructor(id) {
      this.id = id 
      this.cause = null
      this.who = null
      this.goal = null
      this.raised= getAddressBalance(id)
      this.status = "NEW"
    }
  read() {
    var   campaign = dbRead(this.id)
      this.who = campaign.who
      this.goal = campaign.goal
      this.cause = campaign.cause 
      this.id = campaign.id
      this.status = campaign.status
    }

  setDetails({who, goal, cause}){
    this.who = who
    this.goal = goal
    this.cause = cause
  }

  setStatus(status){
    this.status = status
  }

  getStatus(){
    return this.status()
  }


  write(){
    dbWrite(this)
    return this
  }
}

var root = {
  getCampaign: ({id}) => {
   var c = new Campaign(id)
    c.read()
    return c

  },
  createCampaign: ({id}) => {
   var c = new Campaign(id)
    c.write()
    return c
  },
  detailsCampaign: ({id, input}) => {
    var c = new Campaign(id)
    c.read()
    c.setDetails(input)
    c.setStatus("SCANNING")
    c.write()
    return
  } 
}

var https_options = {
  key: key,
  cert: cert
};
var PORT = 443;
var HOST = '0.0.0.0';

var makeRequest = require("./bitmexAPI.js")
app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('/home/davidweisss/iHodLWeb/public/'))

app.get('/', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/index.html')
})

app.get('/Campaign', async function (req, res) {
  var {isvalid} = await client.validateAddress(req.query.address)

  if(isvalid){


    if(!dbExists(req.query.address)) {
      var query = `mutation {
      createCampaign(id: "${req.query.address}"){id}}`
      var {data} = await graphql(schema, query, root)
      console.log("new campaign created.")
    }

    var query = `query {
      getCampaign(id: "${req.query.address}"){status}}`
    var {data} = await graphql(schema, query, root)
    if(data.getCampaign.status==="NEW"){
      if (Object.keys(req.query).length>1){
	var query = `mutation {
      detailsCampaign(id: "${req.query.address}", input: {goal: ${req.query.goal}, who: "${req.query.who}", cause: "${req.query.cause}"}){
	 id}}`
	var {data} = await graphql(schema, query, root)

	res.sendFile('/home/davidweisss/iHodLWeb/public/Campaign.html')

      }
      else{
	res.sendFile('/home/davidweisss/iHodLWeb/public/DetailsCampaign.html')
      }
    }else{

      res.sendFile('/home/davidweisss/iHodLWeb/public/Campaign.html')}
  }  


  else {
    res.send("<h1>Not a valid bitcoin address</h1>")}

})

app.get('/NewCampaign', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/NewCampaign.html')
})


// ihodl
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

