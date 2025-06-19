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

  // Only allow certain HTML tags
  const sanitizedHtml = text
    .replace(/<br\s*\/?>/g, "\n") // Convert <br> to newlines first
    .replace(/<(\/?(b|i|u|strong|em|a))>/g, "<$1>"); // Only allow basic formatting tags

  // Convert newlines back to <br> tags
  const htmlWithBreaks = sanitizedHtml.replace(/\n/g, "<br />");

  return (
    <p
      className="editorjs-paragraph"
      dangerouslySetInnerHTML={{ __html: htmlWithBreaks }}
    />
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

// Improved HTML escaping function
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&(?!(amp|lt|gt|quot|#039);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Function to clean HTML by removing unwanted attributes
const cleanHtml = (html: string) => {
  // Remove unwanted attributes
  return html.replace(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tag) => {
    const allowedAttributes: Record<string, string[]> = {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "style"],
      b: [],
      strong: [],
      i: [],
      em: [],
      u: [],
    };

    const allowed = allowedAttributes[tag.toLowerCase()] || [];

    if (allowed.length === 0) {
      return `<${tag}>`;
    }

    const attributes = match.match(/(\w+)=["']([^"']*)["']/g) || [];
    const keptAttributes = attributes.filter((attr) => {
      const name = attr.split("=")[0];
      return allowed.includes(name);
    });

    return `<${tag} ${keptAttributes.join(" ")}>`;
  });
};

// Component for table blocks with improved HTML handling
const TableBlock: React.FC<{
  withHeadings: boolean;
  content: string[][];
  stretched: boolean;
}> = ({ withHeadings, content, stretched }) => {
  if (!content || !Array.isArray(content)) return null;

  const renderCellContent = (cell: string) => {
    if (!cell) return null;

    // First clean the HTML
    const cleanedCell = cleanHtml(cell);

    // Then escape HTML except allowed tags
    const withEscapedTags = cleanedCell.replace(
      /<(?!\/?(b|strong|i|em|u|a)(?=>|\s.*>))\/?.*?>/g,
      (match) => escapeHtml(match)
    );

    // Create a DOM element to parse the content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = withEscapedTags;

    // Process each node recursively
    const processNode = (node: Node): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        // Handle anchor tags
        if (element.tagName.toLowerCase() === "a") {
          const href = element.getAttribute("href") || "#";
          const isImage = /(\.png|\.jpg|\.jpeg|\.gif)$/i.test(href);

          if (isImage) {
            return (
              <div
                key={Math.random()}
                style={{ display: "block", margin: "4px 0" }}
              >
                <img
                  src={href}
                  alt=""
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    height: "auto",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-image.png";
                  }}
                />
              </div>
            );
          }

          return (
            <a
              key={Math.random()}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {Array.from(element.childNodes).map((child, i) =>
                processNode(child)
              )}
            </a>
          );
        }

        // Handle bold/strong tags
        if (
          element.tagName.toLowerCase() === "b" ||
          element.tagName.toLowerCase() === "strong"
        ) {
          return (
            <strong key={Math.random()}>
              {Array.from(element.childNodes).map((child, i) =>
                processNode(child)
              )}
            </strong>
          );
        }

        // Handle italic/emphasis tags
        if (
          element.tagName.toLowerCase() === "i" ||
          element.tagName.toLowerCase() === "em"
        ) {
          return (
            <em key={Math.random()}>
              {Array.from(element.childNodes).map((child, i) =>
                processNode(child)
              )}
            </em>
          );
        }

        // Handle underline tags
        if (element.tagName.toLowerCase() === "u") {
          return (
            <u key={Math.random()}>
              {Array.from(element.childNodes).map((child, i) =>
                processNode(child)
              )}
            </u>
          );
        }
      }

      // For any other nodes, return their text content
      return Array.from(node.childNodes).map((child, i) => processNode(child));
    };

    return (
      <div style={{ lineHeight: "1.5" }}>
        {Array.from(tempDiv.childNodes).map((node, i) => (
          <React.Fragment key={i}>{processNode(node)}</React.Fragment>
        ))}
      </div>
    );
  };

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
                  {renderCellContent(cell)}
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
                    verticalAlign: "top",
                  }}
                >
                  {renderCellContent(cell)}
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
