// components/EditorComponent.tsx
"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Table from "@editorjs/table";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import Paragraph from "@editorjs/paragraph";

interface EditorComponentProps {
  data?: any;
  onChange: (data: any) => void;
  holder: string;
}

const EditorComponent = ({ data, onChange, holder }: EditorComponentProps) => {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      initEditor();
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, []);

  const initEditor = () => {
    const editor = new EditorJS({
      holder: holder,
      tools: {
        header: {
          class: Header as any,
          config: {
            placeholder: "Enter a header",
            levels: [1, 2, 3, 4],
            defaultLevel: 3,
          },
        },
        list: {
          class: List as any,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: `${process.env.NEXT_PUBLIC_BASE_URL}/upload-image`,
              byUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/fetch-url`,
            },
          },
        },
        table: {
          class: Table as any,
          inlineToolbar: true,
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
        },
        inlineCode: {
          class: InlineCode,
        },
        paragraph: {
          class: Paragraph as any,
          inlineToolbar: true,
        },
      },
      data: data || { blocks: [] },
      async onChange(api) {
        const content = await api.saver.save();
        onChange(content);
      },
    });

    editorRef.current = editor;
  };

  return <div id={holder} />;
};

export default EditorComponent;
