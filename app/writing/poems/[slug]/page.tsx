import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

export default async function PoemView({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), "data", "writings.json");
  const file = fs.readFileSync(filePath, "utf-8");
  const { poems } = JSON.parse(file);

  const poem = poems.find((p: any) => p.slug === params.slug);
  if (!poem) return notFound();

  return (
    <div className="max-w-3xl mx-auto text-gray-100 px-6 py-8">
      <h1 className="text-3xl font-bold mb-4">{poem.title}</h1>
      <pre className="whitespace-pre-wrap text-gray-300">{poem.content}</pre>
    </div>
  );
}
