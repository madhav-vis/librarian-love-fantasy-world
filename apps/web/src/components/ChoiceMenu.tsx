interface Choice {
  id: string;
  text: string;
  isCorrect?: boolean;
  feedback?: string;
}

interface ChoiceMenuProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
}

export function ChoiceMenu({ choices, onSelect }: ChoiceMenuProps) {
  return (
    <div className="choice-menu">
      {choices.map((choice) => (
        <button
          key={choice.id}
          className="choice-button"
          onClick={() => onSelect(choice.id)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}