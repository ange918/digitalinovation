import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: "Émile",
    role: "Gérant de Extra Menuiserie",
    content: "La charte graphique réalisée par l'équipe de Digital Innovation a donné une nouvelle vie à mon entreprise.",
    image: null
  },
  {
    name: "Sophie",
    role: "Directrice Marketing",
    content: "Digital Innovation a transformé notre présence en ligne avec un site web moderne et performant. Leur expertise est impressionnante.",
    image: null
  },
  {
    name: "Marc",
    role: "CEO Startup Tech",
    content: "L'accompagnement de Digital Innovation nous a permis de lancer notre application mobile en temps record. Une équipe réactive et créative.",
    image: null
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-content">
          <div className="testimonials-header">
            <h2 className="section-title testimonials-title">
              Découvrez ce que nos clients disent de nous.
            </h2>
            <p className="testimonials-subtitle">
              Ne vous contentez pas de nous croire sur parole. Découvrez ce que nos clients disent de nous et de nos services.
            </p>
          </div>

          <div className="testimonials-cards">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="testimonial-card-wrapper"
              >
                <div className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="testimonial-avatar">
                      {testimonials[currentIndex].name.charAt(0)}
                    </div>
                    <div className="testimonial-info">
                      <h3>{testimonials[currentIndex].name}</h3>
                      <p>{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                  <p className="testimonial-content">
                    {testimonials[currentIndex].content}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="testimonials-nav">
              <button onClick={prevTestimonial} className="testimonial-nav-btn" aria-label="Précédent">
                ←
              </button>
              <div className="testimonials-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`testimonial-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Témoignage ${index + 1}`}
                  />
                ))}
              </div>
              <button onClick={nextTestimonial} className="testimonial-nav-btn" aria-label="Suivant">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
