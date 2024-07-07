const path = require('path');
module.exports = {
  webpack: {
    alias: {
        '@': path.resolve(__dirname, 'src'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@app': path.resolve(__dirname, 'src/components/app'),
        '@asset': path.resolve(__dirname, 'src/assets'),   
        '@common': path.resolve(__dirname, 'src/components/common'),
        '@image': path.resolve(__dirname, 'src/assets/images'),   
        '@landing': path.resolve(__dirname, 'src/components/landing'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@page': path.resolve(__dirname, 'src/pages'),
        '@style': path.resolve(__dirname, 'src/assets/styles'),
        '@theme': path.resolve(__dirname, 'src/assets/styles/themes'),
        '@ui': path.resolve(__dirname, 'src/components/ui'),
    },
  },
};