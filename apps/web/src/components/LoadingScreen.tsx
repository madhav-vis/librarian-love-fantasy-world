import { useEffect, useState } from "react";
import { DialogueBox } from "./DialogueBox";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress - start at 10%, animate to 90%, then wait for actual completion
    setProgress(10);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return Math.min(prev + Math.random() * 25, 90);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="loading-screen"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundImage: "url('/assets/images/QuestionMarkBackground.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div 
        className="loading-container"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '600px',
          background: 'transparent',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#fff', marginBottom: '1rem' }}>{message}</h1>
        <div 
          className="loading-progress-bar"
          style={{
            width: '100%',
            height: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            className="loading-progress-fill"
            style={{ 
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
      
      {/* Narrator Dialogue Box */}
      <DialogueBox
        speaker="Narrator"
        text="Tip: Vincent knows magic."
        onNext={() => {}}
        canAdvance={false}
      />
    </div>
  );
}
