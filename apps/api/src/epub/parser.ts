import EPub from "epub";
import { convert as htmlToText } from "html-to-text";
import fs from "fs/promises";
import path from "path";
import { logProgress, logStep, logComplete, logError, ProgressBar } from "../utils/progress";

// In-memory cache for loaded books
const bookCache = new Map<string, any>();

// Helper to filter real chapters (titles must start with "number. ")
function getRealChapters(flow: any[]): any[] {
  return flow.filter((chapter: any) => {
    const title = chapter.title || '';
    return /^\d+\.\s/.test(title);
  });
}

// Helper to get chapter text using getChapterRaw + htmlToText
async function getChapterText(book: any, chapterId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    book.getChapterRaw(chapterId, (error: Error | null, html: string) => {
      if (error) {
        reject(error);
      } else if (!html) {
        resolve("");
      } else {
        try {
          const text = htmlToText(html);
          resolve(text || "");
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

// Helper to get book instance with proper Node.js configuration
async function getBookInstance(bookId: string, filepath: string): Promise<any> {
  if (bookCache.has(bookId)) {
    logComplete(`Using cached book instance for ${bookId}`);
    return bookCache.get(bookId)!;
  }

  logProgress(`Loading book instance: ${path.basename(filepath)}`);
  
  try {
    logProgress("  → Creating Epub instance (Node.js native)...");
    
    // Create book instance - epub package uses callback-based API
    const book = new EPub(filepath);
    logComplete("  ✓ Epub instance created");
    
    // Wait for book to be parsed
    logProgress("  → Parsing EPUB structure...");
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("EPUB parsing timeout after 30 seconds"));
      }, 30000);
      
      book.on("end", () => {
        clearTimeout(timeout);
        logComplete(`  ✓ EPUB parsed (${book.flow.length} chapters found)`);
        
        // Print only real chapters (with number. title format)
        const realChapters = getRealChapters(book.flow || []);
        console.log(`\nREAL CHAPTERS (${realChapters.length}):`);
        realChapters.forEach((chapter: any, i: number) => {
          console.log(`${i}: ${chapter.id || 'N/A'} - ${chapter.title || 'N/A'}`);
        });
        console.log("");
        
        resolve();
      });
      
      book.on("error", (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
      
      book.parse();
    });
    
    bookCache.set(bookId, book);
    return book;
  } catch (error: any) {
    logError(`Failed to load book ${bookId}`, error);
    throw new Error(`Failed to load EPUB: ${error.message}`);
  }
}

// Helper to get book metadata including total pages
export async function getBookMetadata(bookId: string): Promise<{
  totalPages: number;
  spineItems: number;
  hasPageList: boolean;
}> {
  const { books } = await import("../routes/upload");
  const bookData = books.get(bookId);
  
  if (!bookData || !bookData.filepath) {
    throw new Error(`Book ${bookId} not found`);
  }

  try {
    await fs.access(bookData.filepath);
  } catch {
    throw new Error(`EPUB file not found: ${bookData.filepath}`);
  }

  const book = await getBookInstance(bookId, bookData.filepath);
  
  logProgress("Calculating total pages...");
  let totalPages = 0;
  let hasPageList = false;
  
  // Filter to only real chapters (titles starting with "number. ")
  const flow = getRealChapters(book.flow || []);
  logProgress(`  → Found ${flow.length} real chapters`);
  
  if (flow.length > 0) {
    // Sample a few chapters to estimate content length
    const sampleSize = Math.min(5, flow.length);
    let totalChars = 0;
    const progressBar = new ProgressBar(sampleSize, "    Sampling chapters");
    
    for (let i = 0; i < sampleSize; i++) {
      try {
        progressBar.update(i + 1, `    Sampling chapter ${i + 1}/${sampleSize}`);
        const chapterText = await getChapterText(book, flow[i].id);
        totalChars += chapterText.length;
      } catch (e) {
        progressBar.increment();
        // Skip if can't load
      }
    }
    progressBar.finish();
    
    // Estimate: ~2500 characters per page
    if (sampleSize > 0) {
      const avgCharsPerChapter = totalChars / sampleSize;
      const estimatedPagesPerChapter = Math.ceil(avgCharsPerChapter / 2500);
      totalPages = flow.length * Math.max(estimatedPagesPerChapter, 1);
      logComplete(`  ✓ Estimated ${totalPages} pages from ${flow.length} chapters`);
    }
  }
  
  return {
    totalPages: Math.max(totalPages, 1),
    spineItems: flow.length,
    hasPageList: false,
  };
}

export async function getBookContent(
  bookId: string,
  progressPercent?: number
): Promise<string> {
  const { books } = await import("../routes/upload");
  const bookData = books.get(bookId);
  
  if (!bookData || !bookData.filepath) {
    throw new Error(`Book ${bookId} not found`);
  }

  const progress = progressPercent !== undefined 
    ? progressPercent 
    : (bookData.progress || 0);

  const book = await getBookInstance(bookId, bookData.filepath);
  
  // Filter to only real chapters
  const flow = getRealChapters(book.flow || []);
  
  if (flow.length === 0) {
    throw new Error("No content found in EPUB");
  }

  // Calculate which flow item to use based on progress
  const targetIndex = Math.floor((progress / 100) * (flow.length - 1));
  const targetItem = flow[Math.min(targetIndex, flow.length - 1)];
  
  logProgress(`  → Loading chapter ${targetIndex + 1}/${flow.length} (${targetItem.title || targetItem.id})...`);
  
  // Get chapter content using getChapterRaw + htmlToText
  const textContent = await getChapterText(book, targetItem.id);
  
  logProgress(`  → Extracted chapter text (${textContent.length} characters)`);
  
  if (!textContent || textContent.trim().length === 0) {
    logError("  ✗ Chapter text is empty!");
    return "No text content found in this section.";
  }
  
  if (textContent.length < 10) {
    logError(`  ✗ Text extraction failed - only ${textContent.length} characters after processing`);
    return "No text content found in this section.";
  }
  
  logComplete(`  ✓ Content extracted (${textContent.length} characters)`);
  return textContent;
}

export async function getBookContentByChapterIndex(bookId: string, chapterIndex: number): Promise<string> {
  const { books } = await import("../routes/upload");
  const bookData = books.get(bookId);
  
  if (!bookData || !bookData.filepath) {
    throw new Error(`Book ${bookId} not found`);
  }

  const book = await getBookInstance(bookId, bookData.filepath);
  const flow = getRealChapters(book.flow || []);
  
  if (flow.length === 0) {
    throw new Error("No content found in EPUB");
  }

  if (chapterIndex < 0 || chapterIndex >= flow.length) {
    throw new Error(`Invalid chapter index: ${chapterIndex} (valid range: 0-${flow.length - 1})`);
  }

  // Get content from chapters 0 through chapterIndex (inclusive)
  // So chapterIndex 15 means chapters 1-16 (1-based)
  logProgress(`  → Loading chapters 1 through ${chapterIndex + 1}...`);
  
  const chaptersToLoad = chapterIndex + 1; // +1 because we want chapters 0 to chapterIndex (inclusive)
  let combinedText = "";
  
  for (let i = 0; i < chaptersToLoad; i++) {
    const targetItem = flow[i];
    logProgress(`  → Loading chapter ${i + 1}/${chaptersToLoad} (${targetItem.title || targetItem.id})...`);
    
    try {
      const chapterText = await getChapterText(book, targetItem.id);
      if (chapterText && chapterText.trim().length > 0) {
        combinedText += chapterText + "\n\n";
      }
    } catch (error) {
      logError(`  ✗ Failed to load chapter ${i + 1}`, error);
    }
  }
  
  logProgress(`  → Extracted text from ${chaptersToLoad} chapters (${combinedText.length} characters)`);
  
  if (!combinedText || combinedText.trim().length === 0) {
    logError("  ✗ No text content found!");
    return "No text content found in these chapters.";
  }
  
  if (combinedText.length < 10) {
    logError(`  ✗ Text extraction failed - only ${combinedText.length} characters after processing`);
    return "No text content found in these chapters.";
  }
  
  logComplete(`  ✓ Content extracted (${combinedText.length} characters from chapters 1-${chaptersToLoad})`);
  return combinedText.trim();
}

export async function getBookContentByCFI(bookId: string, cfi: string): Promise<string> {
  // CFI not directly supported by epub package, use progress-based instead
  const { books } = await import("../routes/upload");
  const bookData = books.get(bookId);
  const progress = bookData?.progress || 0;
  return getBookContent(bookId, progress);
}

export async function getBookContentByPageNumber(bookId: string, pageNumber: number): Promise<string> {
  logProgress(`Extracting content for page ${pageNumber}...`);
  
  const { books } = await import("../routes/upload");
  const bookData = books.get(bookId);
  
  if (!bookData || !bookData.filepath) {
    throw new Error(`Book ${bookId} not found`);
  }

  try {
    await fs.access(bookData.filepath);
  } catch {
    throw new Error(`EPUB file not found: ${bookData.filepath}`);
  }

  logProgress("  → Loading book instance...");
  const book = await getBookInstance(bookId, bookData.filepath);
  logComplete("  ✓ Book instance loaded");

  try {
    // Filter to only real chapters
    const flow = getRealChapters(book.flow || []);
    
    if (flow.length === 0) {
      throw new Error("No content found in EPUB");
    }

    // Estimate total pages from all chapters
    logProgress("  → Estimating chapter sizes for page calculation...");
    let totalChars = 0;
    const chapterLengths: number[] = [];
    const sampleSize = Math.min(10, flow.length);
    
    for (let i = 0; i < sampleSize; i++) {
      try {
        const chapterText = await getChapterText(book, flow[i].id);
        const length = chapterText.length;
        chapterLengths.push(length);
        totalChars += length;
      } catch (e) {
        chapterLengths.push(0);
      }
    }
    
    // Estimate average characters per page (~2500 chars/page)
    const avgCharsPerPage = 2500;
    const avgCharsPerChapter = sampleSize > 0 ? totalChars / sampleSize : 2500;
    const estimatedTotalPages = Math.ceil((avgCharsPerChapter * flow.length) / avgCharsPerPage);
    
    logProgress(`  → Estimated ${estimatedTotalPages} total pages`);
    
    // Find which chapter contains the target page
    const targetPageRatio = Math.min(pageNumber / Math.max(estimatedTotalPages, 1), 1);
    const targetIndex = Math.floor(targetPageRatio * (flow.length - 1));
    const targetItem = flow[Math.min(targetIndex, flow.length - 1)];
    
    logProgress(`  → Loading chapter ${targetIndex + 1}/${flow.length} (estimated for page ${pageNumber})...`);

    // Get chapter content using getChapterRaw + htmlToText
    const textContent = await getChapterText(book, targetItem.id);
    
    logProgress(`  → Extracted chapter text (${textContent.length} characters)`);
    
    if (!textContent || textContent.trim().length === 0) {
      logError("  ✗ Chapter text is empty!");
      return "No text content found in this section.";
    }
    
    if (textContent.length < 10) {
      logError(`  ✗ Text extraction failed - only ${textContent.length} characters after processing`);
      return "No text content found in this section.";
    }
    
    logComplete(`  ✓ Content extracted (${textContent.length} characters)`);
    return textContent;
    
  } catch (error: any) {
    logError(`Error loading page ${pageNumber}`, error);
    // Fallback to first real chapter
    const flow = getRealChapters(book.flow || []);
    if (flow.length > 0) {
      const chapterText = await getChapterText(book, flow[0].id);
      return chapterText.trim();
    }
    throw new Error(`Failed to load page ${pageNumber}`);
  }
}

export async function getBookChapters(bookId: string): Promise<Array<{ id: string; title: string; index: number }>> {
  const { books } = await import("../routes/upload");
  const bookData = books.get(bookId);
  
  if (!bookData || !bookData.filepath) {
    throw new Error(`Book ${bookId} not found`);
  }

  try {
    await fs.access(bookData.filepath);
  } catch {
    throw new Error(`EPUB file not found: ${bookData.filepath}`);
  }

  const book = await getBookInstance(bookId, bookData.filepath);
  const flow = getRealChapters(book.flow || []);
  
  return flow.map((chapter: any, index: number) => ({
    id: chapter.id,
    title: chapter.title || 'Untitled',
    index: index,
  }));
}

export function segmentText(text: string, maxLength: number = 1000): string[] {
  // Split text into segments for quiz generation
  const segments: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentSegment = "";
  for (const sentence of sentences) {
    if (currentSegment.length + sentence.length > maxLength && currentSegment) {
      segments.push(currentSegment.trim());
      currentSegment = sentence;
    } else {
      currentSegment += (currentSegment ? " " : "") + sentence;
    }
  }
  
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim());
  }
  
  return segments.length > 0 ? segments : [text];
}
