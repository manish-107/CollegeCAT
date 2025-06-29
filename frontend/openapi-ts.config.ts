import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: `${process.env.SERVER_URL}/openapi.json`,
  output: './app/client',
  plugins: ['@hey-api/client-axios', '@tanstack/react-query'],
});
