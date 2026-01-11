import { useState, useEffect } from "react";
import { DialogueBox } from "./DialogueBox";

interface NameInputScreenProps {
  onNameSubmit: (name: string) => void;
}

export function NameInputScreen({ onNameSubmit }: NameInputScreenProps) {
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [dialogueFinished, setDialogueFinished] = useState(false);

  // Show input after dialogue is clicked/advanced
  const handleDialogueNext = () => {
    setDialogueFinished(true);
    setShowInput(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div 
      className="intro-dialogue-screen"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        position: 'relative',
      }}
    >
      {!dialogueFinished ? (
        <DialogueBox
          speaker=""
          text="What was my name again?"
          onNext={handleDialogueNext}
          canAdvance={true}
        />
      ) : null}
      
      {showInput && (
        <div
          className="name-input-container"
          style={{
            position: 'fixed',
            bottom: dialogueFinished ? '180px' : '200px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
            width: '90%',
            maxWidth: '600px',
            opacity: showInput ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="name-input"
              autoFocus
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                fontSize: '1.2rem',
                fontFamily: '"EB Garamond", "Times New Roman", Times, serif',
                background: 'rgba(0, 0, 0, 0.8)',
                border: '2px solid #4a9eff',
                borderRadius: '10px',
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="name-submit-button"
              disabled={!name.trim()}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: '#4a9eff',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.6,
                fontWeight: 'bold',
                transition: 'all 0.3s',
              }}
            >
              Continue
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
