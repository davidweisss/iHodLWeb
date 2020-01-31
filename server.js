var querystring = require('querystring');
const bitcoinRPCConf = require('./bitcoinRPCConf')
const Client = require('bitcoin-core')
const client = new Client(bitcoinRPCConf)
setInterval(() => { console.log("rescanning");client.rescanBlockchain()}, 28800000)

var fs = require('fs')
var https = require('https')
var http = require('http');
var bodyParser = require("body-parser")
var express = require('express')

// bitmex
var makeRequest = require("./bitmexAPI.js")
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

	input CampaignUpdateInput {
		      cause: String
		      goal: Float
		      who: String
		      signature: String
			}
	type Campaign {
		      id: String
		      cause: String
		      goal: Float
		      raised: String
		      who: String
		      created: String
		      status: String
		      ismine: Boolean
		      iswatchonly: Boolean
			}
	type Mutation {
		      createCampaign(id: String): Campaign
		      detailsCampaign(id: String, input: CampaignInput): Campaign
		      updateCampaign(id: String, input: CampaignUpdateInput): Campaign
		      }

	type Query {
		      getCampaign(id: String): Campaign 
		    }
	`);

// util to compute unspent outputs for an address
var sumListUnspent = arr => arr.length > 0 ? arr.map( x => x.amount).reduce((x, y) => x+y) : 0
var getAddressBalance = async (addr) => {var utxos = await client.listUnspent(0, 999999999, [addr])
return(sumListUnspent(utxos))};
// import address as watch only (don't rescan, this is done periodically


var getIsWatchOnly = async (addr) => { const {iswatchonly} = await client.getAddressInfo(addr)
  return iswatchonly
}
var getIsMine= async (addr) => { const {ismine} = await client.getAddressInfo(addr)
  return ismine
}

var importAddress = async (addr) => {var ok = await client.importAddress( addr, "",  false)
return(ok)};

// db rw
var dbExists = id => fs.existsSync("public/campaigns/"+id+".json")
var dbRead = id => JSON.parse(fs.readFileSync("public/campaigns/"+id+".json"))
var dbWrite = campaign  => fs.writeFileSync("public/campaigns/"+campaign.id+".json",JSON.stringify(campaign, null, 2))

// if (fs.existsSync("public/campaigns/"+id+".json")){
var dbExists = id => fs.existsSync("public/campaigns/"+id+".json")

class Campaign{
  constructor(id) {
    this.id = id 
    this.cause = null
    this.who = null
    this.goal = null
    this.raised= getAddressBalance(id)
    this.created = null
    this.status = "NEW"
    this.ismine =  dbExists(id) ? getIsMine(this.id): null
    this.iswatchonly=  dbExists(id) ? getIsWatchOnly(this.id): null
  }
  // db
  write(){
    dbWrite(this)
    return this
  }

  read() {
    var campaign = dbRead(this.id)
    this.who = campaign.who
    this.goal = campaign.goal
    this.cause = campaign.cause 
    //this.id = campaign.id
    this.status = campaign.status
    this.created = campaign.created
    this.ismine = getIsMine(this.id)
    this.iswatchonly= getIsWatchOnly(this.id)
  }

  setDetails({who, goal, cause}){
    this.who = who
    this.goal = goal
    this.cause = cause
  }

  setStatus(status){
    this.status = status
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
    c.created = Date.now()
    c.write()
    return c
  },
  detailsCampaign: ({id, input}) => {
    var c = new Campaign(id)
    c.read()
    if(c.status==="NEW"){
      c.setDetails(input)
      importAddress(id)
      c.setStatus("IMPORTED")
      c.write()
      return}else{
	console.log("need signature to update entry.")
	return
      }
  },
  updateCampaign: async ({id, input}) => {
    try {var verified = await client.verifyMessage(id, input.signature, "challenge")
      if(verified){
	var c = new Campaign(id)
	c.read()
	c.setDetails(input)
	c.write()
	return c}else{
	  throw new Error("Bad signature")
	}
    }
    catch(error){
      throw new Error(error.message)
    }
  }
}

app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('/home/davidweisss/iHodLWeb/public/'))
app.use(express.static('/home/davidweisss/iHodLWeb/public/campaigns/'))

app.get('/', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/index.html')
})

app.get('/Campaign', async function (req, res) {
  var {address, signature, cause, goal, who} = req.query
  var {isvalid} = await client.validateAddress(address)
  if(!isvalid){
    res.send("<h1>Not a valid bitcoin address</h1>")
    return
  }
  
  var exists = dbExists(address)
  if(!exists) {
    var query = `mutation {
	createCampaign(id: "${address}"){id}}`
    var {data} = await graphql(schema, query, root)
    console.log("new campaign created.")
    res.redirect(`DetailsCampaign?address=${req.query.address}`)
    return
  }

  var has = x => typeof x !== "undefined" && x !== ""
  var hasInput = has(cause)||has(goal)||has(who)
  var hasSignature = has(signature)

  var query = `query {
      getCampaign(id: "${req.query.address}"){status}}`
  var {data} = await graphql(schema, query, root)
  var {status} = data.getCampaign
  
  if(status==="NEW" & hasInput){
    var query = `mutation {
      detailsCampaign(id: "${address}", input: {goal: ${goal}, who: "${who}", cause: "${cause}"}){
	 id}}`
    var {data} = await graphql(schema, query, root)
    res.sendFile('/home/davidweisss/iHodLWeb/public/Campaign.html')
    return
  }

  if(status==="NEW" & !hasInput){
    res.redirect(`DetailsCampaign?address=${address}`)
    return
  }

  if(status==="IMPORTED" & hasSignature & hasInput){
    console.log("updating...")
    var query = `mutation {
      updateCampaign(id: "${address}", input: {goal: ${goal}, who: "${who}", cause: "${cause}", signature: "${signature}"}){
	 id}}`
    var {data, errors} = await graphql(schema, query, root)

    if(typeof errors !== "undefined" & errors!== null & errors !==""){
      res.redirect(`DetailsCampaign?${querystring.stringify({address: address, message: errors[0].message})}`)
      return
    }else{
      res.redirect(`Campaign?address=${address}`)
      return}

  }

  if(status==="IMPORTED"){
    res.sendFile('/home/davidweisss/iHodLWeb/public/Campaign.html')
    return
  }

})

app.get('/DetailsCampaign', function (req, res) {
  let address = req.query.address

  // add test for existing data file
  if(typeof address==="undefined"){res.redirect("NewCampaign")}else{

    res.sendFile('/home/davidweisss/iHodLWeb/public/DetailsCampaign.html')
  }
})

app.get('/NewCampaign', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/NewCampaign.html')
})

// ihodl
app.post('/requestReceipt.html', (req, res) => {
  const bitcoinPublicKey= req.body.bitcoinPublicKey
  const shippingAddress= req.body.shippingAddress
  fs.appendFileSync('/home/davidweisss/reservations', Date.now() + "\n" + bitcoinPublicKey + "\n" + shippingAddress + "\n"  );

  console.log(bitcoinPublicKey, shippingAddress)
  res.sendFile('/home/davidweisss/iHodLWeb/public/requestReceipt.html')
})

// http/https server
var https_options = {
  key: key,
  cert: cert
};
var PORT = 443;
var HOST = '0.0.0.0';
server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);

