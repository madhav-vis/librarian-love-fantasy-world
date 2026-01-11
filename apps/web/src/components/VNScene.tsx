import { useEffect, useState } from "react";
import type { BookData, QuizNode } from "../types";
import { DialogueBox } from "./DialogueBox";
import { ChoiceMenu } from "./ChoiceMenu";
import { CharacterSprite } from "./CharacterSprite";

interface VNSceneProps {
  bookData: BookData;
  currentNode: QuizNode | null;
  onNodeChange: (node: QuizNode | null) => void;
  onGameComplete?: () => void;
}

export function VNScene({ bookData, currentNode, onNodeChange, onGameComplete }: VNSceneProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gems, setGems] = useState(bookData.gems || 0);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0); // Start at 100% transparency (opacity: 0)
  const [vincentSprite, setVincentSprite] = useState("Vincent_Battle.png");

  useEffect(() => {
    if (bookData.currentNode) {
      onNodeChange(bookData.currentNode);
    }
    if (bookData.gems !== undefined) {
      setGems(bookData.gems);
    }
    // Initialize question index if questions array exists
    if (currentNode?.questions && currentNode.currentQuestionIndex !== undefined) {
      setCurrentQuestionIndex(currentNode.currentQuestionIndex);
    }
    // Reset sprite when question changes
    setVincentSprite("Vincent_Battle.png");
  }, [bookData, currentNode]);

  // Fade in background after 0.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setBackgroundOpacity(1); // Fade to 0% transparency (fully visible)
    }, 500); // 0.5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  // Support both old format (single question) and new format (multiple questions)
  const hasMultipleQuestions = currentNode?.questions && currentNode.questions.length > 0;
  const currentQuestion = hasMultipleQuestions && currentNode.questions
    ? currentNode.questions[currentQuestionIndex]
    : null;
  const currentChoices = hasMultipleQuestions 
    ? currentQuestion?.choices 
    : currentNode?.choices;

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowFeedback(true);
    
    // Change sprite based on whether answer is correct or wrong
    const choiceData = currentChoices?.find((c) => c.id === choiceId);
    if (choiceData) {
      if (choiceData.isCorrect) {
        setVincentSprite("Vincent_BattleLove.png");
      } else {
        setVincentSprite("Vincent_BattleAngry.png");
      }
    }
  };

  const handleNext = () => {
    if (hasMultipleQuestions) {
      // Move to next question or finish
      const selectedChoiceData = currentQuestion?.choices.find(
        (c) => c.id === selectedChoice
      );
      
      if (selectedChoiceData?.isCorrect) {
        // Correct answer - show success dialogue
        setShowFeedback(true);
      }
      
      // Move to next question
      if (currentNode.questions && currentQuestionIndex < currentNode.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedChoice(null);
        setShowFeedback(false);
        setVincentSprite("Vincent_Battle.png"); // Reset to default sprite for next question
      } else {
        // All questions completed - end the game
        if (onGameComplete) {
          onGameComplete();
        }
      }
    } else {
      // Old format - load next node
      if (currentNode?.next) {
        fetch(`/api/quiz/${bookData.bookId}?nodeId=${currentNode.next}`)
          .then((res) => res.json())
          .then((node) => {
            onNodeChange(node);
            setSelectedChoice(null);
            setShowFeedback(false);
          });
      }
    }
  };

  if (!currentNode) {
    return <div className="loading">Loading quiz...</div>;
  }

  const selectedChoiceData = currentChoices?.find(
    (c) => c.id === selectedChoice
  );

  // Determine what text to show
  let displayText = "";
  if (hasMultipleQuestions) {
    if (showFeedback && selectedChoiceData) {
      // Show correct/wrong dialogue
      displayText = selectedChoiceData.isCorrect 
        ? "Correct! Well done!"
        : "Wrong! Let's continue to the next question.";
    } else {
      // Show current question
      displayText = currentQuestion?.question || "";
    }
  } else {
    // Legacy format
    displayText = showFeedback && selectedChoiceData?.feedback
      ? selectedChoiceData.feedback
      : currentNode.text || "";
  }
  
  // Show summary first if it's the first question and no feedback
  if (hasMultipleQuestions && currentQuestionIndex === 0 && !showFeedback && currentNode.summary) {
    // For now, show question immediately - could add summary screen later
  }

  return (
    <div className="vn-scene">
      {/* Background */}
      <div
        className="vn-background"
        style={{
          backgroundImage: currentNode.background
            ? `url(${currentNode.background})`
            : `url(/assets/images/Vincent_Library.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: backgroundOpacity,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        {/* Character Sprites */}
        {currentNode.character && (
          <CharacterSprite character={currentNode.character} />
        )}
        
        {/* Vincent Battle Sprite */}
        <div
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
          }}
        >
          <img
            src={`/assets/images/${vincentSprite}`}
            alt="Vincent"
            style={{
              maxHeight: '90%',
              maxWidth: '90%',
              objectFit: 'contain',
              transform: 'scale(2.5)',
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>

      {/* Dialogue Box (RenPy style at bottom) */}
      <DialogueBox
        speaker={currentNode.speaker || "Vincent"}
        text={displayText}
        onNext={handleNext}
        canAdvance={showFeedback || (!currentChoices && !hasMultipleQuestions)}
      />

      {/* Choice Menu */}
      {currentChoices && !showFeedback && (
        <ChoiceMenu
          choices={currentChoices}
          onSelect={handleChoiceSelect}
        />
      )}

      {/* Progress Indicator */}
      <div className="progress-indicator">
        <span>{bookData.title}</span>
        <span>Chapter: {bookData.progress}</span>
        {hasMultipleQuestions && currentNode.questions && (
          <span>Question: {currentQuestionIndex + 1} / {currentNode.questions.length}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/assets/images/Gem.png"
            alt="Gem"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
            }}
          />
          <span>Gems: {gems}</span>
        </div>
      </div>
    </div>
  );
}