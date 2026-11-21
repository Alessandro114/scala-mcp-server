import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // src/*.test.ts sono del server remoto e girano con node:test (npm run test:remote), non con vitest.
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            // Il server remoto (MCP_REMOTE=1) e le sue parti condivise sono provati da src/*.test.ts con node:test
            // (npm run test:remote), che questo strumento non misura: restano fuori dalla soglia numerica.
            exclude: ['src/**/*.test.ts', 'src/remote.ts', 'src/pagina.ts', 'src/annotations.ts', 'src/server.ts', 'src/api.ts'],
            reporter: ['text', 'lcov'],
            // 100 su tutto. main() e la guardia sull entry point sono marcate
            // con "v8 ignore" e verificate da test/avvio.test.ts, che lancia
            // l eseguibile come processo separato: lo strumento misura il
            // processo dei test, non i figli.
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
        },
    },
});
