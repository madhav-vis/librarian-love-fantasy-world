import { DialogueBox } from "./DialogueBox";

interface IntroDialogueScreenProps {
  onNext: () => void;
}

export function IntroDialogueScreen({ onNext }: IntroDialogueScreenProps) {
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
      <DialogueBox
        speaker=""
        text="What?....Where am I?"
        onNext={onNext}
        canAdvance={true}
      />
    </div>
  );
}
