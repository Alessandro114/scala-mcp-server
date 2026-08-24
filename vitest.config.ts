import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reporter: ['text', 'lcov'],
            // Non 100 perche main() e la guardia sull'entry point girano solo
            // quando il processo E il server: coprirle vorrebbe dire avviare
            // un trasporto stdio dentro un test, cioe provare Node, non noi.
            // Tutto il resto e al 100% ed e li che la soglia morde.
            thresholds: { statements: 98, branches: 98, functions: 92, lines: 98 },
        },
    },
});
