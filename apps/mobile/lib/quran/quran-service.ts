import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import {
  BASMALLAH,
  LineInfo,
  PageData,
  PageLine,
  SURAH_NAMES,
  TOTAL_PAGES,
} from './types';

// Assets - using require for asset bundling
const LAYOUT_DB_ASSET = require('@/assets/quran/digital-khatt-15-lines.db');
const WORDS_DB_ASSET = require('@/assets/quran/digital-khatt-v2.db');

class QuranService {
  private layoutDb: SQLite.SQLiteDatabase | null = null;
  private wordsDb: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  
  // Cached data
  private words: Map<number, string> = new Map(); // keyed by word ID
  private pageLines: Map<number, PageLine[]> = new Map(); // keyed by page number
  private quranText: string[][] = []; // [pageIndex][lineIndex] = text
  private lineInfoCache: Map<string, LineInfo> = new Map();

  private async loadDatabaseAsset(assetModule: number, dbName: string): Promise<string> {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    
    // Use new expo-file-system API
    const sqliteDir = new Directory(Paths.document, 'SQLite');
    const dbFile = new File(sqliteDir, dbName);
    
    // Ensure SQLite directory exists
    if (!sqliteDir.exists) {
      await sqliteDir.create();
    }
    
    // Always update the database to ensure we have the latest version
    if (asset.localUri) {
      // Delete existing database if it exists
      if (dbFile.exists) {
        await dbFile.delete();
      }
      // Copy asset to document directory
      const sourceFile = new File(asset.localUri);
      await sourceFile.copy(dbFile);
    }
    
    return dbName;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load database assets to document directory
      const layoutDbName = await this.loadDatabaseAsset(LAYOUT_DB_ASSET, 'digital-khatt-15-lines.db');
      const wordsDbName = await this.loadDatabaseAsset(WORDS_DB_ASSET, 'digital-khatt-v2.db');
      
      // Open databases
      this.layoutDb = await SQLite.openDatabaseAsync(layoutDbName);
      this.wordsDb = await SQLite.openDatabaseAsync(wordsDbName);

      // Load all data
      await this.loadWords();
      await this.loadPageLines();
      await this.buildQuranText();

      this.isInitialized = true;
      console.log('QuranService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize QuranService:', error);
      throw error;
    }
  }

  private async loadWords(): Promise<void> {
    if (!this.wordsDb) throw new Error('Words database not initialized');

    // Load words directly from the words table
    const rows = await this.wordsDb.getAllAsync<{
      id: number;
      location: string;
      surah: number;
      ayah: number;
      word: number;
      text: string;
    }>('SELECT id, location, surah, ayah, word, text FROM words ORDER BY id');

    for (const row of rows) {
      this.words.set(row.id, row.text);
    }

    console.log(`Loaded ${this.words.size} words from database`);
  }

  private async loadPageLines(): Promise<void> {
    if (!this.layoutDb) throw new Error('Layout database not initialized');

    const rows = await this.layoutDb.getAllAsync<{
      page_number: number;
      line_number: number;
      line_type: string;
      is_centered: number;
      first_word_id: number | null;
      last_word_id: number | null;
      surah_number: number | null;
    }>('SELECT * FROM pages ORDER BY page_number, line_number');

    for (const row of rows) {
      const pageNumber = row.page_number;
      if (!this.pageLines.has(pageNumber)) {
        this.pageLines.set(pageNumber, []);
      }

      this.pageLines.get(pageNumber)!.push({
        pageNumber: row.page_number,
        lineNumber: row.line_number,
        lineType: row.line_type as 'surah_name' | 'basmallah' | 'ayah',
        isCentered: row.is_centered === 1,
        firstWordId: row.first_word_id,
        lastWordId: row.last_word_id,
        surahNumber: row.surah_number,
      });
    }

    console.log(`Loaded page lines for ${this.pageLines.size} pages`);
  }

  private async buildQuranText(): Promise<void> {
    this.quranText = [];

    for (let pageNum = 1; pageNum <= TOTAL_PAGES; pageNum++) {
      const lines = this.pageLines.get(pageNum) || [];
      const pageText: string[] = [];

      for (const line of lines) {
        let lineText = '';

        if (line.lineType === 'surah_name') {
          // Get surah name
          lineText = line.surahNumber ? SURAH_NAMES[line.surahNumber] || '' : '';
        } else if (line.lineType === 'basmallah') {
          lineText = BASMALLAH;
        } else if (line.lineType === 'ayah' && line.firstWordId && line.lastWordId) {
          // Get words for this line from the words Map
          const lineWords: string[] = [];
          for (let wordId = line.firstWordId; wordId <= line.lastWordId; wordId++) {
            const wordText = this.words.get(wordId);
            if (wordText) {
              lineWords.push(wordText);
            } else {
              console.warn(`Missing word for ID ${wordId} on page ${pageNum}, line ${line.lineNumber}`);
            }
          }
          lineText = lineWords.join(' ');
        }

        pageText.push(lineText);
      }

      this.quranText.push(pageText);
    }

    console.log(`Built quran text for ${this.quranText.length} pages`);
  }

  // Public API
  getPageText(pageIndex: number): string[] {
    if (pageIndex < 0 || pageIndex >= this.quranText.length) {
      return [];
    }
    return this.quranText[pageIndex] ?? [];
  }

  getLineText(pageIndex: number, lineIndex: number): string {
    const page = this.getPageText(pageIndex);
    if (lineIndex < 0 || lineIndex >= page.length) {
      return '';
    }
    return page[lineIndex] ?? '';
  }

  getLineInfo(pageIndex: number, lineIndex: number): LineInfo {
    const cacheKey = `${pageIndex}-${lineIndex}`;
    const cached = this.lineInfoCache.get(cacheKey);
    if (cached) return cached;

    const lines = this.pageLines.get(pageIndex + 1) || [];
    const line = lines[lineIndex];

    let lineType: 0 | 1 | 2 = 0; // Default to normal ayah
    if (line?.lineType === 'surah_name') {
      lineType = 1;
    } else if (line?.lineType === 'basmallah') {
      lineType = 2;
    }

    // Calculate line width ratio for special pages (1-2) which have decorative layout
    let lineWidthRatio = 1;
    const pageNumber = pageIndex + 1;
    const lineNumber = lineIndex + 1;

    if (pageNumber <= 2) {
      // Special layout for first two pages (Al-Fatiha and Al-Baqarah opening)
      const ratio = 0.9;
      const widthMap: { [key: number]: number } = {
        2: ratio * 0.5,
        3: ratio * 0.7,
        4: ratio * 0.9,
        5: ratio,
        6: ratio * 0.9,
        7: ratio * 0.7,
        8: ratio * 0.4,
      };
      lineWidthRatio = widthMap[lineNumber] || 1;
    }

    // Last few pages also have special widths
    const specialLineWidths: { [key: string]: number } = {
      '600-9': 0.84,
      '602-5': 0.61,
      '602-15': 0.59,
      '603-10': 0.68,
      '604-4': 0.836,
      '604-9': 0.836,
      '604-14': 0.717,
      '604-15': 0.54,
    };
    const specialKey = `${pageNumber}-${lineNumber}`;
    if (specialLineWidths[specialKey]) {
      lineWidthRatio = specialLineWidths[specialKey];
    }

    const info: LineInfo = {
      lineType,
      lineWidthRatio,
      isCentered: line?.isCentered ?? false,
    };

    this.lineInfoCache.set(cacheKey, info);
    return info;
  }

  getPageData(pageIndex: number): PageData {
    const lines = this.getPageText(pageIndex);
    const lineInfos = lines.map((_, i) => this.getLineInfo(pageIndex, i));

    return {
      pageNumber: pageIndex + 1,
      lines,
      lineInfos,
    };
  }

  get totalPages(): number {
    return TOTAL_PAGES;
  }

  get nbPages(): number {
    return this.quranText.length;
  }

  // Get all lines as 2D array (for compatibility with reference implementation)
  get allText(): string[][] {
    return this.quranText;
  }
}

// Singleton instance
export const quranService = new QuranService();

