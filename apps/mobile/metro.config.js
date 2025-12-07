// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for SQLite database files and ensure font files are handled
config.resolver.assetExts.push('db');

// Ensure otf/ttf are in asset extensions (they should be by default)
if (!config.resolver.assetExts.includes('otf')) {
  config.resolver.assetExts.push('otf');
}
if (!config.resolver.assetExts.includes('ttf')) {
  config.resolver.assetExts.push('ttf');
}

module.exports = config;
