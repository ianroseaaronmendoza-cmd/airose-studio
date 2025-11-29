import React, { useRef, useState, useEffect } from "react";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  NodeViewProps,
} from "@tiptap/react";
import Image from "@tiptap/extension-image";

const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { src, alt = "", width = "auto" } = node.attrs as any;
  const [currentWidth, setCurrentWidth] = useState<number>(
    width === "auto" ? 400 : parseInt(width, 10) || 400
  );

  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(currentWidth);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const delta = e.clientX - startX.current;
      const newWidth = Math.max(80, startWidth.current + delta);
      setCurrentWidth(newWidth);
      updateAttributes({ width: newWidth });
    };

    const up = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
  }, [updateAttributes]);

  useEffect(() => {
    if (width !== "auto") {
      const parsed = parseInt(String(width), 10);
      if (!Number.isNaN(parsed)) {
        setCurrentWidth(parsed);
      }
    }
  }, [width]);

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
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: `${currentWidth}px`,
          border: selected ? "2px solid #f472b6" : "none",
          borderRadius: "8px",
          display: "block",
          userSelect: "none",
        }}
      />

      {selected && (
        <>
          <div
            onMouseDown={startResize}
            className="absolute bottom-0 right-0 w-4 h-4 bg-pink-500 rounded-full cursor-ew-resize"
            style={{ transform: "translate(50%, 50%)" }}
          />

          <div className="absolute left-2 bottom-8 bg-black/70 px-2 py-1 rounded text-xs text-white">
            {currentWidth}px
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
};

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      width: {
        default: "auto",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-width") ||
          element.getAttribute("width") ||
          "auto",
        renderHTML: (attrs: any) => ({
          "data-width": attrs.width,
          width: attrs.width === "auto" ? undefined : attrs.width,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
