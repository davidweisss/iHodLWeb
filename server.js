var tipAddr= "1Q4PrJKGC9tYPgrtf3tjqELu8UmTHJJCMQ"
const { dbExists, dbRead, dbWrite, dbRemove, dbIDs } = require('./db.js')
const {getFeeRate, redeemTx} = require('./redeem.js')
const {pay2AuthTx} = require('./pay2AuthTx.js')
const fileUpload = require('express-fileupload');
var querystring = require('querystring');
var fs = require('fs')
var https = require('https')
var http = require('http');
var bodyParser = require("body-parser")
var express = require('express')
setInterval(() => { console.log("rescanning");client.rescanBlockchain(); return}, 28800000)


// ssl
var key = fs.readFileSync('/etc/letsencrypt/live/bitfundme.rocks/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/bitfundme.rocks/fullchain.pem')

// graphql
const { root, client } = require('./resolvers.js')
var graphqlHTTP = require('express-graphql');
var { buildSchema, graphql } = require('graphql');

var schemaString = fs.readFileSync('./bitfundme.graphql').toString()
var schema = buildSchema(schemaString);

// app and middlewares
app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.use(fileUpload())
app.use(bodyParser.urlencoded({extended: true}));

// serve static files 
app.use(express.static('/home/davidweisss/iHodLWeb/public/'))
app.use(express.static('/home/davidweisss/iHodLWeb/public/campaigns/'))
app.use(express.static('/home/davidweisss/iHodLWeb/public/pendingEdits/'))
app.use(express.static('/home/davidweisss/iHodLWeb/public/pictures/'))


//////////////////////////////////////////////
// Routes
//////////////////////////////////////////////
app.get('/', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/home.html')
})

app.get('/NewAddress', function(req, res){
  res.sendFile('/home/davidweisss/iHodLWeb/public/NewAddress.html')
})

  
app.get('/MediaDetailsCampaign', function (req, res) {
    res.sendFile('/home/davidweisss/iHodLWeb/public/MediaDetailsCampaign.html')
})

  
  
app.get('/MediaCampaign', function (req, res) {
    res.sendFile('/home/davidweisss/iHodLWeb/public/MediaCampaign.html')
})


app.get('/Campaign', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/Campaign.html')
})

app.get('/NewsItem', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/NewsItem.html')
})

app.get('/SignClaimCampaign', (req, res) => {
  res.sendFile('/home/davidweisss/iHodLWeb/public/SignClaimCampaign.html')
})

app.get('/SignRemoveCampaign', (req, res) => {
  res.sendFile('/home/davidweisss/iHodLWeb/public/SignRemoveCampaign.html')
})

app.get('/Search', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/Search.html')
})

app.get('/Donate', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/Donate.html')
})

app.get('/Share', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/Share.html')
})


//////////////////////////////////////////////
// Post
//////////////////////////////////////////////
app.post('/Campaign', (req, res) => {
  var address = req.body.address
  if (req.files === null){
    res.redirect(`MediaDetailsCampaign?${querystring.stringify({address: address, message: "No file chosen"})}`)
    return
  }
  var pictureFileExtension = req.files.picture.mimetype.split("/")[1]
  req.files.picture.mv("public/pictures/tmp-"+address+"."+pictureFileExtension
  )
  res.redirect(`DetailsCampaign?${querystring.stringify({address: address, picture: "tmp-"+address+"."+pictureFileExtension})}`)
})

app.post('/MediaCampaign', (req, res) => {
  var address = req.body.address
  if (req.files === null){
    res.redirect(`MediaDetailsCampaign?${querystring.stringify({address: address, message: "No file chosen", active: "picture"})}`)
    return
  }
  var pictureFileExtension = req.files.picture.mimetype.split("/")[1]
  req.files.picture.mv("public/pictures/tmp-"+address+"."+pictureFileExtension
  )
  res.redirect(`MediaDetailsCampaign?${querystring.stringify({address: address, picture: "tmp-"+address+"."+pictureFileExtension, active:'picture'})}`)
})


//////////////////////////////////////////////
// Endpoints
//////////////////////////////////////////////

app.get('/ValidateAddress', async function(req, res){
  // 
  const { address } = req.query
  let exists = dbExists(address)
  if(exists){
    res.redirect(`NewAddress?message=Address previously added&address=${address}`)
    return
  }
  let {isvalid} = await client.validateAddress(address)
  if(!isvalid){
    res.redirect('NewAddress?message=Invalid Address')
    return
  }else{
    res.redirect(`ImportAddress?address=${address}`)
    return
  }
})

app.get('/ImportAddress', async function(req, res){
  let address = req.query.address
  let query = `mutation {
	createCampaign(id: "${address}"){id}}`
  let {data} = await graphql(schema, query, root)
  console.log("new campaign created.")
  res.redirect(`MediaDetailsCampaign?address=${address}`)
  return
})

// Server-side auth

app.get('/UpdateMediaDetails', async function(req, res){
  let {
    address,
    cause,
    goal,
    who,
    url,
    startDate,
    endDate,
    description,
    picture
  } = req.query
  description && description.replace(/(?:\r\n|\r|\n)/g, '\\n\\n ')

    var query = `mutation {
    updateMediaDetails(`
      +
      `id: "${address}",` 
      +
      'input: {'
      +
      (goal ? `goal: ${goal},`: `goal: 0,`)
      +
      (startDate? `startDate: "${startDate}",`: '')
      +
      (endDate? `endDate: "${endDate}",`: `endDate: "",`)
      +
      (who ? `who: "${who}",`: '')
      +
      (url ? `who: "${url}",`: '')
      +
      (cause ? `cause: "${cause}",`: '')
      +
      (description ? `description: """${description}""",`: '')
      +
      (picture ? `picture: "${picture}"` : '')
      + 
      `}){
      id}
  }`
  var {data, errors} = await graphql(schema, query, root, context=req)
  if(typeof errors !== "undefined" & errors!== null & errors !==""){
    res.redirect(`MediaDetailsCampaign?${querystring.stringify({address: address, message: errors[0].message, picture: picture})}`)
    return
  }else{
      res.redirect(`Campaign?address=${address}`)
    return}
})

app.get('/UpdateMedia', async function(req, res){
  let {
    address,
    picture
  } = req.query
  var query = `mutation {
      updateMedia(id: "${address}", 
      input: {
      picture: "${picture}",
      auth: ${auth}}){
	 id}}`
  var {data, errors} = await graphql(schema, query, root, context=req)
  if(typeof errors !== "undefined" & errors!== null & errors !==""){
    res.redirect(`MediaCampaign?${querystring.stringify({address: address, message: errors[0].message})}`)
    return
  }else{
    res.redirect(`DetailsCampaign?address=${address}`)
    return}
})

app.get('/PopNewsItem', async function(req, res){
  var {
    address,
    newsItem,
    auth
  } = req.query
  // newlines -> \n\n
  newsItem && newsItem.replace(/(?:\r\n|\r|\n)/g, '\\n\\n ')
  var query = `mutation {
      popNewsItem(id: "${address}", 
      input: {     
       newsItem: "${newsItem}" 
       }){
	 id}}`
  var {data, errors} = await graphql(schema, query, root, context=req)
  if(typeof errors !== "undefined" & errors!== null & errors !==""){
    res.redirect(`NewsItem?${querystring.stringify({address: address, message: errors[0].message, newsItem:newsItem})}`)
    return
  }else{
    res.redirect(`Campaign?address=${address}`)
    return}
})

app.get('/ClaimCampaign', async (req, res)=>{
  let {
    address
  } = req.query
  let query = `mutation {
      claimCampaign(
      id: "${address}"){
	 id}
       }`
  let {data, errors} = await graphql(schema, query, root, context=req)

  if(typeof errors !== "undefined" & errors!== null & errors !==""){
    res.redirect(`SignClaimCampaign?${querystring.stringify({address: address, message: errors[0].message})}`)
    return
  }else{
    res.redirect(`Campaign?address=${address}`)
    return
  }
})

app.get('/RemoveCampaign', async function (req, res)  {
  var {address} = req.query
  var query = `mutation {
      removeCampaign(id: "${address}"){
	 id}}`
  var {data, errors} = await graphql(schema, query, root, context=req)
    
  if(typeof errors !== "undefined" & errors!== null & errors !==""){
    res.redirect(`SignRemoveCampaign?${querystring.stringify({address: address, message: errors[0].message})}`)
    return
  }else{
    res.redirect(`Search`)
    return}

})

//////////////////////////////////////////////
// Redeem
// Experimental
//////////////////////////////////////////////
app.get('/RedeemCampaign', function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/RedeemCampaign.html')
})

app.get('/ComputeRedeemCampaign', function (req, res) {
  let {address, tipPercent, confirmedInNBlocks, destAddr, txMessage} = req.query
  var tipAddr= "bc1q3qskx3ukwfxsh39cphf0eggvdlf6gppzmv42gu"
  getFeeRate(parseInt(confirmedInNBlocks), client).then(feeRate =>{
    console.log(feeRate, typeof feeRate)
    redeemTx(client, [address], destAddr, tipAddr, tipPercent, feeRate, txMessage)
      .then(x=> {console.log(x[0].length)
	res.redirect(`SignRedeemCampaign?${querystring.stringify({address: address, rawtx: x[0], psbt: x[1]})}`)
      }
      )
  })
})

app.get('/SignRedeemCampaign', async function (req, res) {
  res.sendFile('/home/davidweisss/iHodLWeb/public/SignRedeemCampaign.html')
})

app.get('/ComputePay2AuthTx', function (req, res) {
  let {address, tip, confirmedInNBlocks, changeAddress, pay2AuthAddress, txMessage} = req.query
  getFeeRate(parseInt(confirmedInNBlocks), client).then(feeRate =>{
    console.log(feeRate, typeof feeRate)
    pay2AuthTx(client, [address], changeAddress, pay2AuthAddress, tip, feeRate, txMessage)
      .then(x=> {
	      console.log(x[0].length)
	      res.send(x[1])
      }
      )
  })
})


//////////////////////////////////////////////
// http/https server
//////////////////////////////////////////////
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

