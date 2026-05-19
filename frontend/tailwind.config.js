/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F4EF',
        cream: '#FFFDF8',
        paper: '#FFFFFF',
        ink: '#2F3A4B',
        muted: '#6B7280',
        brand: '#4F8CFF',
        mint: '#7CC6A6',
        peach: '#FFB86B',
        danger: '#FF7B7B',
        lilac: '#DCCDF5',
        sky: '#EAF2FF',
        sand: '#FFF6EA',
        mist: '#F3F7FF'
      },
      boxShadow: {
        soft: '0 18px 44px rgba(47, 58, 75, 0.08)',
        float: '0 28px 70px rgba(79, 140, 255, 0.16)',
        glow: '0 0 0 1px rgba(255,255,255,0.7), 0 22px 50px rgba(47, 58, 75, 0.08)',
        panel: '0 30px 90px rgba(47, 58, 75, 0.12)',
        ambient: '0 16px 50px rgba(124, 198, 166, 0.18)'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem'
      },
      backgroundImage: {
        'paper-grid':
          'radial-gradient(circle at 1px 1px, rgba(47,58,75,0.04) 1px, transparent 0)',
        linen:
          'linear-gradient(125deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%), linear-gradient(315deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 45%)'
      },
      backgroundSize: {
        grid: '22px 22px'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        bob: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' }
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0px, 0px, 0)' },
          '50%': { transform: 'translate3d(0px, -12px, 0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        bob: 'bob 4s ease-in-out infinite',
        drift: 'drift 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 5s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite'
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
