const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    Campaign: "./public/Campaign.jsx",
    Campaign2: "./public/Campaign2.jsx",
    Search: "./public/Search.jsx",
    NewAddress: "./public/NewAddress.jsx",
    Donate: "./public/Donate.jsx",
    Share: "./public/Share.jsx",
    RedeemCampaign: "./public/RedeemCampaign.jsx",
    SignRedeemCampaign: "./public/SignRedeemCampaign.jsx",
    NewsItem: "./public/NewsItem.jsx",
    MediaCampaign: "./public/MediaCampaign.jsx",
    SignRemoveCampaign: "./public/SignRemoveCampaign.jsx",
    DetailsCampaign: "./public/DetailsCampaign.jsx"},
  mode: "production",
  module: {
    rules: [
      {
	test: /\.jsx$/,
	exclude: /(node_modules|bower_components)/,
	loader: "babel-loader",
	options: { presets: ["@babel/env"] }
      },
      {
	test: /\.css$/,
	use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "public/"),
    publicPath: "/public/",
	  filename: "[name].js"
  }
}
