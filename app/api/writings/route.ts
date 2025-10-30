// ✅ Use Node runtime to allow file read/write
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "writings-store.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { poems: [], novels: [], blogs: [] };
  }
}

async function writeData(data: any) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// --- GET: Fetch all writings or one type ---
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const data = await readData();
  return NextResponse.json(type ? data[type] ?? [] : data);
}

// --- POST: Add or update item ---
export async function POST(req: Request) {
  const body = await req.json();
  const { type, item } = body;

  if (!type || !item)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const data = await readData();
  const list = data[type] || [];

  const existingIndex = list.findIndex((x: any) => x.slug === item.slug);
  if (existingIndex >= 0) list[existingIndex] = item;
  else list.push(item);

  data[type] = list;
  await writeData(data);

  return NextResponse.json({ success: true });
}

// --- DELETE: Remove one item ---
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  if (!type || !slug)
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });

  const data = await readData();
  data[type] = (data[type] || []).filter((x: any) => x.slug !== slug);
  await writeData(data);

  return NextResponse.json({ success: true });
}



