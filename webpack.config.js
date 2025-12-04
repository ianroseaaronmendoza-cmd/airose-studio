const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDev ? "development" : "production",

  entry: {
    app: path.resolve(__dirname, "src", "main.tsx"),
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isDev ? "[name].js" : "[name].[contenthash].js",
    chunkFilename: isDev ? "[name].chunk.js" : "[name].[contenthash].chunk.js",
    publicPath: "/",
    clean: true,
  },

  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // Split React/ReactDOM into separate chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          priority: 20,
        },
        // Split large libraries
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 10,
          minSize: 30000,
        },
        // Common code used across multiple pages
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          minSize: 10000,
        },
      },
    },
    // Enable runtime chunk for better caching
    runtimeChunk: "single",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  devtool: isDev ? "source-map" : false,

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
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
      inject: "body",
      scriptLoading: "defer",
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: "public/data", to: "data" },
        // ❌ REMOVE THIS LINE - don't copy uploads during build
        // { from: "public/uploads", to: "uploads", noErrorOnMissing: true },
      ],
    }),

    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),

  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,

    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/uploads/**',  // ✅ Don't watch uploads folder
        ],
      },
    },

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) throw new Error("webpack-dev-server is missing");

      const bodyParser = require("body-parser");
      const express = require("express");
      const app = devServer.app;
      
      app.use(bodyParser.json());

      // ✅ Add explicit static file serving for uploads
      app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

      //
      // UPLOAD HANDLER
      //
      const { handleUpload } = require("./dev-tools/upload.js");
      app.post("/dev/upload", handleUpload); // ✅ Pass the function directly

      //
      // BLOGS FS
      //
      const { saveBlog, deleteBlog } = require("./dev-tools/blogs-fs.js");
      app.post("/dev/blog/save", (req, res) => {
        try {
          const saved = saveBlog(req.body);
          res.json({ ok: true, saved });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      app.post("/dev/blog/delete", (req, res) => {
        try {
          deleteBlog(req.body.slug);
          res.json({ ok: true });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      //
      // PROJECTS FS
      //
      const { saveProject, deleteProject } = require("./dev-tools/projects-fs.js");
      app.post("/dev/project/save", (req, res) => {
        try {
          const saved = saveProject(req.body);
          res.json({ ok: true, saved });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      app.post("/dev/project/delete", (req, res) => {
        try {
          deleteProject(req.body.slug);
          res.json({ ok: true });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      //
      // POEMS FS
      //
      const { savePoem, deletePoem } = require("./dev-tools/poems-fs.js");
      app.post("/dev/poem/save", (req, res) => {
        try {
          const saved = savePoem(req.body);
          res.json({ ok: true, saved });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });
      app.post("/dev/poem/delete", (req, res) => {
        try {
          deletePoem(req.body.slug);
          res.json({ ok: true });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      //
      // MUSIC FS
      //
      const { saveMusic } = require("./dev-tools/music-fs.js");
      app.post("/dev/music/save", (req, res) => {
        try {
          const saved = saveMusic(req.body);
          res.json({ ok: true, saved });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      //
      // NOVELS FS
      //
      const {
        saveNovelMeta,
        deleteNovel,
        saveChapter,
        deleteChapter,
        reorderChapters,
      } = require("./dev-tools/novels-fs.js");

      app.post("/dev/novel/save", (req, res) => {
        try {
          const saved = saveNovelMeta(req.body);
          res.json({ ok: true, saved });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      app.post("/dev/novel/delete", (req, res) => {
        try {
          deleteNovel(req.body.slug);
          res.json({ ok: true });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      app.post("/dev/chapter/save", (req, res) => {
        try {
          const saved = saveChapter(req.body);
          res.json({ ok: true, saved });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      app.post("/dev/chapter/delete", (req, res) => {
        try {
          deleteChapter(req.body.novelSlug, req.body.chapterSlug);
          res.json({ ok: true });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      app.post("/dev/chapter/reorder", (req, res) => {
        try {
          reorderChapters(req.body.novelSlug, req.body.newOrder);
          res.json({ ok: true });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      return middlewares;
    },
  },

  performance: {
    hints: isDev ? false : "warning",
    maxAssetSize: 600000,
    maxEntrypointSize: 800000,
    // ✅ Add this to exclude uploads from bundle size checks
    assetFilter: function (assetFilename) {
      return !assetFilename.startsWith('uploads/');
    },
  },
};
