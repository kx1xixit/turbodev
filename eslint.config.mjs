import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'build/'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // This line fixes the "document/performance is not defined" errors
        ...globals.browser,
        Scratch: 'readonly',
        // Cross-file globals defined in 01-init.js, consumed by later src files
        INDENT_STEP_PX: 'readonly',
        INDENT_STEP_TEXT: 'readonly',
        pxToIndent: 'readonly',
        THEMES: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        {
          args: 'none',
        },
      ],
      'no-console': 'off',
      'no-var': 'warn',
      'prefer-const': 'warn',
    },
  },
];