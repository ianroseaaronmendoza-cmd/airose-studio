import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ✅ Base Next.js + TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Ignore build/system folders
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // ✅ Custom rule overrides
  {
    rules: {
      // 🔕 Disable errors for apostrophes and quotes inside JSX
      "react/no-unescaped-entities": "off",

      // 🔕 Disable warnings for unused variables (temporary)
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
