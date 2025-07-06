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
        // Palette moderne et sophistiquée pour l'interface bancaire
        'primary': {
          50: '#f0f9ff',   // Bleu cristallin
          100: '#e0f2fe',  // Bleu nacré
          200: '#bae6fd',  // Bleu ciel
          300: '#7dd3fc',  // Bleu azur
          400: '#38bdf8',  // Bleu électrique
          500: '#0ea5e9',  // Bleu océan (principal)
          600: '#0284c7',  // Bleu marine
          700: '#0369a1',  // Bleu profond
          800: '#075985',  // Bleu nuit
          900: '#0c4a6e',  // Bleu abyssal
          950: '#083344',  // Bleu très sombre
        },
        'secondary': {
          50: '#fdf4ff',   // Violet nacré
          100: '#fae8ff',  // Violet cristal
          200: '#f3e8ff',  // Violet pastel
          300: '#e9d5ff',  // Violet tendre
          400: '#d8b4fe',  // Violet doux
          500: '#c084fc',  // Violet moderne (principal)
          600: '#a855f7',  // Violet intense
          700: '#9333ea',  // Violet royal
          800: '#7c3aed',  // Violet impérial
          900: '#6b21a8',  // Violet majestueux
          950: '#4c1d95',  // Violet très sombre
        },
        'accent': {
          50: '#fff7ed',   // Orange pêche
          100: '#ffedd5',  // Orange abricot
          200: '#fed7aa',  // Orange caramel
          300: '#fdba74',  // Orange cuivre
          400: '#fb923c',  // Orange mandarine
          500: '#f97316',  // Orange soleil (principal)
          600: '#ea580c',  // Orange flamme
          700: '#c2410c',  // Orange feu
          800: '#9a3412',  // Orange braise
          900: '#7c2d12',  // Orange ember
          950: '#6c2e1f',  // Orange très sombre
        },
        'success': {
          50: '#f0fdf4',   // Vert menthe
          100: '#dcfce7',  // Vert jade
          200: '#bbf7d0',  // Vert émeraude
          300: '#86efac',  // Vert malachite
          400: '#4ade80',  // Vert vif
          500: '#22c55e',  // Vert nature (principal)
          600: '#16a34a',  // Vert forêt
          700: '#15803d',  // Vert profond
          800: '#166534',  // Vert sombre
          900: '#14532d',  // Vert très sombre
          950: '#0f2027',  // Vert abyssal
        },
        'warning': {
          50: '#fffbeb',   // Jaune crème
          100: '#fef3c7',  // Jaune vanille
          200: '#fde68a',  // Jaune doré
          300: '#fcd34d',  // Jaune miel
          400: '#fbbf24',  // Jaune ambre
          500: '#f59e0b',  // Jaune solaire (principal)
          600: '#d97706',  // Jaune curcuma
          700: '#b45309',  // Jaune bronze
          800: '#92400e',  // Jaune cuivre
          900: '#78350f',  // Jaune sombre
          950: '#451a03',  // Jaune très sombre
        },
        'danger': {
          50: '#fef2f2',   // Rouge rosé
          100: '#fee2e2',  // Rouge poudré
          200: '#fecaca',  // Rouge corail
          300: '#fca5a5',  // Rouge saumon
          400: '#f87171',  // Rouge cerise
          500: '#ef4444',  // Rouge écarlate (principal)
          600: '#dc2626',  // Rouge cardinal
          700: '#b91c1c',  // Rouge sang
          800: '#991b1b',  // Rouge bordeaux
          900: '#7f1d1d',  // Rouge très sombre
          950: '#450a0a',  // Rouge abyssal
        },
        // Couleurs neutres raffinées
        'neutral': {
          50: '#fafafa',   // Blanc cassé
          100: '#f5f5f5',  // Gris perle
          200: '#e5e5e5',  // Gris argent
          300: '#d4d4d4',  // Gris platine
          400: '#a3a3a3',  // Gris acier
          500: '#737373',  // Gris graphite (principal)
          600: '#525252',  // Gris anthracite
          700: '#404040',  // Gris charbon
          800: '#262626',  // Gris ébène
          900: '#171717',  // Gris obsidienne
          950: '#0a0a0a',  // Gris très sombre
        },
        // Couleurs spécialisées pour l'interface bancaire
        'financial': {
          'profit': '#10b981',    // Vert profit
          'loss': '#ef4444',      // Rouge perte
          'neutral': '#6b7280',   // Gris neutre
          'pending': '#f59e0b',   // Orange en attente
          'approved': '#059669',  // Vert approuvé
          'rejected': '#dc2626',  // Rouge rejeté
        },
        // Couleurs d'interaction modernes
        'interactive': {
          'hover': '#0ea5e9',     // Bleu hover
          'focus': '#8b5cf6',     // Violet focus
          'active': '#f97316',    // Orange active
          'disabled': '#9ca3af',  // Gris désactivé
        },
        // Alias pour compatibilité avec le code existant
        'bank-primary': '#0ea5e9',    // primary-500 - Bleu océan
        'bank-secondary': '#0369a1',  // primary-700 - Bleu profond
        'bank-accent': '#f97316',     // accent-500 - Orange soleil
        // Couleurs de gradient pour effets sophistiqués
        'gradient': {
          'ocean': '#0ea5e9',     // Bleu océan
          'aurora': '#8b5cf6',    // Violet aurora
          'sunset': '#f97316',    // Orange sunset
          'emerald': '#10b981',   // Vert émeraude
          'rose': '#f43f5e',      // Rose moderne
        },
      },      // Animations et transitions sophistiquées
      animation: {
        // Animations de base
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-left': 'slideLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Animations interactives
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        
        // Animations d'effets visuels
        'glow': 'glow 3s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        
        // Animations de chargement
        'spin-slow': 'spin 2s linear infinite',
        'loading-dots': 'loadingDots 1.5s ease-in-out infinite',
        'progress': 'progress 2s ease-in-out infinite',
        
        // Animations de notification
        'notification-in': 'notificationIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'notification-out': 'notificationOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Animations de cartes
        'card-hover': 'cardHover 0.3s ease-out',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        
        // Animations de boutons
        'button-press': 'buttonPress 0.1s ease-out',
        'button-success': 'buttonSuccess 0.6s ease-out',
      },
      keyframes: {
        // Animations de base
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        
        // Animations interactives
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        heartbeat: {
          '0%, 50%, 100%': { transform: 'scale(1)' },
          '25%, 75%': { transform: 'scale(1.05)' },
        },
        
        // Animations d'effets visuels
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.3), 0 0 10px rgba(14, 165, 233, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.6), 0 0 30px rgba(14, 165, 233, 0.4)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.8), 0 0 30px rgba(14, 165, 233, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(3deg)' },
          '75%': { transform: 'rotate(-3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        
        // Animations de chargement
        loadingDots: {
          '0%, 20%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        
        // Animations de notification
        notificationIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(100%) scale(0.8)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0) scale(1)' 
          },
        },
        notificationOut: {
          '0%': { 
            opacity: '1', 
            transform: 'translateX(0) scale(1)' 
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateX(100%) scale(0.8)' 
          },
        },
        
        // Animations de cartes
        cardHover: {
          '0%': { transform: 'translateY(0) rotateX(0)' },
          '100%': { transform: 'translateY(-8px) rotateX(5deg)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0)' },
          '50%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        
        // Animations de boutons
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        buttonSuccess: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },      // Gradients sophistiqués et modernes
      backgroundImage: {
        // Gradients principaux
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        
        // Gradients de succès, warning et danger
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
        
        // Gradients multicolores sophistiqués
        'gradient-ocean': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f97316 0%, #f59e0b 30%, #ef4444 70%, #ec4899 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'gradient-royal': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        
        // Gradients pour cartes et composants
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-card-dark': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'gradient-card-hover': 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        'gradient-card-dark-hover': 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
        
        // Gradients de fond
        'gradient-bg-light': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
        'gradient-bg-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        
        // Gradients pour boutons
        'gradient-btn-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-btn-secondary': 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
        'gradient-btn-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-btn-warning': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-btn-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        
        // Gradients pour animations
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'gradient-loading': 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        
        // Gradients radiaux
        'gradient-radial-primary': 'radial-gradient(circle at center, #0ea5e9 0%, #0284c7 70%, #0369a1 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at center, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
      },      // Ombres sophistiquées et modernes
      boxShadow: {
        // Ombres de base
        'soft': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'extra-strong': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        
        // Ombres colorées avec glow
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.4), 0 0 40px rgba(14, 165, 233, 0.2)',
        'glow-secondary': '0 0 20px rgba(192, 132, 252, 0.4), 0 0 40px rgba(192, 132, 252, 0.2)',
        'glow-accent': '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
        
        // Ombres pour cartes et composants
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 25px -8px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)',
        'card-elevated': '0 12px 32px -8px rgba(0, 0, 0, 0.2), 0 8px 24px -8px rgba(0, 0, 0, 0.12)',
        
        // Ombres pour boutons
        'button': '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.08)',
        'button-active': '0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        
        // Ombres intérieures
        'inner-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
        'inner-medium': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'inner-strong': 'inset 0 4px 8px rgba(0, 0, 0, 0.15)',
        
        // Ombres pour inputs
        'input': '0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(0, 0, 0, 0.05)',
        'input-focus': '0 0 0 3px rgba(14, 165, 233, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
        
        // Ombres pour dropdowns et modals
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        
        // Ombres pour navigation
        'navbar': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.1)',
        
        // Ombres spéciales
        'none': 'none',
        'outline-primary': '0 0 0 3px rgba(14, 165, 233, 0.5)',
        'outline-danger': '0 0 0 3px rgba(239, 68, 68, 0.5)',
        'outline-success': '0 0 0 3px rgba(34, 197, 94, 0.5)',
      },      // Bordures arrondies sophistiquées
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',     // 2px
        'default': '0.25rem', // 4px
        'md': '0.375rem',     // 6px
        'lg': '0.5rem',       // 8px
        'xl': '0.75rem',      // 12px
        'xl2': '1rem',        // 16px
        'xl3': '1.5rem',      // 24px
        'xl4': '2rem',        // 32px
        'xl5': '2.5rem',      // 40px
        'xl6': '3rem',        // 48px
        'full': '9999px',
      },
      // Espacement personnalisé
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
        '144': '36rem',   // 576px
      },
      // Largeurs et hauteurs personnalisées
      width: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      height: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      // Tailles d'écran personnalisées
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      // Opacité personnalisée
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      // Z-index personnalisé
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Transitions personnalisées
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
