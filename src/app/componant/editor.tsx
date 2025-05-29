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
  time: 1748503092233,
  blocks: [
    { id: "oWf_PutRxA", type: "paragraph", data: { text: "question text" } },
    {
      id: "Rxq8MQ0h34",
      type: "header",
      data: { text: "question heading", level: 3 },
    },
    {
      id: "5kybGH89q2",
      type: "image",
      data: {
        caption: "",
        withBorder: false,
        withBackground: false,
        stretched: false,
        file: {
          url: "https://stepgha.blr1.cdn.digitaloceanspaces.com/qa_pre_post_te/editpanel_2025-05-29_12-46-21_web.jpg",
        },
      },
    },
    {
      id: "nExw5jHzgS",
      type: "list",
      data: {
        style: "unordered",
        meta: {},
        items: [
          { content: "list unordered", meta: {}, items: [] },
          { content: "one and two", meta: {}, items: [] },
        ],
      },
    },
    {
      id: "HRbHlqZUa-",
      type: "list",
      data: {
        style: "ordered",
        meta: { counterType: "numeric" },
        items: [
          {
            content: "list ordred ",
            meta: {},
            items: [
              { content: "second ordered listh", meta: {}, items: [] },
              { content: "new", meta: {}, items: [] },
            ],
          },
        ],
      },
    },
    {
      id: "0kckZ9MzeL",
      type: "table",
      data: {
        withHeadings: false,
        stretched: false,
        content: [
          ["heading", "new head", "head"],
          ["h1", "h2&nbsp;", "h3"],
        ],
      },
    },
  ],
  version: "2.31.0-rc.7",
};

const EditorComponent = ({ data, onChange, holder , readOnly }: EditorComponentProps) => {
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
