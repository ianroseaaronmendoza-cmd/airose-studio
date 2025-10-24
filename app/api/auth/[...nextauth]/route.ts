mkdir -p app/api/auth/[...nextauth]

cat > app/api/auth/[...nextauth]/route.ts <<'EOF'
// TEMPORARY TEST ROUTE - return JSON and log a few values
export const runtime = "nodejs";

console.log("TEST ROUTE LOADED", {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
});

async function testHandler() {
  return new Response(JSON.stringify({
    ok: true,
    now: new Date().toISOString(),
    envs: {
      NODE_ENV: process.env.NODE_ENV ?? null,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    }
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export { testHandler as GET, testHandler as POST };
EOF