import { useState } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';
import mockupImage from '../assets/images/mockup-1.png';

const portfolioItems = [
  {
    id: 1,
    title: 'Virtual Edge Agency',
    image: mockupImage,
    description: 'Solutions digitales créatives'
  },
  {
    id: 2,
    title: 'Cefora Formation',
    image: mockupImage,
    description: 'Centre de formation professionnelle'
  }
];

export default function Portfolio() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === portfolioItems.length - 2 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? portfolioItems.length - 2 : prev - 1));
  };

  return (
    <section className="portfolio">
      <div className="container">
        <div className="portfolio-header">
          <h2 className="section-title accent">Voir les réalisations<br />de Digital Innovation</h2>
          <button className="btn btn-outline">
            Voir nos services
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div className="portfolio-carousel">
          <button className="carousel-btn carousel-btn-prev" onClick={prevSlide} aria-label="Précédent">
            <ChevronLeft size={32} />
          </button>

          <div className="portfolio-slides">
            <div className="portfolio-slide">
              <img 
                src={portfolioItems[currentIndex].image} 
                alt={portfolioItems[currentIndex].title}
                loading="lazy"
              />
            </div>
            <div className="portfolio-slide">
              <img 
                src={portfolioItems[currentIndex + 1]?.image || portfolioItems[0].image} 
                alt={portfolioItems[currentIndex + 1]?.title || portfolioItems[0].title}
                loading="lazy"
              />
            </div>
          </div>

          <button className="carousel-btn carousel-btn-next" onClick={nextSlide} aria-label="Suivant">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </section>
  );
}
