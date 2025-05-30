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
import { read } from "fs";

interface EditorComponentProps {
  data?: any;
  onChange?: (data: any) => void;
  holder: string;
  readOnly?: boolean;
}

const dummy = {
  time: 1748582727919,
  blocks: [
    {
      id: "SUWx1nxZV0",
      type: "paragraph",
      data: { text: "question one"},
    },
    {
      id: "flWI-cNqyw",
      type: "image",
      data: {
        caption: "",
        withBorder: false,
        withBackground: false,
        stretched: false,
        file: {
          url: "https://stepgha.blr1.cdn.digitaloceanspaces.com/qa_pre_post_te/editpanel_2025-05-30_10-55-22_web.jpg",
        },
      },
    },
  ],
  version: "2.31.0-rc.7",
};

const EditorComponent = ({
  data,
  onChange,
  holder,
  readOnly,
}: EditorComponentProps) => {
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
      readOnly: readOnly,
      tools: {
        // header: {
        //   class: Header as any,
        //   config: {
        //     placeholder: "Enter a header",
        //     levels: [1, 2, 3, 4],
        //     defaultLevel: 3,
        //   },
        // },
        // list: {
        //   class: List as any,
        //   inlineToolbar: true,
        // },
        image: {
          class: ImageTool,
          config: {
            // endpoints: {
            //   byFile: `${process.env.NEXT_PUBLIC_BASE_URL}/edit-panel/upload-image`,
            //   byUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/fetch-url`,
            // },
            // Additional configuration for file upload
            uploader: {
              async uploadByFile(file: File) {
                const formData = new FormData();
                formData.append("token", localStorage.getItem("token") ?? ""); // or from cookies, etc.
                formData.append("image", file);

                console.log(Object.fromEntries(formData.entries()));

                // Get your auth token (adjust based on how you store it)

                try {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/edit-panel/upload-image`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  const result = await response.json();
                  console.log("Upload result:", result);
                  if (response.ok && result.success === 1) {
                    console.log("Image uploaded successfully:", result);
                    return result;
                  } else {
                    throw new Error(result.message || "Image upload failed");
                  }
                } catch (error) {
                  console.error("Upload error:", error);
                  throw error;
                }
              },
              async uploadByUrl(url: string) {
                // Similar implementation for URL upload if needed
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
              // @param {File}
              // @return {Promise.<{success, file: {url}}>}
            },
          },
        },
        // table: {
        //   class: Table as any,
        //   inlineToolbar: true,
        // },
        // quote: {
        //   class: Quote,
        //   inlineToolbar: true,
        // },
        // inlineCode: {
        //   class: InlineCode,
        // },
        // paragraph: {
        //   class: Paragraph as any,
        //   inlineToolbar: true,
        // },
      },
      data: data || { blocks: [] },
      async onChange(api) {
        const content = await api.saver.save();
        console.log("Editor content changed:", content);
        if (onChange) {
          onChange(content);
        }
      },
    });

    editorRef.current = editor;
  };

  return <div id={holder} />;
};

export default EditorComponent;
