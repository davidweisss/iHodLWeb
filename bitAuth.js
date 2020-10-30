// Core
const bitcoinRPCConf = require('./bitcoinRPCConf')
const Client = require('bitcoin-core')
const client = new Client(bitcoinRPCConf)

//  Auth middleware
let vaPourUneFois = async (req, res, next)=>{
  let  {address} = req.query
  let existsCampaign = true
  if (address !== undefined && !existsCampaign){
    res.send('va Pour une fois')
  }else{
    next() 
  }
}

let signedMessageAuth = async (req, res, next)=>{
  let  {address, signedMessage, message } = req.query

  if (signedMessage  !== undefined){
  console.log('Trying signed message Authentication')
  console.log(address, signedMessage, message)

    try {
      var verified = await client.verifyMessage(address, signedMessage, message)
      if(verified){
	console.log('verified')
	req.auth = true
	next()
      }else{
	req.auth = false
	next()
      }
    }
    catch(error){
      next(error)
    }
  }
  
  else {
    next()
  }
}

let pay2Auth = async (req, res, next)=>{
  let  {pay2AuthAddress} = req.query
  if (pay2AuthAddress  !== undefined){
  console.log('Trying pay to auth Authentication')
  console.log(pay2AuthAddress)
    try {
      var funded = await client.getReceivedByAddress(pay2AuthAddress)
      if(funded){
	console.log('funded')
	console.log(funded)
	req.auth = true
	next()
      }else{
	req.auth = false
	next()
      }
    }
    catch(error){
      next(error)
    }
  }else {
    next()
  }
}


let authError = (err, req, res, next) => {
  console.error(err)
  res.status(500).send([err.name,  err.message].toString())
}

module.exports= {
  bitAuth: [vaPourUneFois, signedMessageAuth, pay2Auth, authError]
}

