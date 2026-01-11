import { useState, useEffect } from "react";
import { DialogueBox } from "./DialogueBox";

interface PlayerResponseScreenProps {
  playerName: string;
  onNext: () => void;
}

export function PlayerResponseScreen({ playerName, onNext }: PlayerResponseScreenProps) {
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [characterOpacity, setCharacterOpacity] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);

  useEffect(() => {
    // Fade in background first
    const backgroundTimer = setTimeout(() => {
      setBackgroundOpacity(1);
    }, 300);

    // Fade in character after background
    const characterTimer = setTimeout(() => {
      setCharacterOpacity(1);
    }, 800);

    // Show dialogue after character
    const dialogueTimer = setTimeout(() => {
      setShowDialogue(true);
    }, 1300);

    return () => {
      clearTimeout(backgroundTimer);
      clearTimeout(characterTimer);
      clearTimeout(dialogueTimer);
    };
  }, []);

  return (
    <div
      className="player-response-screen"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/assets/images/library-background-new.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: backgroundOpacity,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Character Sprite - Marina */}
      <div
        className="marina-character"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '55%',
          transform: 'translateX(-50%)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          opacity: characterOpacity,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        <img
          src="/assets/images/Character2.png"
          alt="Marina"
          style={{
            maxHeight: '90%',
            maxWidth: '90%',
            objectFit: 'contain',
            transform: 'scale(2.5)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <DialogueBox
          speaker="You"
          text={playerName}
          onNext={onNext}
          canAdvance={true}
        />
      )}
    </div>
  );
}
