import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEditor } from "../../../context/EditorContext";
import { getPoem, deletePoem } from "../../../client/api/poems";

export default function PoemViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { editorMode } = useEditor();
  const navigate = useNavigate();

  const [poem, setPoem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getPoem(slug!);
      setPoem(data);
      setLoading(false);
    })();
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm("Delete this poem?")) return;
    await deletePoem(slug!);
    window.dispatchEvent(new Event("poemUpdated"));
    navigate("/writing/poems");
  };

  if (loading)
    return <p className="text-center text-gray-400 mt-10">Loading poem...</p>;

  if (!poem)
    return (
      <div className="text-center text-gray-400 mt-10">
        <Link
          to="/writing/poems"
          className="inline-block mb-4 text-pink-400 hover:text-white"
        >
          ← Back to Poems
        </Link>
        <p>Poem not found.</p>
      </div>
    );

  return (
    <div className="w-full pb-32 text-gray-100 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <Link
        to="/writing/poems"
        className="inline-block mb-4 text-pink-400 hover:text-white"
      >
        ← Back to Poems
      </Link>

      <h1 className="text-3xl font-bold mb-2">{poem.title}</h1>

      {poem.createdAt && (
        <p className="text-sm text-gray-500 mb-6">
          {new Date(poem.createdAt).toLocaleDateString()}
        </p>
      )}

      <div className="whitespace-pre-wrap text-gray-300 border-l-2 border-gray-800 pl-4 leading-relaxed">
        {poem.content}
      </div>

      {editorMode && (
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate(`/writing/poems/edit/${poem.slug}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
