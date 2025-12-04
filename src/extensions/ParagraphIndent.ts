import Paragraph from '@tiptap/extension-paragraph';
import { Editor } from '@tiptap/core';

function mergeStyles(existing: string | null, update: Record<string, string>) {
  const styleObj: Record<string, string> = {};
  if (existing) {
    existing.split(';').forEach(s => {
      const [key, value] = s.split(':').map(str => str && str.trim());
      if (key && value) styleObj[key] = value;
    });
  }
  Object.assign(styleObj, update);
  return Object.entries(styleObj)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

export const ParagraphIndent = Paragraph.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('style'),
        renderHTML: (attributes: { style?: string | null }) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },

  addCommands() {
    return {
      setParagraphIndent:
        (indent: string) =>
        ({ editor }: { editor: Editor }) => {
          const { style } = editor.getAttributes('paragraph');
          const merged = mergeStyles(style, { 'margin-left': indent });
          return editor.commands.updateAttributes('paragraph', { style: merged });
        },
      setParagraphFontSize:
        (size: string) =>
        ({ editor }: { editor: Editor }) => {
          const { style } = editor.getAttributes('paragraph');
          const merged = mergeStyles(style, { 'font-size': size });
          return editor.commands.updateAttributes('paragraph', { style: merged });
        },
    } as Partial<import('@tiptap/core').RawCommands>;
  },
});