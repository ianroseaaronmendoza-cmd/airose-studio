// ✅ Server wrapper for /writing/novels
import NovelsClient from "./_client/page";

// Always dynamic to force lambda creation
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";
export const revalidate = 0;

// Use Node runtime for compatibility
export const runtime = "nodejs";

export default function NovelsPageWrapper() {
  return <NovelsClient />;
}
