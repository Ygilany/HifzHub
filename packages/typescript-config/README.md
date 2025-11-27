# @hifzhub/typescript-config

Shared TypeScript configuration for the HifzHub monorepo.

## Configs

- **base.json** - Base config for packages (api, database, validators, etc.)
- **nextjs.json** - Next.js web app configuration
- **react-native.json** - React Native/Expo mobile app configuration

## Usage

### For Packages (api, database, validators)

```json
{
  "extends": "@hifzhub/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### For Next.js Web App

```json
{
  "extends": "@hifzhub/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### For React Native/Expo Mobile App

```json
{
  "extends": "@hifzhub/typescript-config/react-native.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```
