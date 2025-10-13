import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export const AnimatedTestimonials = ({ testimonials, autoplay = true }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className="testimonials-aceternity">
      <div className="testimonials-wrapper">
        <div className="testimonials-content-wrapper">
          <div className="testimonials-images">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: index === active ? 1 : 0.7,
                    scale: index === active ? 1 : 0.95,
                    z: index === active ? 0 : -100,
                    rotate: index === active ? 0 : randomRotateY(),
                    zIndex: index === active ? 999 : testimonials.length + 2 - index,
                    y: index === active ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeInOut',
                  }}
                  className="testimonial-image"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    className="testimonial-img"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="testimonials-text-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <h3 className="testimonial-name">{testimonials[active].name}</h3>
                <p className="testimonial-designation">
                  {testimonials[active].designation}
                </p>
                <motion.p
                  className="testimonial-quote"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {testimonials[active].quote}
                </motion.p>
              </motion.div>
            </AnimatePresence>
            <div className="testimonials-controls">
              <button
                onClick={handlePrev}
                className="testimonial-control-btn"
                aria-label="Previous testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="testimonial-control-btn"
                aria-label="Next testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
