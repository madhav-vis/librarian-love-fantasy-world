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
    <div className="upload-screen">
      <div className="upload-container">
        <h1>{title}</h1>
        <p className="subtitle">Select a chapter to start</p>
        
        <div className="chapters-list">
          {chapters.length === 0 ? (
            <p>No chapters found</p>
          ) : (
            chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => onChapterSelect(chapter.index)}
                className="chapter-button"
              >
                <span className="chapter-number">{chapter.index + 1}</span>
                <span className="chapter-title">{chapter.title}</span>
              </button>
            ))
          )}
        </div>
        
        <button onClick={onBack} className="upload-button back-button">
          Back
        </button>
      </div>
    </div>
  );
}
