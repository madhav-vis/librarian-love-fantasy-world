import { useEffect, useState } from "react";
interface DialogueBoxProps {
  speaker: string;
  text: string;
  onNext: () => void;
  canAdvance: boolean;
}

export function DialogueBox({
  speaker,
  text,
  onNext,
  canAdvance,
}: DialogueBoxProps) {
  const [visibleText, setVisibleText] = useState("");
  
  // Faster typing animation - add characters more quickly
  useEffect(() => {
    setVisibleText(""); // Reset when text changes
    const interval = setInterval(() => {
      setVisibleText((prev) => {
        if (prev.length < text.length) {
          return text.slice(0, prev.length + 2); // Add 2 characters at a time for faster animation
        }
        return prev;
      });
    }, 20); // Faster interval
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="dialogue-box">
      <div className="dialogue-speaker">{speaker}</div>
      <div className="dialogue-text">{visibleText}</div>
      {canAdvance && (
        <button className="dialogue-next" onClick={onNext}>
          ▶
        </button>
      )}
    </div>
  );
}