import { useState, useEffect } from "react";
import { DialogueBox } from "./DialogueBox";

interface MarinaCluesScreenProps {
  gems: number;
  onNext: () => void;
}

export function MarinaCluesScreen({ gems, onNext }: MarinaCluesScreenProps) {
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [characterOpacity, setCharacterOpacity] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState("library-background-new.jpg");
  const [isPlayerSpeaking, setIsPlayerSpeaking] = useState(false);
  const [showVincent, setShowVincent] = useState(false);
  const [vincentOpacity, setVincentOpacity] = useState(0);

  useEffect(() => {
    // Fade in library background first
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
    if (dialogueIndex === 0) {
      // After first dialogue, transition to Gem.png background
      setBackgroundOpacity(0);
      setTimeout(() => {
        setBackgroundImage("Gem.png");
        setBackgroundOpacity(1);
        setDialogueIndex(1);
      }, 500); // Fade out duration
    } else if (dialogueIndex === 1) {
      // After second dialogue, transition back to library background with Marina
      setBackgroundOpacity(0);
      setTimeout(() => {
        setBackgroundImage("library-background-new.jpg");
        setBackgroundOpacity(1);
        setDialogueIndex(2);
        setIsPlayerSpeaking(true);
      }, 500); // Fade out duration
    } else if (dialogueIndex === 2) {
      // After third dialogue, transition to Vincent library (fade out Marina with background)
      setShowDialogue(false);
      setBackgroundOpacity(0);
      setCharacterOpacity(0); // Fade out Marina at the same time as background
      setTimeout(() => {
        setBackgroundImage("Vincent_Library.jpg");
        setBackgroundOpacity(1);
        setIsPlayerSpeaking(false);
        // After 0.5 second pause, show ??? dialogue
        setTimeout(() => {
          setDialogueIndex(3);
          setShowDialogue(true);
        }, 500);
      }, 500); // Fade out duration
    } else if (dialogueIndex === 3) {
      // After ??? dialogue, fade in Character3 and transition to Vincent's dialogue
      setShowVincent(true);
      setVincentOpacity(1);
      setDialogueIndex(4);
    } else if (dialogueIndex === 4) {
      // After Vincent's first dialogue, show his second dialogue
      setDialogueIndex(5);
    } else if (dialogueIndex === 5) {
      // After Vincent's second dialogue, move to next scene (loading screen)
      onNext();
    }
  };

  const dialogues = [
    "You read some chapters? I found some clues.",
    "I found these gems, what does your clue say?",
    "My clue says to go to the other room of the library.",
    "Who are you?",
    "Guys I'm kinda lost, my name is Vincent.",
    "I'm trying to leave too. I'll join you guys if you can answer these questions.",
  ];

  return (
    <div
      className="marina-clues-screen"
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
          backgroundImage: `url('/assets/images/${backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: backgroundOpacity,
          transition: 'opacity 0.5s ease-in-out',
        }}
      />

      {/* Marina Character Sprite - show on first and third dialogue only */}
      {(dialogueIndex === 0 || dialogueIndex === 2) && (
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
            src="/assets/images/Marina_OpenMouth.png"
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
      )}

      {/* Vincent Character Sprite - show on fourth, fifth, and sixth dialogue */}
      {showVincent && (dialogueIndex === 3 || dialogueIndex === 4 || dialogueIndex === 5) && (
        <div
          className="vincent-character"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '35%',
            transform: 'translateX(-50%)',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            opacity: vincentOpacity,
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
      )}

      {/* Gem Counter - only show after Marina introduces gems (dialogueIndex >= 1) */}
      {dialogueIndex >= 1 && (
        <div
          className="progress-indicator"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            zIndex: 11,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <img
            src="/assets/images/Gem.png"
            alt="Gem"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Gems: {gems}</span>
        </div>
      )}

      {/* Dialogue Box */}
      {showDialogue && (
        <DialogueBox
          speaker={
            isPlayerSpeaking ? "You" : 
            dialogueIndex === 3 ? "???" :
            (dialogueIndex === 4 || dialogueIndex === 5) ? "Vincent" : 
            "Marina"
          }
          text={dialogues[dialogueIndex]}
          onNext={handleDialogueNext}
          canAdvance={true}
        />
      )}
    </div>
  );
}
