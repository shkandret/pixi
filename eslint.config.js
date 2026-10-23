import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'legacy-next', 'node_modules', '.next'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Границы слоёв (см. ARCHITECTURE.md). Нарушение = ошибка линтера, а не вопрос вкуса.
  {
    files: ['src/engine/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['@/games', '@/games/*', '**/games/**'], message: 'Движок не знает об играх. Передавай данные через GameDefinition.' }],
      }],
    },
  },
  {
    files: ['src/games/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/engine/*'], message: 'Импортируй только публичный API: `@/engine`.' },
          { group: ['@/games', '@/games/*'], message: 'Игры не импортируют друг друга. Куда вынести общий код — решает пользователь (см. CLAUDE.md, правило 11).' },
        ],
      }],
    },
  },
  {
    // Логика игры — чистый TypeScript: тестируется и переносится без рендера и React.
    files: ['src/games/*/logic/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'pixi.js', message: 'logic/ не зависит от рендера.' },
          { name: 'react', message: 'logic/ не зависит от UI.' },
        ],
        patterns: [{ group: ['@/engine', '@/engine/*'], message: 'logic/ не зависит от движка.' }],
      }],
    },
  },
);
