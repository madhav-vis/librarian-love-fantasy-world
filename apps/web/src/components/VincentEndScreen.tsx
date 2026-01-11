import { useState, useEffect } from "react";
import { DialogueBox } from "./DialogueBox";

interface VincentEndScreenProps {
  onNext: () => void;
}

export function VincentEndScreen({ onNext }: VincentEndScreenProps) {
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [characterOpacity, setCharacterOpacity] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);

  useEffect(() => {
    // Fade in library background
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
          backgroundImage: "url('/assets/images/Vincent_Library.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: backgroundOpacity,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Character3 Sprite */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
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
          src="/assets/images/Character3.png"
          alt="Vincent"
          style={{
            maxHeight: '90%',
            maxWidth: '90%',
            objectFit: 'contain',
            transform: 'scale(1.8)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <DialogueBox
          speaker="Vincent"
          text="You guys are actually pretty smart, I'll join you."
          onNext={onNext}
          canAdvance={true}
        />
      )}
    </div>
  );
}
