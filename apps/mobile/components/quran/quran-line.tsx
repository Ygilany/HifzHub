import React, { useMemo } from 'react';
import {
  Paragraph,
  Skia,
  TextHeightBehavior,
  TextDirection,
  SkTextStyle,
} from '@shopify/react-native-skia';
import { quranService, tajweedService, PAGE_WIDTH, FONTSIZE, MARGIN, SPACEWIDTH, useQuranFont } from '@/lib/quran';

// Paragraph style for RTL text
const lineParStyle = {
  textHeightBehavior: TextHeightBehavior.DisableAll,
  textDirection: TextDirection.RTL,
};

// Space types for word spacing
const enum SpaceType {
  Simple = 1,
  Aya,
}

interface QuranLineProps {
  pageIndex: number;
  lineIndex: number;
  pageWidth: number;
  fontSize: number;
  yPos: number;
}

export function QuranLine({ pageIndex, lineIndex, pageWidth, fontSize, yPos }: QuranLineProps) {
  const fontMgr = useQuranFont();

  const paragraph = useMemo(() => {
    if (!fontMgr) return null;

    const lineText = quranService.getLineText(pageIndex, lineIndex);
    if (!lineText) return null;

    const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
    const scale = pageWidth / PAGE_WIDTH;
    let margin = MARGIN * scale;
    let lineWidth = pageWidth - 2 * margin;

    // Adjust for special line widths
    if (lineInfo.lineWidthRatio !== 1) {
      const newLineWidth = lineWidth * lineInfo.lineWidthRatio;
      margin += (lineWidth - newLineWidth) / 2;
      lineWidth = newLineWidth;
    }

    // Get tajweed coloring
    const tajweedInfo = tajweedService.getTajweed(pageIndex, lineIndex, lineText);

    // Analyze text for spacing
    const textInfo = analyzeText(lineText);

    // Base text style
    const textStyle: SkTextStyle = {
      color: Skia.Color('black'),
      fontFamilies: ['digitalkhatt'],
      fontSize: fontSize,
    };

    // Add basmallah font feature for basmallah lines (except on pages 1-2)
    if (lineInfo.lineType === 2 && pageIndex !== 0 && pageIndex !== 1) {
      textStyle.fontFeatures = [{ name: 'basm', value: 1 }];
    }

    // Build paragraph with tajweed colors
    const paragraphBuilder = Skia.ParagraphBuilder.Make(lineParStyle, fontMgr);
    paragraphBuilder.pushStyle(textStyle);

    for (let wordIndex = 0; wordIndex < textInfo.wordInfos.length; wordIndex++) {
      const wordInfo = textInfo.wordInfos[wordIndex];
      if (!wordInfo) continue;

      // Add each character with potential tajweed coloring
      for (let i = wordInfo.startIndex; i <= wordInfo.endIndex; i++) {
        const char = lineText.charAt(i);
        const tajweedColor = tajweedInfo.get(i);

        if (tajweedColor) {
          const newTextStyle: SkTextStyle = {
            ...textStyle,
            color: Skia.Color(tajweedService.getColorHex(tajweedColor)),
          };
          paragraphBuilder.pushStyle(newTextStyle);
          paragraphBuilder.addText(char);
          paragraphBuilder.pop();
        } else {
          paragraphBuilder.addText(char);
        }
      }

      // Add space after word with appropriate spacing
      const spaceType = textInfo.spaces.get(wordInfo.endIndex + 1);
      if (spaceType !== undefined) {
        const defaultSpaceWidth = SPACEWIDTH * (fontSize / FONTSIZE);
        let letterSpacing = 0;

        if (spaceType === SpaceType.Aya) {
          // Larger spacing around ayah markers
          letterSpacing = defaultSpaceWidth * 2;
        }

        const spaceStyle: SkTextStyle = {
          ...textStyle,
          letterSpacing: letterSpacing,
        };
        paragraphBuilder.pushStyle(spaceStyle);
        paragraphBuilder.addText(' ');
        paragraphBuilder.pop();
      }
    }

    paragraphBuilder.pop();
    const paragraph = paragraphBuilder.build();

    // Layout with max width
    const maxWidth = pageWidth * 2;
    paragraph.layout(maxWidth);

    return { paragraph, lineInfo, margin, maxWidth };
  }, [fontMgr, pageIndex, lineIndex, pageWidth, fontSize]);

  if (!fontMgr || !paragraph) {
    return null;
  }

  const { paragraph: p, lineInfo, margin, maxWidth } = paragraph;
  const currLineWidth = p.getLongestLine();

  // Calculate x position
  let xMargin = margin;
  if (lineInfo.lineType === 1 || (lineInfo.lineType === 2 && pageIndex !== 0 && pageIndex !== 1)) {
    // Center surah names and basmallah
    xMargin = (pageWidth - currLineWidth) / 2;
  }

  const xPos = -(maxWidth - pageWidth + xMargin);

  return (
    <Paragraph
      paragraph={p}
      x={xPos}
      y={yPos}
      width={maxWidth}
    />
  );
}

// Helper function to analyze text for word boundaries and spacing
interface WordInfo {
  startIndex: number;
  endIndex: number;
  text: string;
}

interface TextInfo {
  wordInfos: WordInfo[];
  spaces: Map<number, SpaceType>;
}

function analyzeText(lineText: string): TextInfo {
  const wordInfos: WordInfo[] = [];
  const spaces = new Map<number, SpaceType>();

  let currentWord: WordInfo = { text: '', startIndex: 0, endIndex: -1 };
  wordInfos.push(currentWord);

  for (let i = 0; i < lineText.length; i++) {
    const char = lineText.charAt(i);
    if (char === ' ') {
      // Check if this is an ayah space (after Arabic-Indic digits or before ayah end marker)
      const prevCharCode = lineText.charCodeAt(i - 1);
      const nextCharCode = lineText.charCodeAt(i + 1);
      
      // Arabic-Indic digits are U+0660 to U+0669, Ayah marker is U+06DD
      if ((prevCharCode >= 0x0660 && prevCharCode <= 0x0669) || nextCharCode === 0x06DD) {
        spaces.set(i, SpaceType.Aya);
      } else {
        spaces.set(i, SpaceType.Simple);
      }

      currentWord = { text: '', startIndex: i + 1, endIndex: i };
      wordInfos.push(currentWord);
    } else {
      currentWord.text += char;
      currentWord.endIndex = i;
    }
  }

  return { wordInfos, spaces };
}

export default QuranLine;
