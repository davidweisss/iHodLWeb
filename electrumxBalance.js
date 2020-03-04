const { spawnSync } = require('child_process');
var {check} = require("./bech32/ecc/javascript/segwit_addr_ecc")

var getBech32Prefix = bech32Address => {
	const addrLength = bech32Address.length
	if(addrLength === 62){return "0020"}else if(addrLength===42){return "0014"}
}

var toHexString = byteArray => {
	return byteArray.map(function(byte) {
		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('')
}

var balance = query => {
  const electrumx = spawnSync('electrumx_rpc', ['query', query]);
  const d = `${electrumx.output}`
  const b = d.split("Balance: ")[1].split(" BTC")[0].replace(',','')
  return(b)
}

var electrumxBalance = address => {
  if (address.charAt(0) === "1" ||  address.charAt(0) === "3"){
    return balance(address)
  } 
  else if(address.substring(0,2) === "bc"){
    const res = check(address, ["bc","tc"])
    res.error && console.log(res.error)
    const program = getBech32Prefix(address)+toHexString(res.program)
    return balance(program)
  }
}

module.exports= {electrumxBalance: electrumxBalance}
