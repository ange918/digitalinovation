/**
 * FASHLINK — Design System
 * Susuni Lab, Cotonou.
 *
 * Direction artistique « L'Atelier » : le vocabulaire du plan de coupe et de
 * la page imprimee. Papier chaud plutot que blanc pur, encre bleu nuit,
 * grille aeree, et surtout AUCUNE ombre portee — la hierarchie tient au filet
 * 1 px et au poids typographique.
 *
 * Trois regles tiennent la direction :
 *  1. Le bleu roi est un accent, jamais un aplat. Il couvre moins de ~2 % d'un
 *     ecran : action primaire, lien actif, etat selectionne.
 *  2. Aucune ombre. Un ecran qui a besoin d'une ombre a besoin d'un filet.
 *  3. Jamais deux filets a moins de 24 px l'un de l'autre — au-dela, l'ecran
 *     devient une grille de mots croises.
 *
 * Emprunt assume a la direction « Registre » : le statut de validation
 * FASHLINK est le coeur du produit, il a ses deux couleurs dediees (ambre en
 * attente, vert publie) et elles ne servent a rien d'autre.
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
          50: '#E8F4FB',
          100: '#CCE7F6',
          200: '#99CFEC',
          300: '#5FB2DF',
          400: '#2593CE',
          500: '#0078B7', // couleur de marque Susuni Lab
          600: '#00669C',
          700: '#005480',
          800: '#004164',
          900: '#00304A',
          DEFAULT: '#0078B7',
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
          800: '#1F2745',
          900: '#1B2441', // couleur de marque Susuni Lab
          950: '#11162B',
          DEFAULT: '#1B2441',
        },
        // --- Papier : fonds et bordures, chauds et non gris -----------------
        // Le passage du gris froid (#F9FAFB) au papier chaud est le seul
        // changement qui se voit a l'oeil nu d'un bout a l'autre du produit.
        canvas: {
          DEFAULT: '#FBFAF8', // papier, jamais blanc pur
          alt: '#F4F2ED', // fonds de section, lignes alternees
          warm: '#F4F2ED',
        },
        ink: {
          DEFAULT: '#1B2441', // texte principal — 15,4:1 sur papier
          muted: '#4A4F63', // texte secondaire — 8,6:1
          subtle: '#8A8FA0', // legendes, meta — 3,3:1, reserve au non-essentiel
          faint: '#B4B8C5', // placeholders uniquement, jamais porteur de sens
        },
        line: {
          DEFAULT: '#E4E0D8', // filet standard : l'element structurant n°1
          strong: '#D3CEC2',
          subtle: '#EFEDE6',
        },
        // --- Statuts ---------------------------------------------------------
        // `warning` porte « en validation FASHLINK » et `success` « publiee ».
        // Les deux teintes 500 sont assombries par rapport aux precedentes pour
        // passer AA en texte courant sur papier : #B57A1F n'y arrivait pas.
        success: { 50: '#EEF4F0', 500: '#1F6B43', 700: '#175233' },
        warning: { 50: '#F9F1E7', 500: '#A8620E', 700: '#864E0B' },
        danger: { 50: '#F9EFEE', 500: '#B3453F', 700: '#8A322D' },
      },

      fontFamily: {
        // Genova : police de marque Susuni Lab, chargee par <link> dans le
        // layout. Poppins auto-hebergee sert de repli si le CDN est injoignable.
        sans: ['Genova', 'var(--font-poppins)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Echelle editoriale : titres genereux, interlignage serre en display.
        'display-xl': ['4.5rem', { lineHeight: '1.04', letterSpacing: '-0.015em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.07', letterSpacing: '-0.012em' }],
        'display-md': ['2.75rem', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
        'display-sm': ['2.125rem', { lineHeight: '1.18', letterSpacing: '-0.008em' }],
        'title-lg': ['1.625rem', { lineHeight: '1.28', letterSpacing: '-0.005em' }],
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
        // Presque des angles droits : le rectangle est la forme du patron de
        // couture et de la page imprimee. L'arrondi « bulle » est reserve aux
        // badges et aux jetons de filtre, ou il sert a distinguer une etiquette
        // d'un bouton.
        card: '0.25rem', // 4px
        panel: '0.375rem', // 6px
        pill: '9999px',
      },

      boxShadow: {
        // Une seule ombre subsiste, et ce n'est pas une ombre : l'anneau de
        // focus. Tout le reste a ete retire — une surface qui appelait une
        // ombre appelle en realite un filet.
        focus: '0 0 0 3px rgba(0, 120, 183, 0.22)',
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
