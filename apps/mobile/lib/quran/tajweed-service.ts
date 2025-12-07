/**
 * Tajweed Service
 * 
 * Handles tajweed coloring rules for Quran text.
 * Based on standard tajweed color coding:
 * - Green: Ghunnah (nasalization)
 * - Blue/Cyan: Qalqalah (echoing)
 * - Red variations: Madd (elongation)
 * - Gray: Silent letters
 * - Tafkheem blue: Heavy pronunciation
 */

export interface TajweedColor {
  green: [number, number, number];
  tafkim: [number, number, number];
  lgray: [number, number, number];
  lkalkala: [number, number, number];
  red1: [number, number, number];
  red2: [number, number, number];
  red3: [number, number, number];
  red4: [number, number, number];
}

export const TAJWEED_COLORS: TajweedColor = {
  green: [0, 166, 80],      // Ghunnah - nasalization
  tafkim: [0, 102, 148],    // Tafkheem - heavy pronunciation
  lgray: [156, 154, 155],   // Silent letters
  lkalkala: [0, 173, 239],  // Qalqalah - echoing
  red1: [195, 138, 8],      // Madd level 1
  red2: [244, 114, 22],     // Madd level 2
  red3: [236, 0, 140],      // Madd level 3 (obligatory)
  red4: [140, 0, 0],        // Madd level 4 (required)
};

// Arabic letter sets
const DUAL_JOIN_LETTERS = 'بتثجحخسشصضطظعغفقكلمنهيئى';
const RIGHT_NO_JOIN_LETTERS = 'ادذرزوؤأٱإءة';
const TAFKHEEM_LETTERS = 'طقصخغضظ';
const QALQALAH_LETTERS = 'طقدجب';

// Unicode diacritics
const SUKUN = '\u0652';
const FATHA = '\u064E';
const KASRA = '\u0650';
const DAMMA = '\u064F';
const SHADDA = '\u0651';
const TANWEEN_FATH = '\u08F0';
const TANWEEN_DAMM = '\u08F1';
const TANWEEN_KASR = '\u08F2';
const SMALL_ALEF = '\u0670';
const SMALL_WAW = '\u06E5';
const SMALL_YEH = '\u06E6';
const MADDA = '\u0653';
const NUN_GHUNNA = '\u06E2';
const SMALL_MEEM = '\u06ED';
const AYA_END = '۝';

class TajweedService {
  private tafkhimRE!: RegExp;
  private othersRE!: RegExp;
  private bases: Set<number> = new Set();
  private tajweedCache: Map<string, Map<number, string>> = new Map();

  constructor() {
    this.initBases();
    this.initPatterns();
  }

  private initBases(): void {
    for (const char of DUAL_JOIN_LETTERS) {
      this.bases.add(char.charCodeAt(0));
    }
    for (const char of RIGHT_NO_JOIN_LETTERS) {
      this.bases.add(char.charCodeAt(0));
    }
  }

  private initPatterns(): void {
    // Tafkheem patterns
    let pattern = `(?<tafkhim1>[${TAFKHEEM_LETTERS}]${SHADDA}?[${SUKUN}${FATHA}${TANWEEN_FATH}${KASRA}${TANWEEN_KASR}${DAMMA}${TANWEEN_DAMM}])`;

    // Tafkheem Reh patterns
    pattern += `|(?:${KASRA}|ي${SUKUN}?)ر\\p{Mn}+\\s${AYA_END}`;
    pattern += `|(?<tafkhim2>ر${SHADDA}?[${FATHA}${DAMMA}])`;
    pattern += `|(?:ٱ|[${FATHA}${DAMMA}](?:\\p{L}${SUKUN}|[او]?))(?<tafkhim3>ر${SUKUN})`;
    pattern += `|[${FATHA}${DAMMA}](?:\\p{L}${SUKUN}|[او]?)(?<tafkhim4>ر)\\p{Mn}+\\s${AYA_END}`;
    pattern += `|${KASRA}(?<tafkhim5>ر${SUKUN})[صطغخق]`;

    this.tafkhimRE = new RegExp(pattern, 'gdu');

    // Other patterns (gray, ghunnah, madd, qalqalah)
    pattern = `\\p{L}\\p{Mn}*(?<gray1>ٱ)(?!ل\\p{Mn}*ل\\p{Mn}*ه\\p{Mn}*(?:\\s|$))`;
    pattern += `|ٱ(?<gray2>ل(?!\\p{Mn}*ل\\p{Mn}*ه\\p{Mn}*(?:\\s|$)))\\p{L}`;
    pattern += `|(?<gray3>\\p{L}\u06DF)`;
    pattern += `|(?<gray4>[و])(?=${SMALL_ALEF})|(?<gray4_1>[ى])(?=${SMALL_ALEF}\\p{L})`;
    pattern += `|(?<gray5>ن)(?= [نيمورل])`;
    pattern += `|[${FATHA}${DAMMA}${KASRA}](?<gray6>\\p{L})(?=\\s?\\p{L}${SHADDA})`;

    // Tanween/Ghunnah patterns
    pattern += `|(?<tanween1>ن[${NUN_GHUNNA}${SMALL_MEEM}])|(?<tanween2>ن${SHADDA}\\p{Mn})|(?<tanween3>[${NUN_GHUNNA}${SMALL_MEEM}] ن)|(?<tanween4>م ب)|(?<tanween5>ن\\p{L})`;
    pattern += `|(?<tanween6>[${TANWEEN_FATH}${TANWEEN_DAMM}${TANWEEN_KASR}ن])\\p{L}? (?<tanween7>[يوم]\\p{Mn}\\p{Mn}?)`;
    pattern += `|(?<tanween8>[${TANWEEN_FATH}${TANWEEN_DAMM}${TANWEEN_KASR}ن])\\p{L}? [لر]${SHADDA}`;
    pattern += `|(?<tanween9>[${TANWEEN_FATH}${TANWEEN_DAMM}${TANWEEN_KASR}ن])\\p{L}? \\p{L}`;
    pattern += `|(?<tanween10>[من]${SHADDA}\\p{Mn})`;

    // Madd patterns
    pattern += `|(?<madd1>[او${SMALL_ALEF}${SMALL_WAW}${SMALL_YEH}]${MADDA})(?=\\p{L}${SHADDA})`;
    pattern += `|(?<madd2>[${SMALL_ALEF}${SMALL_WAW}${SMALL_YEH}])`;
    pattern += `|[او${SMALL_ALEF}${SMALL_WAW}${SMALL_YEH}]${MADDA}\\s${AYA_END}`;
    pattern += `|(?<madd3>[لم]${MADDA})`;
    pattern += `|(?<madd4>[اويى${SMALL_ALEF}${SMALL_WAW}${SMALL_YEH}]${MADDA})`;
    pattern += `|(?<madd5>[ياو${SMALL_ALEF}]${SUKUN}?)(?=\\p{L}\\p{Mn}\\p{Mn}?\\s${AYA_END})`;

    // Qalqalah patterns
    pattern += `|(?<kalkala1>[${QALQALAH_LETTERS}]${SUKUN})`;
    pattern += `|(?<kalkala2>[${QALQALAH_LETTERS}]) \u06DD`;

    this.othersRE = new RegExp(pattern, 'gdu');
  }

  getTajweed(pageIndex: number, lineIndex: number, lineText: string): Map<number, string> {
    const cacheKey = `${pageIndex}-${lineIndex}`;
    const cached = this.tajweedCache.get(cacheKey);
    if (cached) return cached;

    const result = new Map<number, string>();
    
    // Process tafkheem patterns
    let matches = lineText.matchAll(this.tafkhimRE);
    for (const match of matches) {
      const groups = (match as any).indices?.groups;
      if (!groups) continue;

      if (groups.tafkhim1) {
        this.setTajweedRange(result, groups.tafkhim1, 'tafkim');
      } else if (groups.tafkhim2) {
        this.setTajweedRange(result, groups.tafkhim2, 'tafkim');
      } else if (groups.tafkhim3) {
        this.setTajweedRange(result, groups.tafkhim3, 'tafkim');
      } else if (groups.tafkhim4) {
        this.setTajweedRange(result, groups.tafkhim4, 'tafkim');
      } else if (groups.tafkhim5) {
        this.setTajweedRange(result, groups.tafkhim5, 'tafkim');
      }
    }

    // Process other patterns
    matches = lineText.matchAll(this.othersRE);
    for (const match of matches) {
      const groups = (match as any).indices?.groups;
      if (!groups) continue;

      // Tanween/Ghunnah
      if (groups.tanween1) {
        const [start] = groups.tanween1;
        result.set(start, 'lgray');
        result.set(start + 1, 'green');
      } else if (groups.tanween2) {
        this.setTajweedRange(result, groups.tanween2, 'green');
      } else if (groups.tanween3) {
        result.set(groups.tanween3[0], 'green');
      } else if (groups.tanween4) {
        result.set(groups.tanween4[0], 'green');
      } else if (groups.tanween5) {
        result.set(groups.tanween5[0], 'green');
      } else if (groups.tanween6 && groups.tanween7) {
        result.set(groups.tanween6[0], 'lgray');
        this.setTajweedRange(result, groups.tanween7, 'green');
      } else if (groups.tanween8) {
        result.set(groups.tanween8[0], 'lgray');
      } else if (groups.tanween9) {
        result.set(groups.tanween9[0], 'green');
      } else if (groups.tanween10) {
        this.setTajweedRange(result, groups.tanween10, 'green');
      }

      // Gray (silent letters)
      else if (groups.gray1) {
        result.set(groups.gray1[0], 'lgray');
      } else if (groups.gray2) {
        result.set(groups.gray2[0], 'lgray');
      } else if (groups.gray3) {
        this.setTajweedRange(result, groups.gray3, 'lgray');
      } else if (groups.gray4 || groups.gray4_1) {
        const group = groups.gray4 || groups.gray4_1;
        result.set(group[0], 'lgray');
      } else if (groups.gray5) {
        result.set(groups.gray5[0], 'lgray');
      } else if (groups.gray6) {
        result.set(groups.gray6[0], 'lgray');
      }

      // Qalqalah
      else if (groups.kalkala1) {
        this.setTajweedRange(result, groups.kalkala1, 'lkalkala');
      } else if (groups.kalkala2) {
        result.set(groups.kalkala2[0], 'lkalkala');
      }

      // Madd
      else if (groups.madd1) {
        this.setTajweedRange(result, groups.madd1, 'red4');
      } else if (groups.madd2) {
        result.set(groups.madd2[0], 'red1');
      } else if (groups.madd3) {
        this.setTajweedRange(result, groups.madd3, 'red4');
      } else if (groups.madd4) {
        this.setTajweedRange(result, groups.madd4, 'red3');
      } else if (groups.madd5) {
        this.setTajweedRange(result, groups.madd5, 'red2');
      }
    }

    this.tajweedCache.set(cacheKey, result);
    return result;
  }

  private setTajweedRange(result: Map<number, string>, range: [number, number], color: string): void {
    for (let i = range[0]; i < range[1]; i++) {
      result.set(i, color);
    }
  }

  getColor(colorName: string): [number, number, number] {
    const colors = TAJWEED_COLORS as any;
    return colors[colorName] || [0, 0, 0];
  }

  // Returns a hex color string for Skia.Color()
  getColorHex(colorName: string): string {
    const [r, g, b] = this.getColor(colorName);
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

export const tajweedService = new TajweedService();

