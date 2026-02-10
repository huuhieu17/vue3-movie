export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // `postcss-prefixwrap` expects a string prefix. An array caused
    // `prefixSelector.replace is not a function` when PostCSS loaded.
    'postcss-prefixwrap': '.movie-remote',
  },
}
