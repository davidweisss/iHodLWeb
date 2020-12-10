fs = require('fs')
var campaignsPath = "public/campaigns/"
var picturesPath = "public/pictures/"
var rootPath = "/home/davidweisss/iHodLWeb/"
var dbExists = id => fs.existsSync(campaignsPath+id+".json")

var dbRead = id => JSON.parse(fs.readFileSync(campaignsPath+id+".json"))

var dbWrite = (campaign)  => {
  fs.writeFileSync(campaignsPath+campaign.id+".json",JSON.stringify(campaign, null, 2))
}

var dbRemove = (id, picture) => {
  if(dbExists(id)){
  fs.unlinkSync(campaignsPath+id+".json")}
  if(picture!=="undefined"){
  fs.unlinkSync(picturesPath+picture)}
}

var dbIDs = ids => {
 var ids = fs.readdirSync(rootPath+campaignsPath)
  console.log(ids)
  ids=  ids.map(x => x.split(".")).map(x=>x[0])
  return(ids)
}

var dbExists = id => fs.existsSync(campaignsPath+id+".json")
module.exports= { 
dbExists:dbExists, 
dbRead:dbRead, 
dbWrite:dbWrite, 
dbRemove:dbRemove, 
dbIDs:dbIDs, 
} 
