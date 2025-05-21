const path = require('path')

export default {
  root: './src', // Set the root to your source directory
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'src/js/app.js'),
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
    outDir: path.resolve(__dirname, 'assets'), // Output to the assets directory of your Shopify theme
    assetsDir: '', // Ensure assets don't get nested in another directory
    cssCodeSplit: false, // Ensure CSS is bundled with the entry point, producing an app.css
    sourcemap: false, // Disable sourcemaps (or adjust as needed for your development preferences)
    assetsInlineLimit: 0, // Disable inlining of assets
  },
}
