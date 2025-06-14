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
// Simpler ParagraphBlock component using dangerouslySetInnerHTML
const ParagraphBlock: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Only allow certain HTML tags
  const sanitizedHtml = text
    .replace(/<br\s*\/?>/g, "\n") // Convert <br> to newlines first
    .replace(/<(\/?(b|i|u|strong|em))>/g, "<$1>"); // Only allow basic formatting tags

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

// Component for table blocks
const TableBlock: React.FC<{
  withHeadings: boolean;
  content: string[][];
  stretched: boolean;
}> = ({ withHeadings, content, stretched }) => {
  if (!content || !Array.isArray(content)) return null;

  // Function to render cell content with anchor-wrapped images
  const renderCellContent = (cell: string) => {
    if (!cell) return null;

    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cell;

    // Extract all anchor and bold tags
    const anchors = Array.from(
      tempDiv.querySelectorAll("a")
    ) as HTMLAnchorElement[];
    const boldTags = Array.from(
      tempDiv.querySelectorAll("b, strong")
    ) as HTMLElement[];
    const allTags = ([] as Element[]).concat(anchors, boldTags);

    // Sort tags by their position in the HTML
    allTags.sort((a, b) => {
      const positionA = cell.indexOf(a.outerHTML);
      const positionB = cell.indexOf(b.outerHTML);
      return positionA - positionB;
    });

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let hasTextBefore = false;

    // Process each tag
    allTags.forEach((tag, index) => {
      const tagStart = cell.indexOf(tag.outerHTML, lastIndex);

      // Add text before this tag
      if (tagStart > lastIndex) {
        const textBefore = cell.substring(lastIndex, tagStart);
        if (textBefore.trim().length > 0) {
          parts.push(<span key={`text-before-${index}`}>{textBefore}</span>);
          hasTextBefore = true;
        }
      }

      // Handle anchor tags (images and links)
      if (tag.tagName.toLowerCase() === "a") {
        const href = tag.getAttribute("href");
        const textContent = tag.textContent || "";

        // Check if this is an image URL
        if (href && /(\.png|\.jpg|\.jpeg|\.gif)$/i.test(href)) {
          // Add line break if there was text before
          if (hasTextBefore) {
            parts.push(<br key={`br-before-img-${index}`} />);
            hasTextBefore = false;
          }

          parts.push(
            <div
              key={`img-${index}`}
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
        } else {
          // For non-image links
          parts.push(
            <a
              key={`link-${index}`}
              href={href || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {textContent}
            </a>
          );
        }
      }
      // Handle bold tags
      else if (
        tag.tagName.toLowerCase() === "b" ||
        tag.tagName.toLowerCase() === "strong"
      ) {
        parts.push(<strong key={`bold-${index}`}>{tag.textContent}</strong>);
      }

      lastIndex = tagStart + tag.outerHTML.length;
    });

    // Add remaining text after last tag
    if (lastIndex < cell.length) {
      const remainingText = cell.substring(lastIndex);
      if (remainingText.trim().length > 0) {
        parts.push(<span key="text-end">{remainingText}</span>);
      }
    }

    return <div style={{ lineHeight: "1.5" }}>{parts}</div>;
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
