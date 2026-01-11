import { useState, useEffect } from "react";
import type { BookData, QuizNode } from "../types";

interface Chapter {
  id: string;
  title: string;
  index: number;
}

interface ChapterSelectionScreenProps {
  bookId: string;
  title: string;
  onChapterSelect: (chapterIndex: number) => void;
  onBack: () => void;
}

export function ChapterSelectionScreen({ 
  bookId, 
  title, 
  onChapterSelect, 
  onBack 
}: ChapterSelectionScreenProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/upload/${bookId}/chapters`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch chapters");
        }
        
        const data = await response.json();
        setChapters(data.chapters || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chapters");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [bookId]);

  if (loading) {
    return (
      <div className="upload-screen">
        <div className="upload-container">
          <h1>Loading Chapters...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upload-screen">
        <div className="upload-container">
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={onBack} className="upload-button">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="upload-screen"
      style={{
        backgroundImage: "url('/assets/images/book_image.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div 
        className="upload-container" 
        style={{ 
          color: '#000',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <h1 style={{ color: '#000' }}>{title}</h1>
        <p className="subtitle" style={{ color: '#000' }}>What chapter have you read up to?</p>
        
        <div className="chapters-list">
          {chapters.length === 0 ? (
            <p style={{ color: '#000' }}>No chapters found</p>
          ) : (
            chapters.map((chapter) => {
              // Remove the number prefix from chapter title (e.g., "1. Title" -> "Title")
              const cleanTitle = chapter.title.replace(/^\d+\.\s*/, '');
              return (
                <button
                  key={chapter.id}
                  onClick={() => onChapterSelect(chapter.index)}
                  className="chapter-button"
                  style={{ color: '#000' }}
                >
                  <span className="chapter-number" style={{ color: '#000' }}>{chapter.index + 1}</span>
                  <span className="chapter-title" style={{ color: '#000' }}>{cleanTitle}</span>
                </button>
              );
            })
          )}
        </div>
        
        <button onClick={onBack} className="upload-button back-button">
          Back
        </button>
      </div>
    </div>
  );
}
