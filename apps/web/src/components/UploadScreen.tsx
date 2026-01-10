import { useState } from "react";

interface UploadScreenProps {
  onUpload: (bookId: string, title: string) => void;
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".epub")) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload an EPUB file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("epub", file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onUpload(data.bookId, data.title || "Untitled Book");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-screen">
      <div className="upload-container">
        <h1>EPUB Quiz Visual Novel</h1>
        <p className="subtitle">Upload an EPUB file to generate an interactive quiz experience</p>

        <div className="upload-area">
          <input
            type="file"
            id="epub-upload"
            accept=".epub"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input"
          />
          <label htmlFor="epub-upload" className="file-label">
            {file ? file.name : "Choose EPUB File"}
          </label>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-button"
            >
              {uploading ? "Uploading..." : "Select Chapter"}
            </button>
          )}

          {uploading && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">📚</span>
            <span>EPUB Upload</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎮</span>
            <span>RenPy Style</span>
          </div>
          <div className="feature">
            <span className="feature-icon">❓</span>
            <span>AI Quizzes</span>
          </div>
        </div>
      </div>
    </div>
  );
}