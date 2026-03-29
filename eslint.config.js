import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["src/hacks/"] },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
  ...tseslint.configs.recommended,
  { files: ["**/*.ts"], languageOptions: { globals: globals.node } },
  eslintConfigPrettier,
]);
