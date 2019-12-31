const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    Campaign: "./public/Campaign.jsx",
    NewCampaign: "./public/NewCampaign.jsx",
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
