const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDev ? "development" : "production",

  entry: path.resolve(__dirname, "src", "main.tsx"),

  output: {
    path: path.resolve(__dirname, "dist"),

    // ✔ dev uses main.js (easy debugging)
    // ✔ production uses hashed filenames for cache-busting
    filename: isDev ? "main.js" : "main.[contenthash].js",

    publicPath: "/",
    clean: true,
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

      // ✔ inject hashed JS automatically in production
      scriptLoading: "defer",
    }),

    new CopyWebpackPlugin({
      patterns: [{ from: "public/data", to: "data" }],
    }),
  ],

  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,

    static: {
      directory: path.resolve(__dirname, "public"),
    },

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) throw new Error("webpack-dev-server is missing");

      const bodyParser = require("body-parser");
      const app = devServer.app;
      app.use(bodyParser.json());

      //
      // UPLOAD HANDLER
      //
      const { handleUpload } = require("./dev-tools/upload.js");
      app.post("/dev/upload", (req, res) => {
        try {
          handleUpload(req, res);
        } catch (err) {
          console.error("Upload error:", err);
          res.status(500).json({ error: err.message });
        }
      });

      //
      // BLOG FS
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
      // PROJECT FS
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
};
