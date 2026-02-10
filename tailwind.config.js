export default {
  // Prefix all generated Tailwind classes with `tw-` to avoid clashes with
  // existing CSS. Example: `tw-bg-red-500` instead of `bg-red-500`.
  prefix: 'tw-',
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
