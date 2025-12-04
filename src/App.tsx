import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import { EditorProvider } from "./context/EditorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/* Layout */
import Header from "./components/Header";

/* Pages - Eager load for critical routes */
import Home from "./pages/Home";
import WritingPage from "./pages/writing"; // ✅ Changed from "./pages/writing/page" to "./pages/writing"

/* Lazy load heavy pages */
const MusicPage = lazy(() => import("./pages/MusicPage"));
const ProjectsPage = lazy(() => import("./pages/projects/index"));
const About = lazy(() => import("./pages/About"));
const Support = lazy(() => import("./pages/Support"));

/* Projects - Lazy */
const NewProjectPage = lazy(() => import("./pages/projects/new"));
const ProjectViewPage = lazy(() => import("./pages/projects/[slug]/index"));
const ProjectEditorPage = lazy(() => import("./pages/projects/edit/[slug]/index"));

/* Poems - Lazy */
const PoemsIndexPage = lazy(() => import("./pages/writing/poems/index"));
const PoemViewPage = lazy(() => import("./pages/writing/poems/[slug]"));
const NewPoemPage = lazy(() => import("./pages/writing/poems/new"));
const EditPoemPage = lazy(() => import("./pages/writing/poems/edit/[slug]"));

/* Blogs - Lazy */
const BlogListPage = lazy(() => import("./pages/writing/blogs/index"));
const BlogViewPage = lazy(() => import("./pages/writing/blogs/[slug]"));
const NewBlogPage = lazy(() => import("./pages/writing/blogs/new"));
const EditBlogPage = lazy(() => import("./pages/writing/blogs/[slug]"));

/* Novels - Lazy */
const NovelListPage = lazy(() => import("./pages/writing/novels/index"));
const NewNovelPage = lazy(() => import("./pages/writing/novels/new"));
const NovelDetailPage = lazy(() => import("./pages/writing/novels/[novelSlug]/index"));

// ✅ CHANGE THIS LINE - Import from NovelEditor.tsx, not [novelSlug]/index.tsx
const NovelEditorPage = lazy(() => import("./pages/writing/novels/edit/NovelEditor"));

const ManageChaptersPage = lazy(() => import("./pages/writing/novels/edit/[novelSlug]/chapters/index"));
const NewChapterPage = lazy(() => import("./pages/writing/novels/edit/[novelSlug]/chapters/new"));
const ChapterEditorPage = lazy(() => import("./pages/writing/novels/edit/[novelSlug]/chapters/[chapterSlug]/index"));
const ReadChapterPage = lazy(() => import("./pages/writing/novels/[novelSlug]/chapters/[chapterSlug]/read"));

/* Loading fallback */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-gray-400">Loading...</div>
  </div>
);

/* ------------------ Main App ------------------ */

function RootApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <Header />

      <main className="flex-1 pb-28">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 🌸 Core */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/music" element={<MusicPage />} />
            
            {/* Writing routes */}
            <Route path="/writing" element={<WritingPage />} />
            <Route path="/writing/blogs" element={<BlogListPage />} />
            <Route path="/writing/blogs/new" element={<NewBlogPage />} />
            <Route path="/writing/blogs/:slug" element={<BlogViewPage />} />
            <Route path="/writing/blogs/edit/:slug" element={<EditBlogPage />} />
            
            <Route path="/writing/novels" element={<NovelListPage />} />
            <Route path="/writing/novels/new" element={<NewNovelPage />} />
            <Route path="/writing/novels/:novelSlug" element={<NovelDetailPage />} />
            <Route path="/writing/novels/:novelSlug/chapters/:chapterSlug/read" element={<ReadChapterPage />} />
            
            <Route path="/writing/novels/edit/:novelSlug" element={<NovelEditorPage />} />
            <Route path="/writing/novels/edit/:novelSlug/chapters" element={<ManageChaptersPage />} />
            <Route path="/writing/novels/edit/:novelSlug/chapters/new" element={<NewChapterPage />} />
            <Route path="/writing/novels/edit/:novelSlug/chapters/:chapterSlug" element={<ChapterEditorPage />} />
            
            {/* ✒ Poems */}
            <Route path="/writing/poems" element={<PoemsIndexPage />} />
            <Route path="/writing/poems/new" element={<NewPoemPage />} />
            <Route path="/writing/poems/:slug" element={<PoemViewPage />} />
            <Route path="/writing/poems/edit/:slug" element={<EditPoemPage />} />

            {/* ⭐ Projects */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:slug" element={<ProjectViewPage />} />
            <Route path="/projects/:slug/edit" element={<ProjectEditorPage />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="text-center text-gray-400 mt-10">
                  <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
                  <p className="opacity-60 mt-2">Try using the navigation bar above.</p>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

/* Wrapper */
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
