var fs = require("fs")
var {birthtimeMs} = fs.statSync("/home/davidweisss/iHodLWeb/public/campaigns/bc1q3qskx3ukwfxsh39cphf0eggvdlf6gppzmv42gu.json")
var existsSince = ((Date.now()-birthtimeMs)/(1000*3600*24))
var olderThan24h= existsSince > 1
console.log("existsSince", existsSince)
