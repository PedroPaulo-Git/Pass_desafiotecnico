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
  Heading,  Heading1,  Heading2,  Heading3,
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
    <div className="flex flex-wrap items-center justify-center gap-0.5 border-b border-border bg-background px-2 py-1.5">
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
        <SelectTrigger className={cn(
          "h-8 w-14 text-xs border-0 bg-transparent hover:bg-muted/60",
          editor.isActive("heading") && "bg-muted"
        )}>
          <SelectValue>
            {editor.isActive("heading", { level: 1 }) ? (
              <Heading1 className="h-4 w-4" />
            ) : editor.isActive("heading", { level: 2 }) ? (
              <Heading2 className="h-4 w-4" />
            ) : editor.isActive("heading", { level: 3 }) ? (
              <Heading3 className="h-4 w-4" />
            ) : (
              <Heading className="h-4 w-4" />
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="text-muted-foreground">
          {/* <SelectItem value="p"><Heading/></SelectItem> */}
          <SelectItem value="h1"><Heading1 className="hover:text-inherit"/>Titulo 1</SelectItem>
          <SelectItem value="h2"><Heading2 className="hover:text-inherit"/>Titulo 2</SelectItem>
          <SelectItem value="h3"><Heading3 className="hover:text-inherit"/>Titulo 3</SelectItem>
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
          // Custom heading styles using [&_*] selectors for better specificity
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-foreground",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-foreground",
          "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground",
          "[&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-3",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3",
          "[&_li]:mb-1 [&_li]:text-foreground",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground",
          "[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-primary/80",
          "[&_strong]:font-bold [&_strong]:text-foreground",
          "[&_em]:text-foreground",
          "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
          "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto",
          "[&_u]:underline",
          "[&_s]:line-through",
          "[&_sup]:text-xs [&_sup]:align-super",
          "[&_sub]:text-xs [&_sub]:align-sub",
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
        "bg-background overflow-hidden",
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
