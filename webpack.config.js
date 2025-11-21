const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDev ? "development" : "production",

  entry: path.resolve(__dirname, "src", "main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",         // ✅ FIXED: no contenthash (Vercel cannot auto-inject)
    publicPath: "/",             // ✅ Required for React Router
    clean: true
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },

  devtool: isDev ? "source-map" : false,

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      filename: "index.html"
    }),

    // ✅ Always copy data folder to dist/
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "data",
          to: "data"
        }
      ]
    })
  ],

  devServer: {
    port: 3000,
    historyApiFallback: true, // ✅ Required for SPA routing
    hot: true,

    static: {
      directory: path.resolve(__dirname, "public")
    },

    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
};
