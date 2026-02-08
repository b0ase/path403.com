import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        display: ['var(--font-orbitron)', 'Orbitron', 'sans-serif'],
      },
      backgroundColor: {
        'surface': 'var(--bg-surface)',
        'surface-secondary': 'var(--bg-surface-secondary)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'muted': 'var(--text-muted)',
      },
      borderColor: {
        'primary': 'var(--border-primary)',
      },
    },
  },
  plugins: [],
} satisfies Config;
