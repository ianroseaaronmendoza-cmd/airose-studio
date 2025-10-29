// ✅ Prevents "missing lambda" errors for client-only routes
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";
export const revalidate = 0;

// ✅ Tell Next.js this is purely a client route (no server Lambda)
export const runtime = "edge";
export const preferredRegion = "auto";

export default {};

