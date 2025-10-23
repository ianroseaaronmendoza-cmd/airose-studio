import Link from "next/link";
import { poems } from "../../../data/writings";

export default function PoemsPage() {
  const safePoems = Array.isArray(poems) ? poems : [];

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Poems</h1>

      {safePoems.length === 0 ? (
        <p className="text-gray-400">No poems found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {safePoems.map((p) => (
            <Link
              key={p.slug}
              href={`/writing/poems/${p.slug}`}
              className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-xs text-gray-500">{p.date}</p>
              <p className="text-sm text-gray-400 mt-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
