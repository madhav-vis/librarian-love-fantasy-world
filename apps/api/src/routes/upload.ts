import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { getBookMetadata as getBookMetadataFromParser, getBookChapters } from "../epub/parser";
import { logProgress, logComplete, logError } from "../utils/progress";

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = "./epub-uploads";
fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `epub-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/epub+zip" || file.originalname.endsWith(".epub")) {
      cb(null, true);
    } else {
      cb(new Error("Only EPUB files are allowed"));
    }
  },
});

router.post("/", upload.single("epub"), async (req, res) => {
  try {
    logProgress("EPUB Upload Request");
    
    if (!req.file) {
      logError("No EPUB file uploaded");
      return res.status(400).json({ error: "No EPUB file uploaded" });
    }

    logProgress(`  → File: ${req.file.originalname} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB)`);

    // Get page number (default to 1)
    const pageNumber = parseInt(req.body.pageNumber || "1");
    const clampedPageNumber = Math.max(1, pageNumber);
    logProgress(`  → Page number: ${clampedPageNumber}`);

    // Generate book ID
    const bookId = `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logProgress(`  → Book ID: ${bookId}`);

    // Store book info (in memory for now)
    books.set(bookId, {
      id: bookId,
      filename: req.file.originalname,
      filepath: req.file.path,
      pageNumber: clampedPageNumber,
      uploadedAt: new Date(),
    });

    logComplete("  ✓ File stored");

    // Respond immediately with default, calculate metadata asynchronously
    res.json({
      bookId,
      title: req.file.originalname.replace(".epub", ""),
      pageNumber: clampedPageNumber,
      totalPages: 1, // Will be updated when metadata is calculated
    });

    logComplete("  ✓ Upload response sent (metadata calculation in background)");

    // Calculate metadata asynchronously (non-blocking)
    logProgress("  → Starting metadata calculation in background...");
    getBookMetadataFromParser(bookId).then((metadata) => {
      logComplete(`  ✓ Metadata calculated: ${metadata.totalPages} pages`);
      const bookData = books.get(bookId);
      if (bookData) {
        bookData.totalPages = metadata.totalPages;
        books.set(bookId, bookData);
      }
    }).catch((error) => {
      logError("  ✗ Could not get book metadata", error);
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// In-memory storage (replace with database later)
export const books = new Map<string, any>();

export async function getBookMetadata(bookId: string) {
  return books.get(bookId) || null;
}

// Get chapters for a book
router.get("/:bookId/chapters", async (req, res) => {
  try {
    const { bookId } = req.params;
    logProgress(`Chapters Request - Book: ${bookId}`);
    
    const chapters = await getBookChapters(bookId);
    logComplete(`  ✓ Found ${chapters.length} chapters`);
    
    res.json({ chapters });
  } catch (error: any) {
    logError("Failed to get chapters", error);
    res.status(500).json({ 
      error: "Failed to get chapters",
      message: error.message 
    });
  }
});

export { router as uploadRouter };