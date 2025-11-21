const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  mode: process.env.NODE_ENV || "development",

  entry: path.resolve(__dirname, "src", "main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true,
    publicPath: "/", // required for React Router
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      filename: "index.html",
    }),

    // ⭐ ALWAYS copy the JSON folder, even in production
    // This is REQUIRED for Vercel static deployment
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "data",
          to: "data",
        },
      ],
    }),
  ],

  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    static: {
      directory: path.resolve(__dirname, "public"),
    },

    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
      },
    ],
  },
};
