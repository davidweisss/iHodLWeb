let receivedFrom = async (client, to, from) => {
  console.log('checking for payment to:', to, '/n from:', from)
  let txs	= await client.listTransactions()

  let addresses = txs.map(x => x.address)
  let idx = addresses.indexOf(to)
  if(idx<0){
    return(0) 
  }else{
    let tx = txs[idx]
    console.log('tx',tx)
    let txid = tx.txid
    let rawtx = await client.getTransaction(tx.txid)
    let decodedtx = await client.decodeRawTransaction(rawtx.hex)
    // assume only one input [0]
    upstreamtxid = decodedtx.vin[0].txid
    rawupstreamtx = await client.getTransaction(upstreamtxid)
    upstreamtx = await client.decodeRawTransaction(rawupstreamtx.hex)
    let hit = upstreamtx.vout.map(x=>x.scriptPubKey.addresses[0] === from).reduce((v,w)=>v+w)
    console.log('hit', hit)
    return(hit)
  }
}

module.exports = { receivedFrom: receivedFrom }
