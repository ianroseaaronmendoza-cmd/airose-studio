const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

test("project saves migrate legacy descriptions and preserve metadata across updates", () => {
  const original = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "airose-project-test-"));
  const modulePath = path.resolve(__dirname, "../dev-tools/projects-fs.js");
  try {
    process.chdir(dir);
    delete require.cache[modulePath];
    const { saveProject, getProject, loadIndex } = require(modulePath);
    const first = saveProject({
      slug: "test-project",
      title: "Test",
      summary: "Legacy description",
      content: "<p>Existing story</p>",
      createdAt: 1234,
      status: "Prototype",
      category: "Game",
      featured: true,
      cover: "/uploads/example.webp",
      screenshots: [{ url: "/uploads/example.webp", alt: "Gameplay" }],
      links: [{ label: "Website", url: "https://example.com" }],
      updates: [
        { date: "2026-09-29", title: "First update", body: "A prototype." },
      ],
    });
    assert.equal(first.description, "Legacy description");
    assert.equal(first.summary, undefined);
    const second = saveProject({
      slug: "test-project",
      title: "Updated",
      description: "New description",
      createdAt: 9999,
      status: "In Development",
    });
    assert.equal(second.createdAt, 1234);
    assert.ok(second.updatedAt >= first.updatedAt);
    assert.deepEqual(getProject("test-project"), second);
    assert.equal(second.content, first.content);
    assert.deepEqual(second.screenshots, first.screenshots);
    assert.deepEqual(second.links, first.links);
    assert.deepEqual(second.updates, first.updates);
    const [card] = loadIndex();
    assert.equal(card.description, second.description);
    assert.equal(card.updatedAt, second.updatedAt);
    assert.equal(card.status, "In Development");
    assert.equal(card.category, "Game");
    assert.equal(card.featured, true);
    assert.equal(card.content, undefined);
    assert.equal(card.summary, undefined);
    for (const status of [
      "Released",
      "In Development",
      "Prototype",
      "Experiment",
      "Archived",
    ])
      assert.equal(saveProject({ ...second, status }).status, status);
    assert.throws(
      () => saveProject({ ...second, status: "Made up" }),
      /status/,
    );
    assert.throws(
      () =>
        saveProject({
          ...second,
          links: [{ label: "Unsafe", url: "javascript:alert(1)" }],
        }),
      /URL/,
    );
    assert.throws(() => saveProject({ ...second, slug: "../outside" }), /slug/);
  } finally {
    process.chdir(original);
    delete require.cache[modulePath];
    const target = path.resolve(dir);
    if (
      path.dirname(target) === path.resolve(os.tmpdir()) &&
      path.basename(target).startsWith("airose-project-test-")
    )
      fs.rmSync(target, { recursive: true, force: true });
  }
});

test("client normalizes legacy data without discarding project details", () => {
  const ts = require("typescript");
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/lib/projectModel.ts"),
    "utf8",
  );
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "module", code)(module.exports, module);
  const { normalizeProject } = module.exports;
  assert.equal(
    normalizeProject({ summary: "Old record" }).description,
    "Old record",
  );
  assert.equal(
    normalizeProject({ description: "New", summary: "Old" }).description,
    "New",
  );
  assert.equal(
    normalizeProject({ description: "", summary: "Old" }).description,
    "",
  );
  assert.equal(normalizeProject({ createdAt: 123 }).updatedAt, 123);
  assert.equal(
    normalizeProject({ status: "Archived", category: "Tool", featured: true })
      .status,
    "Archived",
  );
});
