/**
 * QuranLine - Skia-based Quranic line rendering with proper justification
 * Uses DigitalKhatt variable font features for letter stretching
 * 
 * Note: This component requires a development build (not Expo Go)
 * to access Skia's native rendering capabilities.
 */

import {
  JustResultByLine,
  JustService,
  SPACEWIDTH,
  SpaceType,
  analyzeText,
} from '@/lib/quran/just-service';
import {
  Paragraph,
  SkTextStyle,
  SkTypefaceFontProvider,
  Skia,
  TextDirection,
  TextHeightBehavior,
} from '@shopify/react-native-skia';
import React, { useMemo } from 'react';

const lineParStyle = {
  textHeightBehavior: TextHeightBehavior.DisableAll,
  textDirection: TextDirection.RTL,
};

interface QuranLineProps {
  lineText: string;
  lineType: number; // 0 = ayah, 1 = surah_name, 2 = basmallah
  isCentered: boolean;
  lineWidthRatio?: number;
  pageWidth: number;
  fontSize: number;
  yPos: number;
  margin: number;
  fontMgr: SkTypefaceFontProvider;
}

export function QuranLine({
  lineText,
  lineType,
  isCentered,
  lineWidthRatio = 1,
  pageWidth,
  fontSize,
  yPos,
  margin,
  fontMgr,
}: QuranLineProps) {
  const lineWidth = pageWidth - 2 * margin;
  const fontSizeLineWidthRatio = fontSize / lineWidth;
  
  // Analyze text to identify words and spaces
  const lineTextInfo = useMemo(() => analyzeText(lineText), [lineText]);
  
  // Calculate justification result
  const justResult = useMemo((): JustResultByLine => {
    // Surah names and basmallah don't need justification
    if (lineType === 1 || lineType === 2) {
      return {
        fontFeatures: new Map(),
        simpleSpacing: SPACEWIDTH,
        ayaSpacing: SPACEWIDTH,
        fontSizeRatio: 1,
      };
    }
    
    // Apply justification
    const justService = new JustService(
      lineTextInfo,
      fontMgr,
      fontSizeLineWidthRatio,
      lineWidthRatio,
      lineText
    );
    const result = justService.justifyLine();
    justService.dispose();
    
    return result;
  }, [lineText, lineType, lineTextInfo, fontMgr, fontSizeLineWidthRatio, lineWidthRatio]);
  
  // Build the paragraph
  const { paragraph, xPos } = useMemo(() => {
    const scale = (fontSize * justResult.fontSizeRatio) / 1000;
    
    const textStyle: SkTextStyle = {
      color: Skia.Color('black'),
      fontFamilies: ['DigitalKhatt'],
      fontSize: justResult.fontSizeRatio * fontSize,
    };
    
    // Special handling for basmallah
    if (lineType === 2) {
      textStyle.fontFeatures = [{ name: 'basm', value: 1 }];
    }
    
    let paragraphBuilder = Skia.ParagraphBuilder.Make(lineParStyle, fontMgr);
    paragraphBuilder.pushStyle(textStyle);
    
    // Build text with font features and spacing
    for (let wordIndex = 0; wordIndex < lineTextInfo.wordInfos.length; wordIndex++) {
      const wordInfo = lineTextInfo.wordInfos[wordIndex];
      if (!wordInfo) continue;
      
      // Add each character with its font features
      for (let i = wordInfo.startIndex; i <= wordInfo.endIndex; i++) {
        const char = lineText.charAt(i);
        const justInfo = justResult.fontFeatures.get(i);
        
        if (justInfo) {
          const newtextStyle: SkTextStyle = {
            ...textStyle,
            fontFeatures: justInfo,
          };
          
          paragraphBuilder.pushStyle(newtextStyle);
          paragraphBuilder.addText(char);
          paragraphBuilder.pop();
        } else {
          paragraphBuilder.addText(char);
        }
      }
      
      // Add space with appropriate spacing
      const spaceType = lineTextInfo.spaces.get(wordInfo.endIndex + 1);
      if (spaceType !== undefined) {
        const newtextStyle: SkTextStyle = {
          ...textStyle,
        };
        
        if (spaceType === SpaceType.Aya) {
          newtextStyle.letterSpacing = (justResult.ayaSpacing - SPACEWIDTH) * scale;
        } else if (spaceType === SpaceType.Simple) {
          newtextStyle.letterSpacing = (justResult.simpleSpacing - SPACEWIDTH) * scale;
        }
        
        paragraphBuilder.pushStyle(newtextStyle);
        paragraphBuilder.addText(' ');
        paragraphBuilder.pop();
      }
    }
    
    const maxWidth = pageWidth * 2;
    
    paragraphBuilder.pop();
    let para = paragraphBuilder.build();
    para.layout(maxWidth);
    
    const currLineWidth = para.getLongestLine();
    
    // Calculate x position
    let effectiveMargin = margin;
    
    // Center surah names and basmallah
    if (lineType === 1 || lineType === 2 || isCentered) {
      effectiveMargin = (pageWidth - currLineWidth) / 2;
    }
    
    const x = -(maxWidth - pageWidth + effectiveMargin);
    
    paragraphBuilder.dispose();
    
    return { paragraph: para, xPos: x };
  }, [
    lineText,
    lineType,
    isCentered,
    lineTextInfo,
    justResult,
    fontMgr,
    fontSize,
    pageWidth,
    margin,
  ]);
  
  return (
    <Paragraph
      paragraph={paragraph}
      x={xPos}
      y={yPos}
      width={pageWidth * 2}
    />
  );
}

export default QuranLine;
