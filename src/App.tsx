import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DevotionLayout from "./components/devotion/DevotionLayout";
import PortfolioLayout from "./components/portfolio/PortfolioLayout";
import { EditorProvider } from "./context/EditorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home from "./pages/Home";
import WritingPage from "./pages/writing";

/* Lazy-loaded pages */
const MusicPage = lazy(() => import("./pages/MusicPage"));
const ProjectsPage = lazy(() => import("./pages/projects/index"));
const About = lazy(() => import("./pages/About"));
const Support = lazy(() => import("./pages/Support"));

const NewProjectPage = lazy(() => import("./pages/projects/new"));
const ProjectViewPage = lazy(() => import("./pages/projects/[slug]/index"));
const ProjectEditorPage = lazy(
  () => import("./pages/projects/edit/[slug]/index"),
);

const PoemsIndexPage = lazy(() => import("./pages/writing/poems/index"));
const PoemViewPage = lazy(() => import("./pages/writing/poems/[slug]"));
const NewPoemPage = lazy(() => import("./pages/writing/poems/new"));
const EditPoemPage = lazy(() => import("./pages/writing/poems/edit/[slug]"));

const BlogListPage = lazy(() => import("./pages/writing/blogs/index"));
const BlogViewPage = lazy(() => import("./pages/writing/blogs/[slug]"));
const NewBlogPage = lazy(() => import("./pages/writing/blogs/new"));
const EditBlogPage = lazy(
  () => import("./pages/writing/blogs/edit/BlogEditor"),
);

const NovelListPage = lazy(() => import("./pages/writing/novels/index"));
const NewNovelPage = lazy(() => import("./pages/writing/novels/new"));
const NovelDetailPage = lazy(
  () => import("./pages/writing/novels/[novelSlug]/index"),
);
const NovelEditorPage = lazy(
  () => import("./pages/writing/novels/edit/NovelEditor"),
);
const ManageChaptersPage = lazy(
  () => import("./pages/writing/novels/edit/[novelSlug]/chapters/index"),
);
const NewChapterPage = lazy(
  () => import("./pages/writing/novels/edit/[novelSlug]/chapters/new"),
);
const ChapterEditorPage = lazy(
  () =>
    import("./pages/writing/novels/edit/[novelSlug]/chapters/[chapterSlug]/index"),
);
const ReadChapterPage = lazy(
  () =>
    import("./pages/writing/novels/[novelSlug]/chapters/[chapterSlug]/read"),
);

const BooksPage = lazy(() => import("./pages/books"));

/* 🆕 Devotion pages */
const DevotionLandingPage = lazy(() => import("./pages/devotion/index"));
const MorningDevotionPage = lazy(() => import("./pages/devotion/morning"));
const EveningDevotionPage = lazy(() => import("./pages/devotion/evening"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-gray-400">Loading...</div>
  </div>
);

function RootApp() {
  const { pathname } = useLocation();
  const isDevotion =
    pathname === "/devotion" || pathname.startsWith("/devotion/");
  const Layout = isDevotion ? DevotionLayout : PortfolioLayout;
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksPage />} />

          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/music" element={<MusicPage />} />

          <Route path="/writing" element={<WritingPage />} />
          <Route path="/writing/blogs" element={<BlogListPage />} />
          <Route path="/writing/blogs/new" element={<NewBlogPage />} />
          <Route path="/writing/blogs/:slug" element={<BlogViewPage />} />
          <Route
            path="/writing/blogs/edit/:slug"
            element={
              <EditBlogPage
                initial={{ title: "", content: "", coverImage: "" }}
                onSaved={() => {}}
              />
            }
          />

          <Route path="/writing/novels" element={<NovelListPage />} />
          <Route path="/writing/novels/new" element={<NewNovelPage />} />
          <Route
            path="/writing/novels/:novelSlug"
            element={<NovelDetailPage />}
          />
          <Route
            path="/writing/novels/:novelSlug/chapters/:chapterSlug/read"
            element={<ReadChapterPage />}
          />
          <Route
            path="/writing/novels/edit/:novelSlug"
            element={<NovelEditorPage />}
          />
          <Route
            path="/writing/novels/edit/:novelSlug/chapters"
            element={<ManageChaptersPage />}
          />
          <Route
            path="/writing/novels/edit/:novelSlug/chapters/new"
            element={<NewChapterPage />}
          />
          <Route
            path="/writing/novels/edit/:novelSlug/chapters/:chapterSlug"
            element={<ChapterEditorPage />}
          />

          <Route path="/writing/poems" element={<PoemsIndexPage />} />
          <Route path="/writing/poems/new" element={<NewPoemPage />} />
          <Route path="/writing/poems/:slug" element={<PoemViewPage />} />
          <Route path="/writing/poems/edit/:slug" element={<EditPoemPage />} />

          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/projects/:slug" element={<ProjectViewPage />} />
          <Route path="/projects/:slug/edit" element={<ProjectEditorPage />} />

          {/* 🆕 Devotion routes */}
          <Route path="/devotion" element={<DevotionLandingPage />} />
          <Route path="/devotion/morning" element={<MorningDevotionPage />} />
          <Route path="/devotion/evening" element={<EveningDevotionPage />} />

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
      </Suspense>
    </Layout>
  );
}

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
