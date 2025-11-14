import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string; // optional target route
  label?: string; // button label
  className?: string; // optional styling
}

export default function BackButton({ to, label = "Back", className }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition ${className || ""}`}
    >
      {label}
    </button>
  );
}
