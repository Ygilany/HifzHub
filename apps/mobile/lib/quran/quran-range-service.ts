import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { SURAH_NAMES, TOTAL_PAGES } from './types';

// Assets - using require for asset bundling
const WORDS_DB_ASSET = require('@/assets/quran/digital-khatt-v2.db');
const LAYOUT_DB_ASSET = require('@/assets/quran/digital-khatt-15-lines.db');

export interface SurahInfo {
  surah: number;
  name: string;
  firstAyah: number;
  lastAyah: number;
  ayahCount: number;
}

export interface AyahLocation {
  surah: number;
  ayah: number;
  page?: number;
}

export interface PageRange {
  startPage: number;
  endPage: number;
}

export interface SurahRange {
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

class QuranRangeService {
  private wordsDb: SQLite.SQLiteDatabase | null = null;
  private layoutDb: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  // Cached data
  private surahInfoCache: Map<number, SurahInfo> = new Map();
  private ayahToPageCache: Map<string, number> = new Map(); // key: "surah:ayah"
  private pageToAyahCache: Map<number, { start: AyahLocation; end: AyahLocation }> = new Map();

  private async loadDatabaseAsset(assetModule: number, dbName: string): Promise<string> {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();

    const sqliteDir = new Directory(Paths.document, 'SQLite');
    const dbFile = new File(sqliteDir, dbName);

    if (!sqliteDir.exists) {
      await sqliteDir.create();
    }

    if (asset.localUri) {
      if (dbFile.exists) {
        await dbFile.delete();
      }
      const sourceFile = new File(asset.localUri);
      await sourceFile.copy(dbFile);
    }

    return dbName;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const wordsDbName = await this.loadDatabaseAsset(WORDS_DB_ASSET, 'digital-khatt-v2.db');
      const layoutDbName = await this.loadDatabaseAsset(LAYOUT_DB_ASSET, 'digital-khatt-15-lines.db');

      this.wordsDb = await SQLite.openDatabaseAsync(wordsDbName);
      this.layoutDb = await SQLite.openDatabaseAsync(layoutDbName);

      await this.loadSurahInfo();
      await this.loadPageMappings();

      this.isInitialized = true;
      console.log('QuranRangeService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize QuranRangeService:', error);
      throw error;
    }
  }

  private async loadSurahInfo(): Promise<void> {
    if (!this.wordsDb) throw new Error('Words database not initialized');

    // Get surah info: first and last ayah for each surah
    const rows = await this.wordsDb.getAllAsync<{
      surah: number;
      ayah: number;
    }>('SELECT DISTINCT surah, ayah FROM words ORDER BY surah, ayah');

    const surahMap = new Map<number, { firstAyah: number; lastAyah: number }>();

    for (const row of rows) {
      if (!surahMap.has(row.surah)) {
        surahMap.set(row.surah, { firstAyah: row.ayah, lastAyah: row.ayah });
      } else {
        const info = surahMap.get(row.surah)!;
        info.lastAyah = Math.max(info.lastAyah, row.ayah);
        info.firstAyah = Math.min(info.firstAyah, row.ayah);
      }
    }

    // Build surah info cache
    for (const [surah, { firstAyah, lastAyah }] of surahMap.entries()) {
      this.surahInfoCache.set(surah, {
        surah,
        name: SURAH_NAMES[surah] || `Surah ${surah}`,
        firstAyah,
        lastAyah,
        ayahCount: lastAyah - firstAyah + 1,
      });
    }
  }

  private async loadPageMappings(): Promise<void> {
    if (!this.wordsDb || !this.layoutDb) throw new Error('Databases not initialized');

    // Get all pages with their word ranges
    const pageRows = await this.layoutDb.getAllAsync<{
      page_number: number;
      first_word_id: number | null;
      last_word_id: number | null;
    }>('SELECT page_number, first_word_id, last_word_id FROM pages WHERE first_word_id IS NOT NULL AND last_word_id IS NOT NULL ORDER BY page_number');

    // Group by page to get min/max word IDs per page
    const pageMap = new Map<number, { minWordId: number; maxWordId: number }>();
    for (const row of pageRows) {
      if (!row.first_word_id || !row.last_word_id) continue;
      const existing = pageMap.get(row.page_number);
      if (!existing) {
        pageMap.set(row.page_number, {
          minWordId: row.first_word_id,
          maxWordId: row.last_word_id,
        });
      } else {
        existing.minWordId = Math.min(existing.minWordId, row.first_word_id);
        existing.maxWordId = Math.max(existing.maxWordId, row.last_word_id);
      }
    }

    // For each page, find the surah:ayah range
    for (const [pageNumber, { minWordId, maxWordId }] of pageMap.entries()) {
      // Get first word location
      const firstWordRows = await this.wordsDb.getAllAsync<{
        surah: number;
        ayah: number;
      }>('SELECT surah, ayah FROM words WHERE id = ? LIMIT 1', [minWordId]);
      const firstWord = firstWordRows[0] || null;

      // Get last word location
      const lastWordRows = await this.wordsDb.getAllAsync<{
        surah: number;
        ayah: number;
      }>('SELECT surah, ayah FROM words WHERE id = ? LIMIT 1', [maxWordId]);
      const lastWord = lastWordRows[0] || null;

      if (firstWord && lastWord) {
        const start: AyahLocation = { surah: firstWord.surah, ayah: firstWord.ayah, page: pageNumber };
        const end: AyahLocation = { surah: lastWord.surah, ayah: lastWord.ayah, page: pageNumber };

        this.pageToAyahCache.set(pageNumber, { start, end });

        // Cache ayah to page mapping
        this.ayahToPageCache.set(`${firstWord.surah}:${firstWord.ayah}`, pageNumber);
        this.ayahToPageCache.set(`${lastWord.surah}:${lastWord.ayah}`, pageNumber);
      }
    }

    // Fill in gaps by querying all words and mapping to pages
    const allWords = await this.wordsDb.getAllAsync<{
      id: number;
      surah: number;
      ayah: number;
    }>('SELECT id, surah, ayah FROM words ORDER BY id');

    // Find which page each word belongs to
    for (const word of allWords) {
      const key = `${word.surah}:${word.ayah}`;
      if (this.ayahToPageCache.has(key)) continue;

      // Find page by word ID
      for (const [pageNumber, { minWordId, maxWordId }] of pageMap.entries()) {
        if (word.id >= minWordId && word.id <= maxWordId) {
          this.ayahToPageCache.set(key, pageNumber);
          break;
        }
      }
    }
  }

  // Get all surahs with their info
  getAllSurahs(): SurahInfo[] {
    const surahs: SurahInfo[] = [];
    for (let i = 1; i <= 114; i++) {
      const info = this.surahInfoCache.get(i);
      if (info) {
        surahs.push(info);
      }
    }
    return surahs;
  }

  // Get surah info
  getSurahInfo(surah: number): SurahInfo | null {
    return this.surahInfoCache.get(surah) || null;
  }

  // Convert ayah location to page number
  async getPageForAyah(surah: number, ayah: number): Promise<number | null> {
    await this.ensureInitialized();
    const key = `${surah}:${ayah}`;
    return this.ayahToPageCache.get(key) || null;
  }

  // Convert page number to ayah range
  getAyahRangeForPage(page: number): { start: AyahLocation; end: AyahLocation } | null {
    return this.pageToAyahCache.get(page) || null;
  }

  // Convert page range to surah/ayah range
  async pageRangeToSurahRange(startPage: number, endPage: number): Promise<SurahRange | null> {
    await this.ensureInitialized();
    const startRange = this.getAyahRangeForPage(startPage);
    const endRange = this.getAyahRangeForPage(endPage);

    if (!startRange || !endRange) return null;

    return {
      startSurah: startRange.start.surah,
      startAyah: startRange.start.ayah,
      endSurah: endRange.end.surah,
      endAyah: endRange.end.ayah,
    };
  }

  // Convert surah/ayah range to page range
  async surahRangeToPageRange(range: SurahRange): Promise<PageRange | null> {
    await this.ensureInitialized();
    const startPage = await this.getPageForAyah(range.startSurah, range.startAyah);
    const endPage = await this.getPageForAyah(range.endSurah, range.endAyah);

    if (!startPage || !endPage) return null;

    return {
      startPage,
      endPage,
    };
  }

  // Get ayahs for a surah
  getAyahsForSurah(surah: number): number[] {
    const info = this.getSurahInfo(surah);
    if (!info) return [];

    const ayahs: number[] = [];
    for (let i = info.firstAyah; i <= info.lastAyah; i++) {
      ayahs.push(i);
    }
    return ayahs;
  }

  // Validate surah/ayah range
  validateSurahRange(range: SurahRange): boolean {
    const startInfo = this.getSurahInfo(range.startSurah);
    const endInfo = this.getSurahInfo(range.endSurah);

    if (!startInfo || !endInfo) return false;

    // Check if start is valid
    if (range.startAyah < startInfo.firstAyah || range.startAyah > startInfo.lastAyah) {
      return false;
    }

    // Check if end is valid
    if (range.endAyah < endInfo.firstAyah || range.endAyah > endInfo.lastAyah) {
      return false;
    }

    // Check if range is logical (start comes before end)
    if (range.startSurah > range.endSurah) return false;
    if (range.startSurah === range.endSurah && range.startAyah > range.endAyah) return false;

    return true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}

// Singleton instance
export const quranRangeService = new QuranRangeService();

