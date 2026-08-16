/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed-dim": "#cdd3ef",
        "tertiary-container": "#e1d8fa",
        "primary-dim": "#4b5268",
        "secondary-fixed-dim": "#e9d0b7",
        "secondary-fixed": "#f7dec4",
        "secondary-container": "#f7dec4",
        "on-background": "#2b3437",
        "tertiary-fixed": "#e1d8fa",
        "tertiary": "#615b77",
        "inverse-primary": "#dbe1fd",
        "tertiary-dim": "#554f6b",
        "inverse-surface": "#0c0f10",
        "surface-container-lowest": "#ffffff",
        "error": "#9f403d",
        "surface-variant": "#dbe4e7",
        "surface-bright": "#f8f9fa",
        "outline": "#737c7f",
        "on-secondary-container": "#604f3b",
        "on-tertiary-container": "#504b66",
        "surface-container": "#eaeff1",
        "outline-variant": "#abb3b7",
        "inverse-on-surface": "#9b9d9e",
        "surface-tint": "#575e75",
        "on-tertiary-fixed-variant": "#5a5470",
        "error-container": "#fe8983",
        "error-dim": "#4e0309",
        "surface-container-low": "#f1f4f6",
        "on-tertiary-fixed": "#3e3852",
        "on-secondary-fixed-variant": "#6a5844",
        "on-secondary": "#fff7f3",
        "tertiary-fixed-dim": "#d3caeb",
        "on-surface": "#2b3437",
        "surface-container-highest": "#dbe4e7",
        "primary-fixed": "#dbe1fd",
        "on-surface-variant": "#586064",
        "on-tertiary": "#fdf7ff",
        "surface-dim": "#d1dce0",
        "surface-container-high": "#e3e9ec",
        "on-error": "#fff7f6",
        "primary-container": "#dbe1fd",
        "on-primary-fixed": "#383f55",
        "secondary": "#6e5c48",
        "on-secondary-fixed": "#4c3d2a",
        "on-primary-container": "#4a5168",
        "on-primary-fixed-variant": "#545b72",
        "on-error-container": "#752121",
        "secondary-dim": "#61503c",
        "accent": "#B4975A", // Prestigious Gold
        // primary / on-primary / background / surface are defined in
        // styles.scss via Tailwind v4's @theme block (the canonical
        // v4-native way) — kept out of here to avoid two conflicting
        // sources of truth for the same tokens.
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
      fontFamily: {
        "headline": ["Manrope"],
        "body": ["Inter"],
        "label": ["Inter"],
        "serif": ["Noto Serif", "serif"],
        "sans": ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}