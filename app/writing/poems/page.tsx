// ✅ Server wrapper for /writing/poems
import PoemsClient from "./_client/page";

// ✅ Force dynamic rendering for proper behavior in Vercel Lambdas
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";
export const revalidate = 0;

// ✅ Use Node.js runtime for better compatibility
export const runtime = "nodejs";

export default function PoemsPageWrapper() {
  // ✅ This page has no params, so no props needed
  return <PoemsClient />;
}

