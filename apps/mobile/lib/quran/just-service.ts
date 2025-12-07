/**
 * Justification Service for Quranic text
 * Based on the mushaf-react-native project's approach
 * Uses DigitalKhatt font features (cv01, cv02, etc.) for letter stretching
 */

import {
  Skia,
  SkParagraph,
  SkParagraphBuilder,
  SkTextFontFeatures,
  SkTextStyle,
  SkTypefaceFontProvider,
  TextAlign,
  TextHeightBehavior,
} from '@shopify/react-native-skia';

// Constants for layout calculations
export const SPACEWIDTH = 100;
export const FONTSIZE = 1000;

export const enum SpaceType {
  Simple = 1,
  Aya,
}

export interface WordInfo {
  startIndex: number;
  endIndex: number;
  text: string;
  baseText: string;
}

export interface LineTextInfo {
  ayaSpaceIndexes: number[];
  simpleSpaceIndexes: number[];
  spaces: Map<number, SpaceType>;
  wordInfos: WordInfo[];
}

export interface LayoutResult {
  parHeight: number;
  parWidth: number;
}

export interface JustResultByLine {
  fontFeatures: Map<number, SkTextFontFeatures[]>;
  simpleSpacing: number;
  ayaSpacing: number;
  fontSizeRatio: number;
}

interface Appliedfeature {
  feature: SkTextFontFeatures;
  calcNewValue?: (prev: number | undefined, curr: number) => number;
}

interface JustInfo {
  fontFeatures: Map<number, SkTextFontFeatures[]>;
  desiredWidth: number;
  textLineWidth: number;
  layoutResult: LayoutResult[];
}

interface LookupContext {
  justInfo: JustInfo;
  wordIndex: number;
  groups?: {
    [key: string]: [number, number];
  };
}

interface ApplyContext {
  prevFeatures: SkTextFontFeatures[] | undefined;
  char: string;
  wordIndex: number;
  charIndex: number;
}

type ActionFunction = {
  apply: (context: ApplyContext) => SkTextFontFeatures[] | undefined;
};

type ActionValue = {
  name: string;
  value?: number;
  calcNewValue: (prev: number | undefined, curr: number) => number;
};

type Action = ActionFunction | ActionValue;

interface Lookup {
  condition?: (context: LookupContext) => boolean;
  matchingCondition?: (context: LookupContext) => boolean;
  regExprs: RegExp | RegExp[];
  actions: { [key: string]: Action[] };
}

const lineParStyle = {
  textAlign: TextAlign.Left,
  textHeightBehavior: TextHeightBehavior.DisableAll,
};

// Arabic letter categories
export const rightNoJoinLetters = 'ادذرزوؤأٱإءة';
export const dualJoinLetters = 'بتثجحخسشصضطظعغفقكلمنهيئى';
const finalIsolAlternates = 'ىصضسشفقبتثنكيئ';

// Set of base characters for tracking
const bases = new Set<number>();
for (let i = 0; i < dualJoinLetters.length; i++) {
  bases.add(dualJoinLetters.charCodeAt(i));
}
for (let i = 0; i < rightNoJoinLetters.length; i++) {
  bases.add(rightNoJoinLetters.charCodeAt(i));
}

export function isLastBase(text: string, index: number): boolean {
  for (let charIndex = index + 1; charIndex < text.length; charIndex++) {
    if (bases.has(text.charCodeAt(charIndex))) {
      return false;
    }
  }
  return true;
}

/**
 * Analyze line text to identify words and space types
 */
export function analyzeText(lineText: string): LineTextInfo {
  const lineTextInfo: LineTextInfo = {
    ayaSpaceIndexes: [],
    simpleSpaceIndexes: [],
    wordInfos: [],
    spaces: new Map(),
  };

  let currentWord: WordInfo = { text: '', startIndex: 0, endIndex: -1, baseText: '' };
  lineTextInfo.wordInfos.push(currentWord);

  for (let i = 0; i < lineText.length; i++) {
    const char = lineText.charAt(i);
    if (char === ' ') {
      // Check if this is an aya marker space (after Arabic digits or before end of aya marker)
      const prevCharCode = lineText.charCodeAt(i - 1);
      const nextCharCode = lineText.charCodeAt(i + 1);
      if (
        (prevCharCode >= 0x0660 && prevCharCode <= 0x0669) ||
        nextCharCode === 0x06dd
      ) {
        lineTextInfo.ayaSpaceIndexes.push(i);
        lineTextInfo.spaces.set(i, SpaceType.Aya);
      } else {
        lineTextInfo.simpleSpaceIndexes.push(i);
        lineTextInfo.spaces.set(i, SpaceType.Simple);
      }
      currentWord = { text: '', startIndex: i + 1, endIndex: i, baseText: '' };
      lineTextInfo.wordInfos.push(currentWord);
    } else {
      currentWord.text += char;
      if (bases.has(char.charCodeAt(0))) {
        currentWord.baseText += char;
      }
      currentWord.endIndex++;
    }
  }

  return lineTextInfo;
}

export class JustService {
  private lineText: string;
  private textStyle: SkTextStyle;
  private parInfiniteWidth: number;
  private lineWidth = 2000;
  private desiredWidth: number;
  private fontSize: number;
  private paraBuilder: SkParagraphBuilder;

  constructor(
    private lineTextInfo: LineTextInfo,
    private fontMgr: SkTypefaceFontProvider,
    private fontSizeLineWidthRatio: number,
    private lineWidthRatio: number,
    lineText: string,
    pParBuilder?: SkParagraphBuilder
  ) {
    this.lineText = lineText;
    this.desiredWidth = lineWidthRatio * this.lineWidth;
    this.parInfiniteWidth = 1.5 * this.desiredWidth;
    this.fontSize = this.fontSizeLineWidthRatio * this.lineWidth;

    this.textStyle = {
      fontFamilies: ['DigitalKhatt'],
      fontSize: this.fontSize,
    };

    if (pParBuilder) {
      this.paraBuilder = pParBuilder;
    } else {
      this.paraBuilder = Skia.ParagraphBuilder.Make(lineParStyle, this.fontMgr);
    }
  }

  justifyLine(): JustResultByLine {
    const desiredWidth = this.desiredWidth;
    let scale = this.fontSize / FONTSIZE;
    const defaultSpaceWidth = SPACEWIDTH * scale;
    const lineTextInfo = this.lineTextInfo;

    let layOutResult: LayoutResult[] = [];
    let justResults: JustInfo | undefined;
    let simpleSpaceWidth: number;
    let ayaSpaceWidth: number;

    const totalSpaces = lineTextInfo.ayaSpaceIndexes.length + lineTextInfo.simpleSpaceIndexes.length;
    let textWidthByWord = defaultSpaceWidth * totalSpaces;

    // Measure each word
    for (let wordIndex = 0; wordIndex < lineTextInfo.wordInfos.length; wordIndex++) {
      const wordInfo = lineTextInfo.wordInfos[wordIndex];

      let paragraphBuilder = this.paraBuilder;
      paragraphBuilder.reset();
      paragraphBuilder.pushStyle(this.textStyle);
      paragraphBuilder.addText(wordInfo.text);
      let paragraph = paragraphBuilder.pop().build();
      paragraph.layout(this.parInfiniteWidth);
      const parHeight = paragraph.getHeight();
      const parWidth = paragraph.getLongestLine();

      textWidthByWord += parWidth;
      layOutResult.push({ parHeight, parWidth });
      paragraph.dispose();
    }

    // Measure full line
    const getTextWidth = (): number => {
      let paragraphBuilder = this.paraBuilder;
      paragraphBuilder.reset();
      paragraphBuilder.pushStyle(this.textStyle);
      paragraphBuilder.addText(this.lineText);
      let paragraph = paragraphBuilder.pop().build();
      paragraph.layout(this.parInfiniteWidth);
      const parWidth = paragraph.getLongestLine();
      paragraph.dispose();
      return parWidth;
    };

    let currentLineWidth = getTextWidth();
    let diff = desiredWidth - currentLineWidth;

    let fontSizeRatio = 1;
    let simpleSpacing = SPACEWIDTH;
    let ayaSpacing = SPACEWIDTH;

    if (diff > 0) {
      // Need to stretch
      let maxStretchBySpace = defaultSpaceWidth * 0.5;
      let maxStretchByAyaSpace = defaultSpaceWidth * 2;

      let maxStretch =
        maxStretchBySpace * lineTextInfo.simpleSpaceIndexes.length +
        maxStretchByAyaSpace * lineTextInfo.ayaSpaceIndexes.length;

      let stretch = Math.min(desiredWidth - currentLineWidth, maxStretch);
      let spaceRatio = maxStretch !== 0 ? stretch / maxStretch : 0;
      let stretchBySpace = spaceRatio * maxStretchBySpace;
      let stretchByByAyaSpace = spaceRatio * maxStretchByAyaSpace;

      simpleSpaceWidth = defaultSpaceWidth + stretchBySpace;
      ayaSpaceWidth = defaultSpaceWidth + stretchByByAyaSpace;

      currentLineWidth += stretch;

      // Apply font feature stretching
      if (desiredWidth > currentLineWidth) {
        justResults = this.stretchLine(layOutResult, currentLineWidth, desiredWidth);
        currentLineWidth = justResults.textLineWidth;
      }

      // Full justify with space if still needed
      if (desiredWidth > currentLineWidth && lineTextInfo.spaces.size > 0) {
        let addToSpace = (desiredWidth - currentLineWidth) / lineTextInfo.spaces.size;
        simpleSpaceWidth += addToSpace;
        ayaSpaceWidth += addToSpace;
      }

      simpleSpacing = simpleSpaceWidth / scale;
      ayaSpacing = ayaSpaceWidth / scale;
    } else {
      // Need to shrink - reduce font size
      fontSizeRatio = desiredWidth / currentLineWidth;
    }

    return {
      fontFeatures: justResults?.fontFeatures || new Map<number, SkTextFontFeatures[]>(),
      simpleSpacing,
      ayaSpacing,
      fontSizeRatio,
    };
  }

  private stretchLine(
    layoutResult: LayoutResult[],
    initialLineWidth: number,
    desiredWidth: number
  ): JustInfo {
    const wordInfos = this.lineTextInfo.wordInfos;

    const justInfo: JustInfo = {
      textLineWidth: initialLineWidth,
      fontFeatures: new Map<number, SkTextFontFeatures[]>(),
      layoutResult,
      desiredWidth,
    };

    const right = 'بتثنيئ' + 'جحخ' + 'سش' + 'صض' + 'طظ' + 'عغ' + 'فق' + 'لم' + 'ه';
    const behafterbeh = `^.*(?:[${dualJoinLetters}]\\p{Mn}*)+(?<k1>[بتثنيسشصض])\\p{Mn}*(?<k2>[بتثنيم])\\p{Mn}*(?:\\p{L}\\p{Mn}*)+$`;

    const behBehLookup: Lookup = {
      regExprs: new RegExp(behafterbeh, 'gdu'),
      actions: {
        k1: [
          {
            apply: (context) => {
              let newFeatures: Appliedfeature[] = [
                {
                  feature: { name: 'cv01', value: 1 },
                  calcNewValue: (prev, curr) => Math.min((prev || 0) + curr, 6),
                },
              ];
              if ('بتثنيئ'.includes(context.char)) {
                newFeatures.push({ feature: { name: 'cv10', value: 1 } });
              }
              return this.mergeFeatures(context.prevFeatures, newFeatures);
            },
          },
        ],
        k2: [{ name: 'cv02', calcNewValue: (prev, curr) => (prev || 0) + 2 * curr }],
      },
    };

    const finalAssendantRegExprs = [
      new RegExp(`${behafterbeh}|^.*(?<k3>[${right}])\\p{Mn}*(?<k4>["آادذٱأإ"]).*$`, 'gdu'),
      new RegExp(
        `${behafterbeh}|^.*(?<k3>[${right}])\\p{Mn}*(?<k4>[كله])\\p{Mn}[${rightNoJoinLetters}].*$`,
        'gdu'
      ),
    ];

    const finalAssensantLookup: Lookup = {
      regExprs: finalAssendantRegExprs,
      matchingCondition: (context) => this.matchingCondition(context),
      actions: {
        k3: [
          {
            apply: (context) => {
              let newFeatures: Appliedfeature[] = [
                {
                  feature: { name: 'cv01', value: 1 },
                  calcNewValue: (prev, curr) => Math.min((prev || 0) + curr, 6),
                },
              ];
              if ('بتثنيئ'.includes(context.char)) {
                newFeatures.push({ feature: { name: 'cv10', value: 1 } });
              }
              return this.mergeFeatures(context.prevFeatures, newFeatures);
            },
          },
        ],
        k4: [{ name: 'cv02', calcNewValue: (prev, curr) => Math.min((prev || 0) + curr, 6) }],
      },
    };

    const left = 'ئبتثني' + 'جحخ' + 'طظ' + 'عغ' + 'فق' + 'ةلم' + 'ر';
    const mediLeftAsendant = 'ل';

    const generalKashidaLookup: Lookup = {
      regExprs: [
        ...finalAssendantRegExprs,
        new RegExp(`${behafterbeh}|^.*(?<k3>[${right}])\\p{Mn}*(?<k5>[${mediLeftAsendant}]).*$`, 'gdu'),
        new RegExp(`${behafterbeh}|^.*(?<k3>[${right}])\\p{Mn}*(?<k5>[${left}]).*$`, 'gdu'),
      ],
      matchingCondition: (context) => this.matchingCondition(context),
      condition: (context) => {
        let group = context?.groups?.['k5'];
        if (group) {
          const wordInfo = wordInfos[context.wordIndex];
          const charIndex = group[0];
          const char = wordInfo.text[charIndex];
          if (finalIsolAlternates.includes(char) && isLastBase(wordInfo.text, charIndex)) {
            return false;
          }
        }
        return true;
      },
      actions: {
        k3: [
          {
            apply: (context) => {
              let newFeatures: Appliedfeature[] = [
                {
                  feature: { name: 'cv01', value: 1 },
                  calcNewValue: (prev, curr) => Math.min((prev || 0) + curr, 6),
                },
              ];
              if ('بتثنيئ'.includes(context.char)) {
                newFeatures.push({ feature: { name: 'cv10', value: 1 } });
              }
              return this.mergeFeatures(context.prevFeatures, newFeatures);
            },
          },
        ],
        k4: [{ name: 'cv02', calcNewValue: (prev, curr) => Math.min((prev || 0) + curr, 6) }],
        k5: [{ name: 'cv02', calcNewValue: (prev, curr) => (prev || 0) + curr * 2 }],
      },
    };

    const kafAltLookup: Lookup = {
      regExprs: new RegExp(`^.*(?<k1>[ك])\\p{Mn}*(?<k2>\\p{L}).*$`, 'gdu'),
      actions: {
        k1: [{ name: 'cv03', calcNewValue: () => 1 }],
        k2: [{ name: 'cv03', calcNewValue: () => 1 }],
      },
    };

    // Apply various lookups to stretch the line
    this.applyLookupInc(justInfo, behBehLookup, 2);
    this.applyAlternates(justInfo, 'بتثكن', 2);
    this.applyLookupInc(justInfo, finalAssensantLookup, 2);
    this.applyLookupInc(justInfo, generalKashidaLookup, 1);
    this.applyDecomp(justInfo, '[جحخ]', '[هكلذداة]', 'cv16', 2, 4);

    this.applyDecomp(justInfo, '[ه]', '[م]', 'cv11', 1, 2);
    this.applyDecomp(justInfo, '[بتثني]', '[جحخ]', 'cv12', 1, 2);
    this.applyDecomp(justInfo, '[م]', '[جحخ]', 'cv13', 1, 2);
    this.applyDecomp(justInfo, '[فق]', '[جحخ]', 'cv14', 1, 2);
    this.applyDecomp(justInfo, '[ل]', '[جحخ]', 'cv15', 1, 2);

    this.applyDecomp(justInfo, '[سشصض]', '[ر]', 'cv17', 1, 2);
    this.applyDecomp(justInfo, '[جحخ]', '[م]', 'cv18', 1, 2);
    this.applyDecomp(justInfo, '[عغ]', '[دذا]', 'cv16', 1, 1);

    this.applyAlternates(justInfo, 'ىصضسشفقيئ', 2);
    this.applyLookupInc(justInfo, kafAltLookup, 1);

    this.applyLookupInc(justInfo, behBehLookup, 1);
    this.applyAlternates(justInfo, 'بتثكن', 1);
    this.applyLookupInc(justInfo, finalAssensantLookup, 1);
    this.applyLookupInc(justInfo, generalKashidaLookup, 1);

    this.applyAlternates(justInfo, 'ىصضسشفقيئ', 1);

    this.applyLookupInc(justInfo, behBehLookup, 2);
    this.applyAlternates(justInfo, 'بتثكن', 2);
    this.applyAlternates(justInfo, 'ىصضسشفقيئ', 2);
    this.applyLookupInc(justInfo, generalKashidaLookup, 2);

    return justInfo;
  }

  private applyAlternates(justInfo: JustInfo, chars: string, nbLevels: number): boolean {
    let patternExpa = `^.*(?<expa>[${chars}])(\\p{Mn}*(?<fatha>\u064E)\\p{Mn}*|\\p{Mn}*)$`;
    const regExprExpa = new RegExp(patternExpa, 'gdu');

    const expaLookup: Lookup = {
      regExprs: regExprExpa,
      actions: {
        expa: [{ name: 'cv01', calcNewValue: (prev, curr) => (prev || 0) + curr }],
        fatha: [
          {
            name: 'cv01',
            calcNewValue: (prev, curr) =>
              !prev ? 1 + Math.floor(curr / 3) : 1 + Math.floor((prev * 2.5 + curr) / 3),
          },
        ],
      },
    };

    this.applyLookupInc(justInfo, expaLookup, nbLevels);
    return false;
  }

  private applyDecomp(
    justInfo: JustInfo,
    firstChars: string,
    secondChars: string,
    featureName: string,
    firstLevel?: number,
    secondLevel?: number
  ): boolean {
    const decompLookup: Lookup = {
      regExprs: new RegExp(`^.*(?<k1>${firstChars})\\p{Mn}*(?<k2>${secondChars}).*$`, 'gdu'),
      actions: {
        k1: [{ name: featureName, calcNewValue: () => 1 }],
        k2: [{ name: featureName, calcNewValue: () => 1 }],
      },
    };

    if (firstLevel) {
      decompLookup.actions.k1.push({ name: 'cv01', calcNewValue: () => firstLevel });
    }

    if (secondLevel) {
      decompLookup.actions.k2.push({ name: 'cv02', calcNewValue: () => secondLevel });
    }

    this.applyLookupInc(justInfo, decompLookup, 1);
    return false;
  }

  private applyLookupInc(justInfo: JustInfo, lookup: Lookup, nbLevels: number): boolean {
    const wordInfos = this.lineTextInfo.wordInfos;

    for (let level = 1; level <= nbLevels; level++) {
      for (let wordIndex = 0; wordIndex < wordInfos.length; wordIndex++) {
        this.applyLookup(justInfo, wordIndex, lookup, 1);
      }
    }

    return false;
  }

  private applyLookup(justInfo: JustInfo, wordIndex: number, lookup: Lookup, level: number) {
    const wordInfos = this.lineTextInfo.wordInfos;
    let result = justInfo.fontFeatures;

    const wordInfo = wordInfos[wordIndex];
    let layout = justInfo.layoutResult[wordIndex];

    let regExprs = Array.isArray(lookup.regExprs) ? lookup.regExprs : [lookup.regExprs];
    let matched = false;

    for (let regIndex = 0; regIndex < regExprs.length && !matched; regIndex++) {
      const regExpr = regExprs[regIndex];
      regExpr.lastIndex = 0;

      let match = regExpr.exec(wordInfo.text);
      if (!match) continue;

      const groups = (match as any)?.indices?.groups;

      if (lookup.matchingCondition) {
        if (!lookup.matchingCondition({ justInfo, wordIndex, groups })) continue;
      }

      matched = true;

      if (lookup.condition) {
        if (!lookup.condition({ justInfo, wordIndex, groups })) return;
      }

      let tempResult = new Map(result);

      for (const key in groups) {
        let group = groups[key];
        if (!group) continue;

        let actions = lookup.actions[key];
        if (!actions) continue;

        for (const action of actions) {
          const indexInLine = group[0] + wordInfo.startIndex;
          const prevFeatures = tempResult.get(indexInLine);
          let newFeatures: SkTextFontFeatures[] | undefined;

          if ('name' in action) {
            let newValue = action.value || level;
            newFeatures = this.mergeFeatures(prevFeatures, [
              { feature: { name: action.name, value: newValue }, calcNewValue: action.calcNewValue },
            ]);
          } else {
            newFeatures = action.apply({
              prevFeatures,
              char: wordInfo.text[group[0]],
              wordIndex,
              charIndex: group[0],
            });
          }

          if (newFeatures) {
            tempResult.set(indexInLine, newFeatures);
          } else {
            tempResult.delete(indexInLine);
          }
        }
      }

      const paragraph = this.shapeWord(wordIndex, tempResult);
      const wordNewWidth = paragraph.getLongestLine();
      paragraph.dispose();

      if (
        wordNewWidth !== layout.parWidth &&
        justInfo.textLineWidth + wordNewWidth - layout.parWidth < justInfo.desiredWidth
      ) {
        justInfo.textLineWidth += wordNewWidth - layout.parWidth;
        layout.parWidth = wordNewWidth;
        justInfo.fontFeatures = tempResult;
        result = tempResult;
      }
    }
  }

  private mergeFeatures(
    prevFeatures: SkTextFontFeatures[] | undefined,
    newFeatures: Appliedfeature[]
  ): SkTextFontFeatures[] | undefined {
    let mergedFeatures: SkTextFontFeatures[];

    if (prevFeatures) {
      mergedFeatures = prevFeatures.map((x) => Object.assign({}, x));
    } else {
      mergedFeatures = [];
    }

    if (newFeatures) {
      for (const newFeature of newFeatures) {
        const exist = mergedFeatures.find((prevFeature) => prevFeature.name === newFeature.feature.name);
        if (exist) {
          exist.value = newFeature.calcNewValue
            ? newFeature.calcNewValue(exist.value, newFeature.feature.value)
            : newFeature.feature.value;
        } else {
          const cloneNewFeature = {
            name: newFeature.feature.name,
            value: newFeature.calcNewValue
              ? newFeature.calcNewValue(undefined, newFeature.feature.value)
              : newFeature.feature.value,
          };
          mergedFeatures.push(cloneNewFeature);
        }
      }
    }

    return mergedFeatures;
  }

  private shapeWord(wordIndex: number, justResults: Map<number, SkTextFontFeatures[]>): SkParagraph {
    const wordInfo = this.lineTextInfo.wordInfos[wordIndex];

    let paragraphBuilder = this.paraBuilder;
    paragraphBuilder.reset();
    paragraphBuilder.pushStyle(this.textStyle);

    for (let i = wordInfo.startIndex; i <= wordInfo.endIndex; i++) {
      const char = this.lineText.charAt(i);
      const justInfo = justResults.get(i);

      if (justInfo) {
        const newtextStyle: SkTextStyle = {
          ...this.textStyle,
          fontFeatures: justInfo,
        };

        paragraphBuilder.pushStyle(newtextStyle);
        paragraphBuilder.addText(char);
        paragraphBuilder.pop();
      } else {
        paragraphBuilder.addText(char);
      }
    }

    let paragraph = paragraphBuilder.pop().build();
    paragraph.layout(this.parInfiniteWidth);

    return paragraph;
  }

  private matchingCondition(context: LookupContext): boolean {
    const wordInfos = this.lineTextInfo.wordInfos;
    const wordInfo = wordInfos[context.wordIndex];

    if (wordInfo.baseText.length === 2 && !'سش'.includes(wordInfo.baseText)) {
      return false;
    }

    let k3 = context?.groups?.['k3'];
    let k4 = context?.groups?.['k4'] || context?.groups?.['k5'];

    if (k3 && k4) {
      const chark3 = wordInfo.text[k3[0]];
      const chark4 = wordInfo.text[k4[0]];
      const indexk3InLine = k3[0] + wordInfo.startIndex;
      const prevk3Features = context.justInfo.fontFeatures.get(indexk3InLine);

      if (chark3 === 'ل' && (chark4 === 'ك' || chark4 === 'د' || chark4 === 'ذ')) {
        return false;
      } else if (
        'عغجحخ'.includes(chark3) &&
        !prevk3Features?.find((a) => a.name === 'cv16') &&
        ('كلذداة'.includes(chark4) || (chark4 === 'ه' && isLastBase(wordInfo.text, k4[0])))
      ) {
        return false;
      }
    }
    return true;
  }

  dispose() {
    this.paraBuilder.dispose();
  }
}

