const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Only watch specific folders in the monorepo that Metro needs
config.watchFolders = [
  // Watch the shared packages (workspace packages)
  path.resolve(monorepoRoot, 'packages'),
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Disable hierarchical lookup to use only specified nodeModulesPaths
config.resolver.disableHierarchicalLookup = true;

// 4. Enable symlinks support for pnpm (required for workspace packages)
config.resolver.unstable_enableSymlinks = true;

// 5. Use extraNodeModules to map workspace packages explicitly
config.resolver.extraNodeModules = {
  '@hifzhub/api': path.resolve(monorepoRoot, 'packages/api'),
  '@hifzhub/database': path.resolve(monorepoRoot, 'packages/database'),
  '@hifzhub/validators': path.resolve(monorepoRoot, 'packages/validators'),
};

// 6. Wrap with NativeWind for Tailwind CSS support
module.exports = withNativeWind(config, { input: './app/global.css' });
