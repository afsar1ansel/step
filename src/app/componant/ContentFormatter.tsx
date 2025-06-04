// components/ContentFormatter.tsx
import React from "react";
import Image from "next/image";

interface EditorJsData {
  blocks: Array<{
    type: string;
    data: any;
  }>;
}

interface ContentFormatterProps {
  content: string | EditorJsData | any;
}

const ContentFormatter: React.FC<ContentFormatterProps> = ({ content }) => {
  const renderContent = () => {
    // Handle case when content is already parsed JSON (EditorJsData)
    if (typeof content !== "string" && content?.blocks) {
      return renderEditorJsContent(content);
    }

    // Handle case when content is a string (could be JSON or plain text)
    if (typeof content === "string") {
      try {
        const parsedData = JSON.parse(content);
        if (parsedData?.blocks) {
          return renderEditorJsContent(parsedData);
        }
      } catch (e) {
        // If parsing fails, treat as plain text
        return renderPlainTextContent(content);
      }
    }

    // Fallback for other cases
    return <span>{String(content)}</span>;
  };

  const renderEditorJsContent = (data: EditorJsData) => {
    return (
      <div className="editorjs-content">
        {data.blocks.map((block, index) => {
          switch (block.type) {
            case "paragraph":
              return <ParagraphBlock key={index} text={block.data.text} />;
            case "header":
              return (
                <HeaderBlock
                  key={index}
                  text={block.data.text}
                  level={block.data.level || 1}
                />
              );
            case "list":
              return (
                <ListBlock
                  key={index}
                  items={block.data.items}
                  style={block.data.style || "unordered"}
                />
              );
            case "image":
              return <ImageBlock key={index} url={block.data.file?.url} />;
            case "table":
              return (
                <TableBlock
                  key={index}
                  withHeadings={block.data.withHeadings}
                  content={block.data.content}
                  stretched={block.data.stretched}
                />
              );
            default:
              return (
                <div key={index} className="unknown-block">
                  {JSON.stringify(block.data)}
                </div>
              );
          }
        })}
      </div>
    );
  };

  const renderPlainTextContent = (text: string) => {
    // Simple URL detection for images in plain text
    const urlRegex = /(https?:\/\/[^\s]+(?:\.png|\.jpg|\.jpeg|\.gif))/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the image
      const url = match[0];
      parts.push(<ImageBlock key={`image-${match.index}`} url={url} />);

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    return (
      <div
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          overflow: "auto",
          height: "100%",
          scrollbarWidth: "none",
          padding: "8px",
          backgroundColor: "transparent",
        }}
      >
        {parts}
      </div>
    );
  };

  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        overflow: "auto",
        height: "100%",
        scrollbarWidth: "none",
        padding: "8px",
        backgroundColor: "transparent",
      }}
    >
      {renderContent()}
    </div>
  );
};

// Component for paragraph blocks
const ParagraphBlock: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Replace all variations of line breaks
  const processedText = text
    .replace(/<br\s*\/?>/g, "\n")
    .split("\n")
    .map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));

  return (
    <p className="editorjs-paragraph">
      {processedText}
      <br />
    </p>
  );
};

// Component for header blocks
const HeaderBlock: React.FC<{ text: string; level: number }> = ({
  text,
  level,
}) => {
  if (!text) return null;

  const fontSize = getHeaderFontSize(level);
  const safeLevel = Math.min(Math.max(level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;

  const headers = {
    1: (props: any) => <h1 {...props} />,
    2: (props: any) => <h2 {...props} />,
    3: (props: any) => <h3 {...props} />,
    4: (props: any) => <h4 {...props} />,
    5: (props: any) => <h5 {...props} />,
    6: (props: any) => <h6 {...props} />,
  };

  const Header = headers[safeLevel];

  return (
    <Header className="editorjs-header" style={{ fontSize: `${fontSize}px` }}>
      {text}
      <br />
    </Header>
  );
};

// Component for list blocks
const ListBlock: React.FC<{
  items: string[];
  style: "ordered" | "unordered";
}> = ({ items, style }) => {
  if (!items || !Array.isArray(items)) return null;

  const ListTag = style === "ordered" ? "ol" : "ul";

  return (
    <ListTag className="editorjs-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  );
};

// Component for image blocks
const ImageBlock: React.FC<{ url?: string }> = ({ url }) => {
  if (!url) return null;

  return (
    <div className="editorjs-image">
      <img
        src={url}
        alt="Content image"
        style={{ width: "200px", height: "auto" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/fallback-image.png";
        }}
      />
      <br />
    </div>
  );
};

// Component for table blocks
const TableBlock: React.FC<{
  withHeadings: boolean;
  content: string[][];
  stretched: boolean;
}> = ({ withHeadings, content, stretched }) => {
  if (!content || !Array.isArray(content)) return null;

  return (
    <div
      style={{
        overflowX: "auto",
        width: stretched ? "100%" : "fit-content",
        margin: "12px 0",
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          display: "block",
        }}
      >
        {withHeadings && content.length > 0 && (
          <thead>
            <tr>
              {content[0].map((cell, cellIndex) => (
                <th
                  key={`th-${cellIndex}`}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {content.slice(withHeadings ? 1 : 0).map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`td-${rowIndex}-${cellIndex}`}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to get header font size
const getHeaderFontSize = (level: number): number => {
  switch (level) {
    case 1:
      return 24;
    case 2:
      return 20;
    case 3:
      return 18;
    default:
      return 16;
  }
};

export default ContentFormatter;
