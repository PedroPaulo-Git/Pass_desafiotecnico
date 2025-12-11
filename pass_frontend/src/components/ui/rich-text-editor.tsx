"use client";

import * as React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  Undo2,
  Redo2,
  Heading1,
  List,
  ListOrdered,
  CheckSquare,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Underline as UnderlineIcon,
  Eraser,
  Link as LinkIcon,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

// Toolbar Button Component
function ToolbarButton({
  pressed,
  onPressedChange,
  disabled,
  children,
  tooltip,
}: {
  pressed?: boolean;
  onPressedChange?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <Toggle
      size="sm"
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 data-[state=on]:bg-muted data-[state=on]:text-foreground",
        "hover:bg-muted/60 transition-colors"
      )}
      title={tooltip}
    >
      {children}
    </Toggle>
  );
}

// Editor Toolbar Component
function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background px-2 py-1.5">
      {/* Undo/Redo */}
      <ToolbarButton
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Desfazer"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Refazer"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Heading Selector */}
      <Select
        value={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
            ? "h2"
            : editor.isActive("heading", { level: 3 })
            ? "h3"
            : "p"
        }
        onValueChange={(value) => {
          if (value === "p") {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value.replace("h", "")) as 1 | 2 | 3;
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
      >
        <SelectTrigger className="h-8 w-20 text-xs border-0 bg-transparent hover:bg-muted/60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Normal</SelectItem>
          <SelectItem value="h1">H1</SelectItem>
          <SelectItem value="h2">H2</SelectItem>
          <SelectItem value="h3">H3</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <ToolbarButton
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        tooltip="Lista com marcadores"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        tooltip="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        pressed={editor.isActive("blockquote")}
        tooltip="Citação"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Formatting */}
      <ToolbarButton
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        tooltip="Negrito"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        tooltip="Itálico"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        tooltip="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        tooltip="Código"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        tooltip="Sublinhado"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onPressedChange={() => editor.chain().focus().unsetAllMarks().run()}
        tooltip="Limpar formatação"
      >
        <Eraser className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Link */}
      <ToolbarButton
        pressed={editor.isActive("link")}
        onPressedChange={setLink}
        tooltip="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>

      {/* Superscript/Subscript */}
      <ToolbarButton
        pressed={editor.isActive("superscript")}
        onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
        tooltip="Sobrescrito"
      >
        <SuperscriptIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive("subscript")}
        onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
        tooltip="Subscrito"
      >
        <SubscriptIcon className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Alignment */}
      <ToolbarButton
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
        tooltip="Alinhar à esquerda"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
        tooltip="Centralizar"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
        tooltip="Alinhar à direita"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
        tooltip="Justificar"
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

// Main Rich Text Editor Component
export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Comece a escrever...",
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:text-primary/80",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
    ],
    content,
    editable,
    immediatelyRender: false, // Prevent SSR hydration mismatch and duplicate key warnings
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "min-h-[300px] w-full px-6 py-4 focus:outline-none",
          "prose-headings:font-bold prose-headings:text-foreground",
          "prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6",
          "prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5",
          "prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4",
          "prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-3",
          "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-3",
          "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-3",
          "prose-li:mb-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-a:text-primary prose-a:underline",
          "prose-strong:font-bold prose-strong:text-foreground",
          "[&_*]:text-foreground"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background overflow-hidden",
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="overflow-y-auto max-h-[500px]"
      />
    </div>
  );
}

export { RichTextEditor as default };
