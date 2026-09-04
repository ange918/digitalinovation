/**
 * FASHLINK — Design System
 * Susuni Lab, Cotonou.
 *
 * Direction artistique : magazine de mode contemporain. Beaucoup de blanc,
 * une typographie serif affirmee pour les titres, une grille tres aeree,
 * des bordures fines plutot que des ombres lourdes.
 *
 * Regle de sobriete : le bleu roi est un ACCENT, pas un aplat. Il ne couvre
 * jamais plus de ~10 % d'un ecran (boutons primaires, liens, focus, actifs).
 * Le bleu nuit porte le texte et les surfaces sombres.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Conteneur editorial : large mais jamais pleine largeur sur grand ecran.
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem', // 20px — respiration minimale sur mobile
        sm: '1.5rem',
        lg: '2.5rem',
        xl: '4rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // --- Bleu roi : couleur d'action ------------------------------------
        royal: {
          50: '#EEF6FC',
          100: '#D6EAF7',
          200: '#AFD5EF',
          300: '#7FBBE4',
          400: '#4A9BD4',
          500: '#1A7BBF', // couleur de marque
          600: '#1666A1',
          700: '#125283',
          800: '#0E3F65',
          900: '#0A2E4A',
          DEFAULT: '#1A7BBF',
        },
        // --- Bleu nuit : couleur de texte et de surface sombre --------------
        midnight: {
          50: '#F2F3F7',
          100: '#E1E3EC',
          200: '#C2C6D8',
          300: '#9AA0BC',
          400: '#6B7398',
          500: '#474E78',
          600: '#333A5E',
          700: '#262C4B',
          800: '#1E2440',
          900: '#1A2044', // couleur de marque
          950: '#11142B',
          DEFAULT: '#1A2044',
        },
        // --- Neutres chauds : fonds et bordures -----------------------------
        canvas: {
          DEFAULT: '#F9FAFB', // fond d'application
          alt: '#F8F9FA',
          warm: '#FAFAF8', // fond des sections editoriales
        },
        ink: {
          DEFAULT: '#1A2044', // texte principal
          muted: '#5B6178', // texte secondaire
          subtle: '#8A8FA3', // legendes, meta
          faint: '#B4B8C5', // placeholders
        },
        line: {
          DEFAULT: '#E8EAEF', // bordure standard
          strong: '#D5D8E1',
          subtle: '#F0F1F5',
        },
        // --- Statuts : desatures pour rester dans la sobriete ---------------
        success: { 50: '#EDF7F1', 500: '#2E7D5B', 700: '#1F5B41' },
        warning: { 50: '#FDF6EC', 500: '#B57A1F', 700: '#8A5C13' },
        danger: { 50: '#FBEFEF', 500: '#B3453F', 700: '#8A322D' },
      },

      fontFamily: {
        // DM Serif Display : reserve aux h1/h2, signature editoriale.
        serif: ['var(--font-dm-serif)', 'Georgia', 'Cambria', 'serif'],
        // Poppins : geometrique, alignee sur l'identite Susuni Lab.
        sans: ['var(--font-poppins)', 'Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Echelle editoriale : titres genereux, interlignage serre en display.
        'display-xl': ['4.5rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'title-lg': ['1.625rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'title-md': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.7' }],
        body: ['0.96875rem', { lineHeight: '1.68' }],
        'body-sm': ['0.90625rem', { lineHeight: '1.62' }],
        caption: ['0.8125rem', { lineHeight: '1.5' }],
        // Micro-label majuscule : categories, eyebrows, meta.
        overline: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      },

      spacing: {
        // Rythme vertical des sections editoriales.
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        section: '5.5rem',
        'section-lg': '8rem',
      },

      borderRadius: {
        // Angles doux mais jamais arrondis « bulle » : on reste sur du sobre.
        card: '0.875rem',
        panel: '1.25rem',
        pill: '9999px',
      },

      boxShadow: {
        // Ombres tres basses opacites, teintees bleu nuit et non noir pur :
        // c'est ce qui donne l'impression « papier glace » plutot que « web ».
        subtle: '0 1px 2px 0 rgba(26, 32, 68, 0.04)',
        card: '0 1px 3px rgba(26, 32, 68, 0.05), 0 8px 24px -12px rgba(26, 32, 68, 0.08)',
        'card-hover': '0 2px 6px rgba(26, 32, 68, 0.06), 0 16px 40px -16px rgba(26, 32, 68, 0.14)',
        panel: '0 4px 12px rgba(26, 32, 68, 0.05), 0 24px 56px -24px rgba(26, 32, 68, 0.16)',
        // Bouton primaire : legere elevation coloree.
        royal: '0 2px 8px -2px rgba(26, 123, 191, 0.4)',
        // Anneau de focus accessible, reutilise partout.
        focus: '0 0 0 3px rgba(26, 123, 191, 0.22)',
        none: 'none',
      },

      transitionTimingFunction: {
        // Courbe unique pour toute la plateforme : sortie douce, sans rebond.
        editorial: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      transitionDuration: {
        150: '150ms',
        250: '250ms',
      },

      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },

      maxWidth: {
        // Longueur de ligne confortable pour les descriptions d'offres.
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
