import { useState, useEffect } from 'react';
import { Skia, SkTypefaceFontProvider } from '@shopify/react-native-skia';
import { Asset } from 'expo-asset';

// Font asset
const DIGITAL_KHATT_FONT = require('@/assets/quran/DigitalKhattV2.otf');

let cachedFontMgr: SkTypefaceFontProvider | null = null;
let loadingPromise: Promise<SkTypefaceFontProvider | null> | null = null;

async function loadQuranFont(): Promise<SkTypefaceFontProvider | null> {
  if (cachedFontMgr) {
    return cachedFontMgr;
  }

  try {
    // Load the font asset
    const asset = Asset.fromModule(DIGITAL_KHATT_FONT);
    await asset.downloadAsync();

    if (!asset.localUri) {
      console.error('Font asset localUri is null');
      return null;
    }

    // Use fetch to get the font as ArrayBuffer (works with file:// URIs)
    const response = await fetch(asset.localUri);
    const arrayBuffer = await response.arrayBuffer();
    
    // Create Uint8Array from ArrayBuffer
    const fontBytes = new Uint8Array(arrayBuffer);
    
    // Wrap in SkData for Skia
    const fontData = Skia.Data.fromBytes(fontBytes);

    // Create font manager with the font data
    const fontMgr = Skia.TypefaceFontProvider.Make();
    const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(fontData);
    
    if (!typeface) {
      console.error('Failed to create typeface from font data');
      return null;
    }

    fontMgr.registerFont(typeface, 'digitalkhatt');
    cachedFontMgr = fontMgr;
    
    console.log('Quran font loaded successfully');
    return fontMgr;
  } catch (error) {
    console.error('Error loading Quran font:', error);
    return null;
  }
}

export function useQuranFont(): SkTypefaceFontProvider | null {
  const [fontMgr, setFontMgr] = useState<SkTypefaceFontProvider | null>(cachedFontMgr);

  useEffect(() => {
    if (cachedFontMgr) {
      setFontMgr(cachedFontMgr);
      return;
    }

    if (!loadingPromise) {
      loadingPromise = loadQuranFont();
    }

    loadingPromise.then((mgr) => {
      setFontMgr(mgr);
    });
  }, []);

  return fontMgr;
}

