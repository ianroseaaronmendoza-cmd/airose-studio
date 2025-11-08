import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { EditorProvider, useEditor } from "./context/EditorContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import MusicPage from "./pages/MusicPage";
import ProjectsPage from "./pages/ProjectsPage";
import WritingPage from "./pages/writing/page";
import About from "./pages/About";
import Support from "./pages/Support";

// Writing → Poems
import PoemsIndexPage from "./pages/writing/poems/index";
import PoemViewPage from "./pages/writing/poems/[slug]";
import NewPoemPage from "./pages/writing/poems/new";
import EditPoemPage from "./pages/writing/poems/edit/[slug]";

// 🩷 Writing → Blogs
import BlogListPage from "./pages/writing/blogs/index";
import BlogViewPage from "./pages/writing/blogs/[slug]";
import NewBlogPage from "./pages/writing/blogs/new";

// Editor
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
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/writing" element={<WritingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />

          {/* 🩷 WRITING — POEMS (ORDER IS CRITICAL) */}
          <Route path="/writing/poems/new" element={<NewPoemPage />} />
          <Route path="/writing/poems/edit/:slug" element={<EditPoemPage />} />
          <Route path="/writing/poems/:slug" element={<PoemViewPage />} />
          <Route path="/writing/poems" element={<PoemsIndexPage />} />

          {/* 🩶 WRITING — BLOGS */}
          <Route path="/writing/blogs/new" element={<NewBlogPage />} />
          <Route path="/writing/blogs/:slug" element={<BlogViewPage />} />
          <Route path="/writing/blogs" element={<BlogListPage />} />

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
export default function AppWrapper() {
  return (
    <EditorProvider>
      <RootApp />
    </EditorProvider>
  );
}
