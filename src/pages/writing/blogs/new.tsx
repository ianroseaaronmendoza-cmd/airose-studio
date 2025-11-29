// src/pages/writing/blogs/new.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import BlogEditor from "./edit/BlogEditor";
import BackButton from "@/components/BackButton";

export default function NewBlogPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BackButton label="Back" to="/writing/blogs" />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        New Blog
      </h1>

      <BlogEditor
        initial={{
          title: "",
          content: "",
          coverImage: "",
        }}
        onSaved={(saved) => navigate(`/writing/blogs/${saved.slug}`)}
      />
    </div>
  );
}
