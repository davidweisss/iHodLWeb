const roundtosatoshi= x=> Math.round(x*100000000)/100000000

const getFeeRate = (confirmedInNBlocks, client)=>client.estimateSmartFee(confirmedInNBlocks)
  .then(f =>{
    let feeRate= f.feerate
    return feeRate})

const redeemTx= (client, addr, destAddr, tipAddr, tipPercent, feeRate, txMessage)=>{
  return(
      client.listUnspent(0, 9999999, addr)
	.then(x => {
	  let input = x.map(y => {return {txid: y.txid, vout: y.vout}})
	  let amountTotal = x.map(y=> y.amount).reduce((v,w)=>v+w)

	  // https://bitcoin.stackexchange.com/questions/1195/how-to-calculate-transaction-size-before-sending-legacy-non-segwit-p2pkh-p2sh
	  // in*180 + out*34 + 10 plus or minus 'in'

	  // truncate on max 77 bytes
	  let data= Buffer.from(txMessage.substring(0,76)).toString('hex')

	  let txSizeInBytes= Math.round((input.length*181+2*34+10+data.length)/2) 
	  console.log(txSizeInBytes)
	  let fee= feeRate*txSizeInBytes
	  amountTotal=amountTotal-fee
	  let tip= roundtosatoshi(amountTotal*tipPercent)
	  let amountTotalAfterTip = roundtosatoshi(amountTotal-tip)

	  let output = [
	    {[destAddr]: amountTotalAfterTip},
	    {[tipAddr]: tip},
	    {data: data}
	  ]

	  let rawtx = client.createRawTransaction(input, output, 0, true)
	  let psbt = client.createPsbt(input, output, 0, true)
	  return Promise.all([rawtx, psbt])
	})
  )
}

module.exports = {redeemTx: redeemTx, getFeeRate: getFeeRate}

