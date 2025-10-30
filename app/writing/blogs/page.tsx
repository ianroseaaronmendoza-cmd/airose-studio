// ✅ Server wrapper for /writing/blogs
import BlogsClient from "./_client/page";

// Force dynamic runtime so it always generates a lambda
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";
export const revalidate = 0;

// Use Node runtime for compatibility
export const runtime = "nodejs";

export default function BlogsPageWrapper() {
  return <BlogsClient />;
}




