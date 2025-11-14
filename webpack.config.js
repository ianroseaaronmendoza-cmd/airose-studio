const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: path.resolve(__dirname, "src", "main.tsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true,
    publicPath: "/",
  },

  // ✅ Updated alias section
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"), // <-- 💡 add this for "@/..." imports
      components: path.resolve(__dirname, "src/components"),
      context: path.resolve(__dirname, "src/context"),
      hooks: path.resolve(__dirname, "src/hooks"),
      lib: path.resolve(__dirname, "src/lib"),
      pages: path.resolve(__dirname, "src/pages"),
      assets: path.resolve(__dirname, "src/assets"),
    },
  },

  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
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
  ],

  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: false,
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
