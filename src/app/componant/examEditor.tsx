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

const ExamEditorComponent = ({
  data,
  onChange,
  holder,
}: EditorComponentProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const toast = useToast();
  console.log(holder);

  // Function to clean empty blocks before saving
  const cleanEditorData = (content: any) => {
    if (!content || !content.blocks) return content;

    const cleanedBlocks = content.blocks
      .map((block: any) => {
        if (block.type === "paragraph") {
          let text = block.data?.text || "";
          // Replace all &nbsp; with a space, then trim
          text = text.replace(/&nbsp;/g, " ").trim();
          return {
            ...block,
            data: {
              ...block.data,
              text,
            },
          };
        }
        return block;
      })
      .filter((block: any) => {
        if (block.type === "paragraph") {
          const text = block.data?.text || "";
          // Remove if empty or only contains whitespace
          return text.replace(/\s/g, "") !== "";
        }
        return true;
      });

    return {
      ...content,
      blocks: cleanedBlocks,
    };
  };

  // NEW: Function to format URL for display
  const formatUrlForDisplay = (url: string): string => {
    // Check if this is a base64 data URL
    if (url.startsWith("data:image/")) {
      return "[Pasted image data]";
    }

    // For regular URLs, if they're too long, truncate them
    if (url.length > 50) {
      return url.substring(0, 47) + "...";
    }

    return url;
  };

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
                // The existing upload logic remains the same.
                // It already relies on the backend for size validation.
                let folderName = "";
                const folderTypes = ["concepts", "questions", "options"];

                // Extract folder name from holder
                for (const folder of folderTypes) {
                  if (holder.includes(folder)) {
                    folderName = folder;
                    break;
                  }
                }

                console.log(holder, folderName);
                const token = localStorage.getItem("token") ?? "";
                const formData = new FormData();
                // formData.append("token", token);
                formData.append("imageFile", file);
                formData.append("folderName", folderName);

                try {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_GAME_URL}/masters/sps/upload-image`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      body: formData,
                    }
                  );

                  const result = await response.json();
                  console.log(result);
                  if (response.ok && result.success === 1) {
                    toast({
                      title: "Image uploaded",
                      description: `Image successfully uploaded and compressed.`,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                      position: "top-right",
                    });
                    return result;
                  } else {
                    throw new Error(result.message || "Image upload failed");
                  }
                } catch (error: any) {
                  toast({
                    title: "Upload Error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                  });
                  return { success: 0 };
                }
              },
              async uploadByUrl(url: string) {
                if (url.startsWith("data:image/")) {
                  try {
                    // --- Client-side size check for pasted images ---
                    const res = await fetch(url);
                    const blob = await res.blob();
                    const fileSizeInMB = blob.size / 1024 / 1024;
                    const MAX_SIZE_MB = 5;

                    if (fileSizeInMB > MAX_SIZE_MB) {
                      toast({
                        title: "Image Too Large",
                        description: `Pasted image is ${fileSizeInMB.toFixed(
                          2
                        )}MB. The maximum allowed size is ${MAX_SIZE_MB}MB.`,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "top-right",
                      });
                      return { success: 0 }; // Fail the upload immediately
                    }
                    // --- End of client-side check ---

                    // If size is valid, convert blob to a file
                    const file = new File([blob], "pasted-image.png", {
                      type: blob.type,
                    });

                    // Send it through the secure uploadByFile logic
                    return this.uploadByFile(file);
                  } catch (error) {
                    toast({
                      title: "Paste Error",
                      description: "Could not process pasted image.",
                      status: "error",
                      duration: 5000,
                      isClosable: true,
                      position: "top-right",
                    });
                    return { success: 0 };
                  }
                }

                // If it's a regular URL, just accept it
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
        // Clean the content before passing to onChange
        const cleanedContent = cleanEditorData(content);
        console.log("Editor content changed:", cleanedContent);
        onChange(cleanedContent);
      },
    });

    editorRef.current = editor;
  };

  return <div id={holder} />;
};

export default ExamEditorComponent;
