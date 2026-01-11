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
  
  // every 100ms, add a character to the visible text
  useEffect(() => {
    const interval = setInterval(() => {
      if (visibleText.length < text.length) {
        setVisibleText(text.slice(0, visibleText.length + 1));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [text, visibleText]);

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