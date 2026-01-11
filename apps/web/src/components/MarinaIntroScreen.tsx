import { useState, useEffect } from "react";
import { DialogueBox } from "./DialogueBox";

interface MarinaIntroScreenProps {
  playerName: string;
  bookTitle: string;
  onNext: () => void;
}

export function MarinaIntroScreen({ playerName, bookTitle, onNext }: MarinaIntroScreenProps) {
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [characterOpacity, setCharacterOpacity] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isPlayerSpeaking, setIsPlayerSpeaking] = useState(false);

  const marinaDialogues = [
    "Oh good, you're awake.",
    "I thought you were dead.",
    "My name is Marina, I've been trapped in this library for a week. I found you here yesterday. What's your name?",
  ];

  const getMarinaDialogue = (index: number) => {
    if (index === marinaDialogues.length) {
      // Book dialogue with orange book title
      return (
        <>
          I think there are useful clues in the books. Here,{" "}
          <span style={{ color: "#FF9800" }}>{bookTitle}</span>. This should have useful information.
        </>
      );
    }
    if (index === marinaDialogues.length + 1) {
      return "Come back to me after finding some clues in this book.";
    }
    return marinaDialogues[index];
  };

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

  const handleDialogueNext = () => {
    if (isPlayerSpeaking) {
      // After player speaks, show Marina's book dialogue
      setIsPlayerSpeaking(false);
      setDialogueIndex(marinaDialogues.length); // This will be the book dialogue
    } else if (dialogueIndex < marinaDialogues.length - 1) {
      // Move to next Marina dialogue (0, 1, 2)
      setDialogueIndex(dialogueIndex + 1);
    } else if (dialogueIndex === marinaDialogues.length - 1) {
      // After last Marina dialogue (asking for name), switch to player speaking
      setIsPlayerSpeaking(true);
    } else if (dialogueIndex === marinaDialogues.length) {
      // After Marina's book dialogue, show the "come back" dialogue
      setDialogueIndex(marinaDialogues.length + 1);
    } else if (dialogueIndex === marinaDialogues.length + 1) {
      // After Marina's "come back" dialogue, move to next scene
      onNext();
    }
  };

  return (
    <div
      className="marina-intro-screen"
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

      {/* Character Sprite */}
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
          src={(dialogueIndex === marinaDialogues.length || dialogueIndex === marinaDialogues.length + 1) && !isPlayerSpeaking ? "/assets/images/Maina_Exclaim.png" : "/assets/images/Character2.png"}
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
          speaker={isPlayerSpeaking ? "You" : "Marina"}
          text={
            isPlayerSpeaking
              ? `My name is ${playerName}`
              : getMarinaDialogue(dialogueIndex)
          }
          onNext={handleDialogueNext}
          canAdvance={true}
        />
      )}
    </div>
  );
}
