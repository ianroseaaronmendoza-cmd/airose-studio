"use client";

import React, { Suspense } from "react";
import EditorLoginForm from "./EditorLoginForm";

export default function EditorLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorLoginForm />
    </Suspense>
  );
}