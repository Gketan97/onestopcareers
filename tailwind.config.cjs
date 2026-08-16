/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':        'var(--bg-base)',
        'bg-surface':     'var(--bg-surface)',
        'bg-sunken':      'var(--bg-sunken)',
        'accent':         'var(--accent)',
        'accent-soft':    'var(--accent-soft)',
        'accent-border':  'var(--accent-border)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary':  'var(--text-tertiary)',
        'border-subtle':  'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'green':  'var(--green)',
        'amber':  'var(--amber)',
        'gray':   'var(--gray)',
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        mono:    ['DM Mono', 'monospace'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
}
