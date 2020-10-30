// Search
var fuseJs = require("fuse.js")
// db rw
const { dbExists, dbRead, dbWrite, dbRemove, dbIDs } = require('./db.js')

// bitcoin utils
// Electrum
const {electrumxBalance} = require('../electrumxBalance')
// Core
const bitcoinRPCConf = require('../bitcoinRPCConf')
const Client = require('bitcoin-core')
const client = new Client(bitcoinRPCConf)
var getIsWatchOnly = async (addr) => { const {iswatchonly} = await client.getAddressInfo(addr)
  return iswatchonly
}
var getIsMine= async (addr) => { const {ismine} = await client.getAddressInfo(addr)
  return ismine
}

var importAddress = async (addr) => {var ok = await client.importAddress( addr, "",  false)
  return(ok)};

const floatify = (a,b) => {
  return parseFloat((a+b).toFixed(8))
}
var sumListUnspent = arr => arr.length > 0 ? arr.map( x => x.amount).reduce((x, y) => x+y) : 0

var getFundingStatus = async (addr, createdAtBlock, created) => {
  // 1/ use block recorded at creation
  if ( createdAtBlock === undefined){  
    var blocksSinceCreation = Math.round((Date.now()-parseInt(created))/(1000*600))}
  // 2/ or use estimate based on 10' average block spacing
  else{
  var blocksSinceCreation = await client.getBlockCount()
  blocksSinceCreation = blocksSinceCreation - createdAtBlock
  }

  let receivedUpToCreation = await client.getReceivedByAddress(addr, blocksSinceCreation)
  let receivedAllTime = await client.getReceivedByAddress(addr)
  let receivedSinceCreation = floatify(receivedAllTime, -receivedUpToCreation)

  let balanceSinceCreation = await client.listUnspent(0, blocksSinceCreation, [addr])
  balanceSinceCreation = sumListUnspent(balanceSinceCreation)
  // r-w=b
  // -w=b-r
  // w=r-b
  let withdrawnSinceCreation = floatify(receivedSinceCreation,-balanceSinceCreation)
  return(
    {receivedSinceCreation : receivedSinceCreation , 
      withdrawnSinceCreation : withdrawnSinceCreation , 
      balanceSinceCreation : balanceSinceCreation 
    }
  )

}


// class
class Campaign{
  constructor(id) {
    this.id = id 
    this.cause = null
    this.description = null
    this.who = null
    this.goal = null
    this.picture = null
    this.newsItems = null
    this.created = null
    this.createdAtBlock = null
    this.status = "NEW"
    this.raised = null
    this.fundingStatus = null
    this.ismine = dbExists(id) ? getIsMine(this.id): null
    this.iswatchonly=  dbExists(id) ? getIsWatchOnly(this.id): null
  }
  write(){
    dbWrite(this)
    return this
  }

  read() {
    var campaign = dbRead(this.id)
    this.who = campaign.who
    this.goal = campaign.goal
    this.cause = campaign.cause 
    this.description = campaign.description 
    this.picture = campaign.picture
    this.newsItems = campaign.newsItems
    this.status = campaign.status
    this.created = campaign.created
    this.createdAtBlock = campaign.createdAtBlock
  }

  readAsync() {
    this.ismine = getIsMine(this.id)
    this.iswatchonly= getIsWatchOnly(this.id)
    this.fundingStatus = getFundingStatus(this.id, this.createdAtBlock, this.created)
  }

  setDetails(details){
    Object.keys(details).map(x=>{
      if(details[x] !== "undefined" ){ this[x]= details[x]}
    }
    )
  }

  setMedia({picture}){
    var tmpPicture= picture
    picture = picture.split("tmp-")[1]
    var picturePath = "/home/davidweisss/iHodLWeb/public/pictures/"
    fs.renameSync(picturePath+tmpPicture, picturePath+picture)
    this.picture = picture
  }

  popNewsItem(newsItem){
    if (this.newsItems === null){
      this.newsItems = [{created: `${Date.now()}`, message: newsItem}]
    }else{
      this.newsItems.push({created: `${Date.now()}`, message: newsItem})
    }
  }

  setStatus(status){
    this.status = status
  }
}

var root = {
  createCampaign: async ({id}) => {
    var c = new Campaign(id)
    c.created = Date.now()
    c.createdAtBlock = await client.getBlockCount()
    c.write()
    return c
  },
  claimCampaign: ({id}) => {
    var c = new Campaign(id)
    c.read()
    c.setStatus("CLAIMED")
    c.write()
    return
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
	return c
      }else{
	  throw new Error("Bad signature")
	}
    }
    catch(error){
      throw new Error(error.message)
    }
  },
  setMedia: ({id, input}) => {
    var c = new Campaign(id)
    c.read()
    if(c.status==="NEW"){
      c.setMedia(input)
      c.write()
      return}else{
	console.log("need signature to update entry.")
	return
      }
  },
  updateMedia: async ({id, input}) => {
    try {var verified = await client.verifyMessage(id, input.signature, "challenge")
      if(verified){
	var c = new Campaign(id)
	c.read()
	c.setMedia(input)
	c.write()
	return c
      }else{
	  throw new Error("Bad signature")
	}
    }
    catch(error){
      throw new Error(error.message)
    }
  },
  popNewsItem: async ({id, input}) => {
    try {var verified = await client.verifyMessage(id, input.signature, "challenge")
      if(verified){
	var c = new Campaign(id)
	c.read()
	c.popNewsItem(input.newsItem)
	c.write()
	return c
      }else{
	  throw new Error("Bad signature")
	}
    }
    catch(error){
      throw new Error(error.message)
    }
  },
  removeCampaign: async ({id, input}) => {
    try {var verified = await client.verifyMessage(id, input.signature, "challenge")
      if(verified){
	var c = new Campaign(id)
	c.read()
	dbRemove(id, c.picture)	
	return id}else{
	  throw new Error("Bad signature")
	}
    }
    catch(error){
      throw new Error(error.message)
    }
  },
  getCampaign: ({id}) => {
    var c = new Campaign(id)
    c.read()
    c.readAsync()
    return c
  },
  getAllCampaigns: () =>  { 
    var ids = dbIDs()
    var campaigns = ids.map(id =>{
      var c = new Campaign(id)
      c.read()
      return c
    })
    return campaigns
  },
  getCampaigns: ({searchTerm}) =>  { 
    var ids = dbIDs()
    var campaigns = ids.map(id =>{
      var c = new Campaign(id)
      c.read()
      return c
    })
    var searchOptions = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
	"who",
	"cause",
	"id"
      ]
    }
    var fuse = new fuseJs(campaigns, searchOptions);
    var searchResults = fuse.search(searchTerm)
    return searchResults
  },
  getRedeemTx: async ({address, tipPercent, confirmedInNBlocks, destAddr, txMessage}) => {
    return( await getFeeRate(confirmedInNBlocks, client)
      .then(feeRate =>{
      redeemTx(client, address, destAddr, tipAddr, tipPercent, feeRate, txMessage)
    }
    )
    )
  }
}

module.exports = {
  client: client,
  root:root
 }
