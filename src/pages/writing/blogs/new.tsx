// src/pages/writing/blogs/new.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import BlogEditor from "./edit/BlogEditor";
import BackButton from "@/components/BackButton";

export default function NewBlogPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
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
        onSaved={(saved: { slug: string }) => navigate(`/writing/blogs/${saved.slug}`)}
      />
    </div>
  );
}
