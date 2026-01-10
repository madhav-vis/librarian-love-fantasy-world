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
  return (
    <div className="dialogue-box">
      <div className="dialogue-speaker">{speaker}</div>
      <div className="dialogue-text">{text}</div>
      {canAdvance && (
        <button className="dialogue-next" onClick={onNext}>
          ▶
        </button>
      )}
    </div>
  );
}