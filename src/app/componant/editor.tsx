// components/EditorComponent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
  onChange?: (data: any) => void;
  holder: string;
  readOnly?: boolean;
}

const EditorComponent = ({
  data,
  onChange,
  holder,
  readOnly,
}: EditorComponentProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Convert plain text to EditorJS format
  const convertToEditorJSFormat = (content: any) => {
    if (typeof content === "string") {
      return {
        time: Date.now(),
        blocks: [
          {
            type: "paragraph",
            data: {
              text: content,
            },
          },
        ],
        version: "2.22.2",
      };
    }
    // If it's already in EditorJS format or empty, return as is
    return content || { blocks: [] };
  };

  useEffect(() => {
    if (!editorRef.current) {
      const initialData = convertToEditorJSFormat(data);

      const editor = new EditorJS({
        holder: holder,
        readOnly: readOnly,
        tools: {
          header: Header,
          list: List,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append("token", localStorage.getItem("token") ?? "");
                  formData.append("image", file);

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/edit-panel/upload-image`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  const result = await response.json();
                  if (response.ok && result.success === 1) {
                    return result;
                  } else {
                    throw new Error(result.message || "Image upload failed");
                  }
                },
                async uploadByUrl(url: string) {
                  const token = localStorage.getItem("authToken");
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/fetch-url`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ url }),
                    }
                  );
                  return await response.json();
                },
              },
            },
          },
          table: Table,
          quote: Quote,
          inlineCode: InlineCode,
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true,
          },
        },
        data: initialData,
        async onChange(api) {
          if (onChange) {
            const content = await api.saver.save();
            onChange(content);
          }
        },
        onReady: () => {
          setIsReady(true);
        },
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, [holder]);

  // Handle data updates when props change
  useEffect(() => {
    if (isReady && editorRef.current && data) {
      const formattedData = convertToEditorJSFormat(data);
      editorRef.current.render(formattedData);
    }
  }, [data, isReady]);

  return <div id={holder} />;
};

export default EditorComponent;
