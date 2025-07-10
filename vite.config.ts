import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2020',
        lib: {
            entry: 'src/index.js', // adjust to your entry file
            formats: ['es'],
            fileName: () => 'index.js', // no hash in filename
        },
        rollupOptions: {
            output: {
                entryFileNames: 'index.js',
                assetFileNames: '[name][extname]', // prevent hashed CSS names
            }
        }
    },
    css: {
        modules: false,
    }
});

