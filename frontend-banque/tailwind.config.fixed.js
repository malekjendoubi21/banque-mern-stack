/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bank-primary': '#1e40af',
        'bank-secondary': '#0ea5e9',
        'bank-accent': '#f59e0b',
        'dark-bg': '#1a202c',
        'dark-card': '#2d3748',
        'dark-text': '#edf2f7',
        // Palette Aurora Borealis - Créativité maximale ! 🌈
        'aurora': {
          50: '#f0fdff',   // Cyan très clair
          100: '#ccfbf1',  // Cyan clair
          200: '#99f6e4',  // Cyan moyen
          300: '#5eead4',  // Turquoise
          400: '#2dd4bf',  // Teal brillant
          500: '#14b8a6',  // Teal
          600: '#0d9488',  // Teal foncé
          700: '#0f766e',  // Teal très foncé
          800: '#115e59',  // Teal sombre
          900: '#134e4a',  // Teal très sombre
          950: '#042f2e',  // Teal noir
        },
        'nebula': {
          50: '#fdf4ff',   // Rose très clair
          100: '#fae8ff',  // Rose clair
          200: '#f5d0fe',  // Rose-violet clair
          300: '#f0abfc',  // Rose-violet
          400: '#e879f9',  // Magenta clair
          500: '#d946ef',  // Magenta
          600: '#c026d3',  // Violet-magenta
          700: '#a21caf',  // Violet foncé
          800: '#86198f',  // Violet très foncé
          900: '#701a75',  // Violet sombre
          950: '#4a044e',  // Violet noir
        },
        'cosmic': {
          50: '#fefce8',   // Jaune très clair
          100: '#fef9c3',  // Jaune clair
          200: '#fef08a',  // Jaune doré clair
          300: '#fde047',  // Jaune doré
          400: '#facc15',  // Or clair
          500: '#eab308',  // Or
          600: '#ca8a04',  // Or foncé
          700: '#a16207',  // Or très foncé
          800: '#854d0e',  // Bronze
          900: '#713f12',  // Bronze foncé
          950: '#422006',  // Bronze noir
        },
        'solar': {
          50: '#fff7ed',   // Orange très clair
          100: '#ffedd5',  // Orange clair
          200: '#fed7aa',  // Orange pêche
          300: '#fdba74',  // Orange
          400: '#fb923c',  // Orange vif
          500: '#f97316',  // Orange brillant
          600: '#ea580c',  // Orange foncé
          700: '#c2410c',  // Rouge-orange
          800: '#9a3412',  // Rouge-orange foncé
          900: '#7c2d12',  // Rouge foncé
          950: '#431407',  // Rouge noir
        },
      },
      backgroundImage: {
        // Dégradés Aurora Borealis spectaculaires ! 🌟
        'aurora-gradient': 'linear-gradient(135deg, #f0fdff 0%, #ccfbf1 25%, #5eead4 50%, #2dd4bf 75%, #14b8a6 100%)',
        'nebula-gradient': 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 25%, #f0abfc 50%, #e879f9 75%, #d946ef 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #fefce8 0%, #fef9c3 25%, #fde047 50%, #facc15 75%, #eab308 100%)',
        'solar-gradient': 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fb923c 50%, #f97316 75%, #ea580c 100%)',
        
        // Dégradés combinés magiques ✨
        'aurora-cosmic': 'linear-gradient(135deg, #f0fdff 0%, #5eead4 25%, #fde047 50%, #d946ef 75%, #14b8a6 100%)',
        'nebula-solar': 'linear-gradient(135deg, #fdf4ff 0%, #e879f9 25%, #fb923c 50%, #f97316 75%, #a21caf 100%)',
        'rainbow-aurora': 'linear-gradient(135deg, #f0fdff 0%, #fae8ff 16%, #fef9c3 33%, #fed7aa 50%, #f0abfc 66%, #5eead4 83%, #d946ef 100%)',
        
        // Dégradés mode sombre mystiques 🌙
        'dark-aurora': 'linear-gradient(135deg, #042f2e 0%, #115e59 25%, #134e4a 50%, #0f766e 75%, #0d9488 100%)',
        'dark-nebula': 'linear-gradient(135deg, #4a044e 0%, #701a75 25%, #86198f 50%, #a21caf 75%, #c026d3 100%)',
        'dark-cosmic': 'linear-gradient(135deg, #422006 0%, #713f12 25%, #854d0e 50%, #a16207 75%, #ca8a04 100%)',
        'dark-rainbow': 'linear-gradient(135deg, #042f2e 0%, #4a044e 16%, #422006 33%, #431407 50%, #701a75 66%, #115e59 83%, #86198f 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease-in-out infinite',
        'aurora-dance': 'aurora-dance 8s ease-in-out infinite',
        'cosmic-float': 'cosmic-float 10s ease-in-out infinite',
        'nebula-pulse': 'nebula-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'aurora-dance': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.7' },
          '33%': { transform: 'translateY(-20px) rotate(120deg)', opacity: '1' },
          '66%': { transform: 'translateY(10px) rotate(240deg)', opacity: '0.8' },
        },
        'cosmic-float': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-30px) scale(1.1)', opacity: '0.9' },
        },
        'nebula-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}