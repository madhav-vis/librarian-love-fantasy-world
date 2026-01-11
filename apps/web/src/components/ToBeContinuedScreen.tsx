import { useEffect, useState } from "react";

export function ToBeContinuedScreen() {
  const [visibleLength, setVisibleLength] = useState(0);
  const text = "TO BE CONTINUED...";

  useEffect(() => {
    setVisibleLength(0);
    const interval = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev < text.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 100); // Animate character by character

    return () => clearInterval(interval);
  }, [text.length]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontFamily: '"EB Garamond", "Times New Roman", Times, serif',
          fontSize: '4rem',
          color: '#fff',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {text.slice(0, visibleLength)}
        {visibleLength < text.length && <span style={{ opacity: 0.5 }}>|</span>}
      </div>
    </div>
  );
}
