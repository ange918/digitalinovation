// Digital Innovation - Script JavaScript
// Interactions et animations

document.addEventListener('DOMContentLoaded', function() {
  
  // Vérifier si l'utilisateur préfère un mouvement réduit
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================
  // Animation au défilement (Fade-up effect)
  // =====================================================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!prefersReducedMotion) {
          entry.target.classList.add('fade-up');
        }
        observer.unobserve(entry.target);
      }
    });
  };

  const scrollObserver = new IntersectionObserver(animateOnScroll, observerOptions);

  // Sélectionner les éléments à animer
  const animateElements = document.querySelectorAll(
    '.service-card, .workflow-card, .blog-card, .about-text, .portfolio-mockup'
  );

  animateElements.forEach(el => {
    if (!prefersReducedMotion) {
      el.style.opacity = '0';
      scrollObserver.observe(el);
    }
  });

  // =====================================================
  // Smooth scroll pour les liens d'ancrage
  // =====================================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // =====================================================
  // Gestion des boutons avec feedback tactile
  // =====================================================
  
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Créer un effet de ripple au clic
      if (!prefersReducedMotion) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          pointer-events: none;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      }
    });
  });

  // Ajouter l'animation CSS pour le ripple
  if (!document.querySelector('#ripple-animation')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =====================================================
  // Header scroll effect (optionnel)
  // =====================================================
  
  let lastScroll = 0;
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.style.background = 'rgba(7, 7, 7, 0.95)';
      header.style.boxShadow = '0 2px 10px rgba(0, 224, 106, 0.1)';
    } else {
      header.style.background = 'var(--bg-dark)';
      header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });

  // =====================================================
  // Chargement paresseux des images (lazy loading fallback)
  // =====================================================
  
  if ('loading' in HTMLImageElement.prototype) {
    // Le navigateur supporte le lazy loading natif
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.src; // Force le chargement si nécessaire
    });
  } else {
    // Fallback pour les navigateurs plus anciens
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src;
          img.removeAttribute('loading');
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // =====================================================
  // Gestion du focus clavier pour l'accessibilité
  // =====================================================
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });

  // Ajouter les styles pour la navigation au clavier
  if (!document.querySelector('#keyboard-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'keyboard-nav-styles';
    style.textContent = `
      body:not(.keyboard-navigation) *:focus {
        outline: none;
      }
      
      .keyboard-navigation *:focus {
        outline: 3px solid var(--accent-green);
        outline-offset: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  // =====================================================
  // Log de bienvenue dans la console
  // =====================================================
  
  console.log('%c Digital Innovation ', 'background: #00e06a; color: #070707; font-size: 20px; font-weight: bold; padding: 10px;');
  console.log('%c Agence web au Bénin - Propulsez votre entreprise dans l\'ère du digital ', 'color: #00e06a; font-size: 14px;');
  
});

// =====================================================
// Gestion des erreurs d'images
// =====================================================

document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    // Si une image ne charge pas, afficher un placeholder
    e.target.style.background = 'linear-gradient(135deg, #0c0d0e 0%, #1a1a1a 100%)';
    e.target.style.minHeight = '200px';
    e.target.alt = 'Image non disponible';
  }
}, true);
