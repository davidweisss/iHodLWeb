console.log("Importing bitcoin addresses")
const bitcoinRPCConf = require('./bitcoinRPCConf')
const Client = require('bitcoin-core')
const client = new Client(bitcoinRPCConf)

var fs = require("fs")
var addresses = fs.readdirSync("/home/davidweisss/iHodLWeb/public/campaigns")
addresses = addresses.map(addr => addr.split(".")[0])

async function getAddressesInfo (addresses){
  const promises = addresses.map(async (addr) => {var info  = await client.getAddressInfo(addr)
    return(info)
  })
  const results = await Promise.all(promises)

  console.log("addresses", addresses)
  var mine = results.map(x=>x.ismine)
  console.log("ismine",mine) 
  var watchonly =  results.map(x=>x.iswatchonly)
  console.log("iswatchonly", watchonly)
  
  var toimport = new Array(mine.length)
  for (x=0; x< toimport.length; x++){toimport[x]=!mine[x]&!watchonly[x]}
  console.log("toimport", toimport)

  addressesToImport = new Array(0)

  for (x=0; x< toimport.length; x++){
    if(toimport[x]){
      addressesToImport.push(addresses[x])
    }
  }
  console.log("addresses to import", addressesToImport)

  commandArg = JSON.parse("["+ addressesToImport.map(x => `{ "scriptPubKey": { "address": "${x}" }, "timestamp":0 }`).reduce((r,x)=> r+", "+x)+"]")
  console.log(commandArg)
  client.importMulti(commandArg, {rescan:true})
}
var addressesInfo  = getAddressesInfo(addresses)
