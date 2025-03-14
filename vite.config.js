import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    root: path.resolve(__dirname, 'src'),
    assetsDir: path.resolve(__dirname, 'public'),
    build: {
        modulePreload: false,
        emptyOutDir: true,
        outDir: path.resolve(__dirname, 'dist'),
        assetsDir: './',
        target: ['es2020']
    }
});