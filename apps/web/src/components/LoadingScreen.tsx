import { useEffect, useState } from "react";

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
    <div className="loading-screen">
      <div className="loading-container">
        <h1>{message}</h1>
        <div className="loading-progress-bar">
          <div
            className="loading-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
