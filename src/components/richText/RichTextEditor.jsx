import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

function MenuBar({ editor }) {
  if (!editor) return null;

  const btnClass = (active) =>
    `rounded px-2 py-1 text-xs font-semibold transition ${
      active
        ? "bg-brand-500 text-white"
        : "bg-brand-100 text-brand-700 hover:bg-brand-200"
    }`;

  return (
    <div className="mb-2 flex flex-wrap gap-1">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive("underline"))}>U</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))}>H3</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>1. List</button>
      <button type="button" onClick={() => {
        const url = window.prompt("Enter URL:");
        if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }} className={btnClass(editor.isActive("link"))}>Link</button>
      <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={btnClass(false)}>Unlink</button>
    </div>
  );
}

function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
    ],
    content: content || "",
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  return (
    <div className={`rounded-xl border border-ink-100 bg-brand-50/50 transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-200/60`}>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[120px] px-4 pb-3 text-sm text-ink-900 [&_.tiptap]:outline-none [&_.tiptap]:min-h-[100px] [&_.tiptap_p]:mb-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:mb-2 [&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mb-2 [&_.tiptap_a]:text-brand-600 [&_.tiptap_a]:underline"
      />
    </div>
  );
}

export default RichTextEditor;
