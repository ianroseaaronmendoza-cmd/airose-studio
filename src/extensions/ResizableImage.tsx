// src/extensions/ResizableImage.tsx
import React, { useRef, useState, useEffect } from "react";
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import Image from "@tiptap/extension-image";

/**
 * Custom resizable image node view for TipTap
 * Supports: resize handle, selected border, width label
 */
const ResizableImageComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, selected }) => {
  const { src, alt = "", width = "auto" } = node.attrs;
  const initialWidth = width === "auto" ? 400 : parseInt(width, 10) || 400;

  const [currentWidth, setCurrentWidth] = useState(initialWidth);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(currentWidth);

  // Resize handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.max(80, startWidth.current + delta);
      setCurrentWidth(newWidth);
      updateAttributes({ width: newWidth });
    };

    const handleUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "default";
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [updateAttributes]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = currentWidth;
    document.body.style.cursor = "ew-resize";
  };

  return (
    <NodeViewWrapper className="relative inline-block group">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: `${currentWidth}px`,
          borderRadius: "8px",
          border: selected ? "2px solid #f472b6" : "none",
          transition: "border 0.2s ease",
          userSelect: "none",
          display: "block",
        }}
        draggable={false}
        className="select-none"
      />
      {selected && (
        <>
          <div
            onMouseDown={startResize}
            title="Drag to resize"
            className="absolute bottom-0 right-0 w-4 h-4 bg-pink-500 rounded-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          />
          <div className="absolute left-2 bottom-8 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
            {Math.round(currentWidth)}px
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
};

/**
 * TipTap Image extension with custom node view
 */
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "auto",
        parseHTML: (element: HTMLElement) => element.getAttribute("width") || "auto",
        renderHTML: (attributes: any) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
