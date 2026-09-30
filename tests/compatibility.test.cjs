const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("every published story chapter resolves to readable content", () => {
  for (const slug of ["fdgsdfg", "in-the-mind-of-the-genius"]) {
    const directory = `public/data/novels/${slug}/chapters`;
    const chapters = JSON.parse(read(`${directory}/index.json`));
    assert.ok(chapters.length > 0);
    assert.equal(new Set(chapters.map((c) => c.slug)).size, chapters.length);
    for (const entry of chapters) {
      const chapter = JSON.parse(read(`${directory}/${entry.slug}.json`));
      assert.equal(chapter.slug, entry.slug);
      assert.ok((chapter.body || chapter.content || "").trim().length > 0);
    }
  }
});

test("Devotion source, frozen shell, and global styling remain at their approved baseline", () => {
  const baseline = require("./devotion-baseline.json");
  for (const [file, hash] of Object.entries(baseline))
    assert.equal(
      crypto
        .createHash("sha256")
        .update(read(file).replace(/\r\n/g, "\n"))
        .digest("hex"),
      hash,
      file + " changed: review Devotion compatibility explicitly",
    );
});
test("portfolio CSS is scoped and cannot restyle Devotion", () => {
  require("postcss")
    .parse(read("src/styles/portfolio.css"))
    .walkRules((rule) => {
      for (const selector of rule.selectors)
        assert.ok(selector.trim().startsWith(".portfolio"), selector);
    });
});
test("books preserve paid paperback versus free stories and existing chapter links", () => {
  const books = JSON.parse(read("public/data/books.json"));
  assert.equal(books.length, 3);
  const paperback = books.find((b) => b.slug === "capacity-to-give");
  assert.equal(paperback.availability, "purchase");
  assert.equal(paperback.type, "Paperback");
  assert.equal(paperback.externalUrl, "https://www.amazon.com/dp/B0HL4QM8BH");
  for (const book of books.filter((b) => b !== paperback)) {
    assert.equal(book.availability, "free");
    assert.equal(new URL(book.externalUrl).hostname, "www.wattpad.com");
    assert.ok(fs.existsSync(path.join(root, "public", book.cover)));
    assert.ok(
      fs.existsSync(
        path.join(
          root,
          "public/data/novels",
          book.readerUrl.split("/").pop(),
          "meta.json",
        ),
      ),
    );
  }
});
