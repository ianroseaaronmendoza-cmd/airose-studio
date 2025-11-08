import React from "react";
import BlogEditor from "./edit/BlogEditor";
import BackButton from "../../../components/BackButton";

export default function NewBlogPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* 🔙 BackButton */}
      <div className="flex items-center justify-between mb-8">
        <BackButton label="Back to Blogs" />
      </div>

      <BlogEditor
        mode="create"
        initialData={{ title: "", content: "", coverImage: "" }}
      />
    </div>
  );
}
