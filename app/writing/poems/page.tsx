// ✅ Server wrapper for /writing/poems
import PoemsClient from "./_client/page";

// Force dynamic runtime so it always deploys a lambda
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";
export const revalidate = 0;

// Use Node runtime for compatibility
export const runtime = "nodejs";

export default function PoemsPageWrapper() {
  // ✅ This page has no params, so no props needed
  return <PoemsClient />;
}
