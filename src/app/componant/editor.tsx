// components/EditorComponent.tsx
"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import Paragraph from "@editorjs/paragraph";
import Table from "@editorjs/table";
import { useToast } from "@chakra-ui/react";

interface EditorComponentProps {
  data?: any;
  onChange: (data: any) => void;
  holder: string;
}

const EditorComponent = ({ data, onChange, holder }: EditorComponentProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const toast = useToast();

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
                  console.log("Image URL upload:", result.file.url);
                  toast({
                    title: "Image upload",
                    description: `URL: ${result.file.url}`,
                    status: "info",
                    duration: null,
                    isClosable: true,
                  });
                  return result;
                } else {
                  throw new Error(result.message || "Image upload failed");
                }
              },
              async uploadByUrl(url: string) {
                console.log("Image URL upload:", url);
                toast({
                  title: "Image upload",
                  description: `URL: ${url}`,
                  status: "info",
                  duration: null,
                  isClosable: true,
                });
                return {
                  success: 1,
                  file: {
                    url: url,
                  },
                };
              },
            },
          },
        },
        table: {
          class: Table as any,
          inlineToolbar: true,
        },
        // quote: {
        //   class: Quote,
        //   inlineToolbar: true,
        // },
        // inlineCode: {
        //   class: InlineCode,
        // },
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
