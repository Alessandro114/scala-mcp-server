import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reporter: ['text', 'lcov'],
            // 100 su tutto. main() e la guardia sull entry point sono marcate
            // con "v8 ignore" e verificate da test/avvio.test.ts, che lancia
            // l eseguibile come processo separato: lo strumento misura il
            // processo dei test, non i figli.
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
        },
    },
});
