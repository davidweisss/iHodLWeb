const bitcoinRPCConf = require('./bitcoinRPCConf')
const Client = require('bitcoin-core')
const {getFeeRate, redeemTx} = require('./redeem.js')

//args
const client = new Client(bitcoinRPCConf)
var addr = ["bc1q3qskx3ukwfxsh39cphf0eggvdlf6gppzmv42gu"]
//var addr = ["1Archive1n2C579dMsAu3iC6tWzuQJz8dN"]
var destAddr= "14RLePN1TwWKWAg8Atsn22HiF1Lp7BnmM9"
var tipAddr= "bc1q3qskx3ukwfxsh39cphf0eggvdlf6gppzmv42gu"
var tipPercent= 0.05
var confirmedInNBlocks=36 
//var txMessage= "hey Jude"
var txMessage= "hhello dudehello dudehello dudehello dudeello dudeihello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudhello dudhello dudeehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dudehello dude"
getFeeRate(confirmedInNBlocks, client).then(feeRate =>
redeemTx(client, addr, destAddr, tipAddr, tipPercent, feeRate, txMessage)
  .then(x=> console.log(x[0])))

//  .then(x => console.log(x.psbt, x.rawtx))
