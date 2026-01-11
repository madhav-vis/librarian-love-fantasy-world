import { useState, useEffect } from "react";

interface UploadScreenProps {
  onUpload: (bookId: string, title: string) => void;
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [secondBackgroundOpacity, setSecondBackgroundOpacity] = useState(0); // Start with first background visible
  const [containerOpacity, setContainerOpacity] = useState(0); // Start invisible

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

  // First show library-background-new.jpg, then fade to library-background-with-characters.jpg, then fade in container
  useEffect(() => {
    // Step 1: Wait 0.5 seconds, then fade to library-background-with-characters.jpg
    const switchBackgroundTimer = setTimeout(() => {
      setSecondBackgroundOpacity(1);
    }, 500);

    // Step 2: After background switches, fade in the upload container
    const fadeInContainerTimer = setTimeout(() => {
      setContainerOpacity(1);
    }, 1500); // 0.5s wait + 0.5s fade + 0.5s before container fades in

    return () => {
      clearTimeout(switchBackgroundTimer);
      clearTimeout(fadeInContainerTimer);
    };
  }, []);

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
    <div className="upload-screen" style={{ position: 'relative' }}>
      {/* First background - library-background-new.jpg */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/assets/images/library-background-new.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />
      {/* Second background - library-background-with-characters.jpg - fades in */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/assets/images/library-background-with-characters.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          opacity: secondBackgroundOpacity,
          transition: 'opacity 0.5s ease-in-out',
          zIndex: 1,
        }}
      />
      <div 
        className="upload-container"
        style={{
          opacity: containerOpacity,
          transition: 'opacity 0.5s ease-in-out',
          position: 'relative',
          zIndex: 2,
        }}
      >
          <h1>Librarian Love:<br />Fantasy Tycoon 3</h1>
          <p className="subtitle">What book are you reading?</p>

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
              {file ? file.name : "EPUB File Here!"}
            </label>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="upload-button"
              >
                {uploading ? "Uploading..." : "Start Game"}
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
        </div>
    </div>
  );
}