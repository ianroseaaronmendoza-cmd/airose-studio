import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditorProvider, useEditor } from "./context/EditorContext";

import Header from "./components/Header";
import Footer from "./components/Footer";

/* ------------------ Static Pages ------------------ */
import Home from "./pages/Home";
import MusicPage from "./pages/MusicPage";
import ProjectsPage from "./pages/ProjectsPage";
import WritingPage from "./pages/writing/page";
import About from "./pages/About";
import Support from "./pages/Support";

/* ------------------ WRITING — POEMS ------------------ */
import PoemsIndexPage from "./pages/writing/poems/index";
import PoemViewPage from "./pages/writing/poems/[slug]";
import NewPoemPage from "./pages/writing/poems/new";
import EditPoemPage from "./pages/writing/poems/edit/[slug]";

/* ------------------ WRITING — BLOGS ------------------ */
import BlogListPage from "./pages/writing/blogs/index";
import BlogViewPage from "./pages/writing/blogs/[slug]";
import NewBlogPage from "./pages/writing/blogs/new";

/* ------------------ WRITING — NOVELS ------------------ */
import NovelListPage from "./pages/writing/novels/index";
import NewNovelPage from "./pages/writing/novels/new";

import EditNovelMetaPage from "./pages/writing/novels/edit/[novelSlug]";
import ChapterListPage from "./pages/writing/novels/edit/[novelSlug]/chapters/index";
import NewChapterPage from "./pages/writing/novels/edit/[novelSlug]/chapters/new";
import ChapterEditorPage from "./pages/writing/novels/edit/[novelSlug]/chapters/[chapterSlug]/index";

import ReadChapterPage from "./pages/writing/novels/[novelSlug]/chapters/[chapterSlug]/read";

/* ------------------ Editor / Auth ------------------ */
import EditorLoginPage from "./pages/EditorLoginPage";
import EditorDashboard from "./pages/EditorDashboard";

/* ------------------ ProtectedRoute ------------------ */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useEditor();

  if (loading)
    return (
      <div className="text-center text-gray-400 mt-10">
        Checking authentication...
      </div>
    );

  return isAuthenticated ? children : <Navigate to="/editor-login" replace />;
}

/* ------------------ Main App ------------------ */
function RootApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="flex-1 p-6 pb-28">
        <Routes>
          {/* 🌸 Core pages */}
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/writing" element={<WritingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />

          {/* 🩷 WRITING — POEMS */}
          <Route path="/writing/poems/new" element={<NewPoemPage />} />
          <Route path="/writing/poems/edit/:slug" element={<EditPoemPage />} />
          <Route path="/writing/poems/:slug" element={<PoemViewPage />} />
          <Route path="/writing/poems" element={<PoemsIndexPage />} />

          {/* 🩶 WRITING — BLOGS */}
          <Route path="/writing/blogs/new" element={<NewBlogPage />} />
          <Route path="/writing/blogs/:slug" element={<BlogViewPage />} />
          <Route path="/writing/blogs" element={<BlogListPage />} />

          {/* 📚 WRITING — NOVELS */}
          <Route path="/writing/novels" element={<NovelListPage />} />
          <Route path="/writing/novels/new" element={<NewNovelPage />} />

          {/* ✔ EDIT NOVEL METADATA */}
          <Route
            path="/writing/novels/edit/:novelSlug"
            element={<EditNovelMetaPage />}
          />

          {/* ✔ CHAPTER LIST */}
          <Route
            path="/writing/novels/edit/:novelSlug/chapters"
            element={<ChapterListPage />}
          />

          {/* ✔ NEW CHAPTER */}
          <Route
            path="/writing/novels/edit/:novelSlug/chapters/new"
            element={<NewChapterPage />}
          />

          {/* ✔ EDIT CHAPTER (Tiptap editor) */}
          <Route
            path="/writing/novels/edit/:novelSlug/chapters/:chapterSlug"
            element={<ChapterEditorPage />}
          />

          {/* ⭐ PUBLIC READ CHAPTER (not editor mode) */}
          <Route
            path="/writing/novels/:novelSlug/chapters/:chapterSlug"
            element={<ReadChapterPage />}
          />

          {/* 🛠 Editor */}
          <Route path="/editor-login" element={<EditorLoginPage />} />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="text-center text-gray-400 mt-10">
                <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
                <p className="opacity-60 mt-2">
                  Try using the navigation bar above.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------ Wrapper ------------------ */
const queryClient = new QueryClient();

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditorProvider>
        <RootApp />
      </EditorProvider>
    </QueryClientProvider>
  );
}
