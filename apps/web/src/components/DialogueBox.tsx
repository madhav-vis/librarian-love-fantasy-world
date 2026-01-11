import React, { useEffect, useState } from "react";
interface DialogueBoxProps {
  speaker: string;
  text: string | React.ReactNode;
  onNext: () => void;
  canAdvance: boolean;
}

// Helper function to extract text content from ReactNode
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (typeof node === "object" && "props" in node) {
    if (node.props.children) {
      return extractText(node.props.children);
    }
  }
  return "";
}

// Helper function to reconstruct ReactNode with visible length
function renderAnimatedText(text: string | React.ReactNode, visibleLength: number): React.ReactNode {
  if (typeof text === "string") {
    return text.slice(0, visibleLength);
  }
  
  // Extract full text to calculate where to cut
  const fullText = extractText(text);
  if (visibleLength >= fullText.length) {
    return text; // Show full content
  }
  
  // For ReactNode with styling, we need to animate character by character
  // Reconstruct with only visible portion
  if (typeof text === "object" && text !== null && "props" in text) {
    const children = text.props.children;
    if (typeof children === "string") {
      return text;
    }
    if (Array.isArray(children)) {
      let currentLength = 0;
      const visibleChildren: React.ReactNode[] = [];
      
      for (const child of children) {
        if (typeof child === "string") {
          if (currentLength + child.length <= visibleLength) {
            visibleChildren.push(child);
            currentLength += child.length;
          } else {
            const remaining = visibleLength - currentLength;
            if (remaining > 0) {
              visibleChildren.push(child.slice(0, remaining));
            }
            break;
          }
        } else if (typeof child === "object" && child !== null && "props" in child) {
          const childText = extractText(child);
          if (currentLength + childText.length <= visibleLength) {
            visibleChildren.push(child);
            currentLength += childText.length;
          } else {
            // Need to partially render the styled element
            const remaining = visibleLength - currentLength;
            if (remaining > 0 && typeof child.props.children === "string") {
              visibleChildren.push(
                React.cloneElement(child as React.ReactElement, {
                  children: child.props.children.slice(0, remaining)
                })
              );
            }
            break;
          }
        } else {
          visibleChildren.push(child);
        }
      }
      
      return React.cloneElement(text as React.ReactElement, {
        children: visibleChildren
      });
    }
  }
  
  return text;
}

export function DialogueBox({
  speaker,
  text,
  onNext,
  canAdvance,
}: DialogueBoxProps) {
  const [visibleLength, setVisibleLength] = useState(0);
  const fullText = typeof text === "string" ? text : extractText(text);
  
  // Animate text character by character
  useEffect(() => {
    setVisibleLength(0); // Reset when text changes
    const interval = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev < fullText.length) {
          return prev + 2; // Add 2 characters at a time for faster animation
        }
        clearInterval(interval);
        return prev;
      });
    }, 20); // Faster interval
    return () => clearInterval(interval);
  }, [fullText.length]);
  
  const visibleText = typeof text === "string" 
    ? text.slice(0, visibleLength)
    : renderAnimatedText(text, visibleLength);

  // Replace "Quiz Master" with "Vincent"
  const displaySpeaker = speaker === "Quiz Master" ? "Vincent" : speaker;

  return (
    <div className="dialogue-box">
      {displaySpeaker && <div className="dialogue-speaker">{displaySpeaker}</div>}
      <div className="dialogue-text">{visibleText}</div>
      {canAdvance && (
        <button className="dialogue-next" onClick={onNext}>
          ▶
        </button>
      )}
    </div>
  );
}