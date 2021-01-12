const getFeeRate = (confirmedInNBlocks, client)=>client.estimateSmartFee(confirmedInNBlocks)
  .then(f =>{
    let feeRate= f.feerate
    return feeRate})

const pay2AuthTx= (client, addr,  pay2AuthAddr,  feeRate, tip=0.00000001, txMessage='https://BitFundMe.rocks', changeAddr=addr)=>{
  return(
      client.listUnspent(0, 9999999, addr)
	.then(x => {
	  console.log(x)
	  let input = x.map(y => {return {txid: y.txid, vout: y.vout}})
	  let amountTotal = x.map(y=> y.amount).reduce((v,w)=>v+w)

	  // https://bitcoin.stackexchange.com/questions/1195/how-to-calculate-transaction-size-before-sending-legacy-non-segwit-p2pkh-p2sh
	  // in*180 + out*34 + 10 plus or minus 'in'

	  // truncate on max 77 bytes
	  let data= Buffer.from(txMessage.substring(0,76)).toString('hex')
	  let txSizeInBytes= Math.round((input.length*181+2*34+10+data.length)/2) 
	  console.log('txSizeInBytes', txSizeInBytes)
	  let fee= feeRate*txSizeInBytes/1000
	  let amountTotalAfterFee=amountTotal-fee
	  let amountTotalAfterTip = amountTotalAfterFee-tip
	  console.log(
	    'amountTotal:', amountTotal,
	    'amountTotalAfterFee:', amountTotalAfterFee,
	    'fee', fee, 
	    'data.length', data.length,
	    'tip', tip,
	    'amountTotalAfterTip:', amountTotalAfterTip
	  )
	  let output = [
	    {[changeAddr]: amountTotalAfterTip},
	    {[pay2AuthAddr]: tip},
	    {data: data}
	  ]

	  let rawtx = client.createRawTransaction(input, output, 0, true)
	  let psbt = client.createPsbt(input, output, 0, true)
	  console.log('psbt', psbt, 'rawtx', rawtx)
	  return Promise.all([rawtx, psbt])
	})
  )
}

module.exports = {pay2AuthTx: pay2AuthTx, getFeeRate: getFeeRate}

