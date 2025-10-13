// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Messenger-style theme colors
        messenger: {
          bg: '#f0f2f5',
          panel: '#ffffff',
          sidebar: '#ffffff',
          accent: '#1877f2',
          'accent-hover': '#166fe5',
          text: '#1c1e21',
          'text-muted': '#65676b',
          border: '#dadde1',
          hover: '#f5f6f7',
          'chat-bg': '#f0f2f5',
          'message-sent': '#1877f2',
          'message-received': '#ffffff',
          online: '#42b883',
          shadow: 'rgba(0, 0, 0, 0.1)',
        },
        // Legacy colors for compatibility
        accent: {
          electric: '#00F5FF',
          plasma: '#FF0080',
          quantum: '#8B5CF6',
          neon: '#39FF14',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        neon: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cyber: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        'messenger': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'cyber': ['Orbitron', 'monospace'],
        'futura': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'matrix': 'matrix 20s linear infinite',
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 1.5s ease-in-out infinite alternate',
        'gradient-border': 'gradient-border 3s ease-in-out infinite',
        'float-animation': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #A855F7, 0 0 10px #A855F7, 0 0 15px #A855F7' },
          '100%': { boxShadow: '0 0 10px #A855F7, 0 0 20px #A855F7, 0 0 30px #A855F7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'cyber-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'gradient-border': {
          '0%': { 
            borderColor: '#A855F7',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
          },
          '50%': { 
            borderColor: '#22D3EE',
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
          },
          '100%': { 
            borderColor: '#A855F7',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.7',
            transform: 'scale(1.05)'
          },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(168,85,247,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.05) 1px, transparent 1px)',
        'neon-gradient': 'linear-gradient(45deg, #A855F7, #22D3EE)',
        'quantum-gradient': 'linear-gradient(135deg, #A855F7 0%, #22D3EE 100%)',
        'plasma-gradient': 'linear-gradient(45deg, #A855F7, #22D3EE)',
        'matrix-gradient': 'linear-gradient(180deg, #0B0A12 0%, #1e293b 50%, #334155 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(168, 85, 247, 0.3)',
        'neon': '0 0 30px rgba(34, 211, 238, 0.3)',
        'quantum': '0 0 40px rgba(168, 85, 247, 0.2)',
        'plasma': '0 0 25px rgba(34, 211, 238, 0.2)',
        'glow': '0 0 50px rgba(168, 85, 247, 0.2)',
        'inner-glow': 'inset 0 0 20px rgba(168, 85, 247, 0.1)',
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
