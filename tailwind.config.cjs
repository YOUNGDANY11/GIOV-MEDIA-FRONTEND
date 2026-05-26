module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        white: '#ffffff',
        'bg': '#070a12',
        'bg-2': '#0b1020',
        'surface': 'rgba(255,255,255,0.05)',
        'border': 'rgba(255,255,255,0.10)',
        'muted': '#9ca3af',
        'neon-from': '#6366f1',
        'neon-to': '#d946ef',
        'accent': '#56d7c8',
        'accent-2': '#7aa2ff',
      },
      borderRadius: {
        'xl-2': '24px',
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
};
