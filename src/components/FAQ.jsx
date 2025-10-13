import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Quels types de projets Digital Innovation prend en charge ?",
    answer: "Nous prenons en charge une large gamme de projets digitaux : sites web, applications mobiles, e-commerce, branding, stratégie digitale, et bien plus encore. Que vous soyez une startup, TPE, PME ou grande entreprise, nous adaptons nos services à vos besoins."
  },
  {
    question: "Combien de temps faut-il pour terminer un projet ?",
    answer: "La durée d'un projet varie selon sa complexité et vos besoins. Un site vitrine peut prendre 2-4 semaines, tandis qu'une application complexe peut nécessiter 2-6 mois. Nous vous fournirons un planning détaillé après analyse de votre projet."
  },
  {
    question: "Est-ce que Digital Innovation travaille avec des entreprises à l'étranger ?",
    answer: "Absolument ! Nous travaillons avec des clients partout dans le monde. Grâce aux outils de communication modernes, nous assurons une collaboration efficace quelle que soit votre localisation."
  },
  {
    question: "Proposez-vous des services personnalisés selon les besoins ?",
    answer: "Oui, tous nos services sont entièrement personnalisables. Nous prenons le temps de comprendre vos objectifs spécifiques et créons des solutions sur mesure qui répondent parfaitement à vos attentes."
  },
  {
    question: "Quels sont les coûts pour vos services ?",
    answer: "Nos tarifs varient en fonction de la complexité du projet, des fonctionnalités requises et du temps nécessaire. Nous offrons des devis gratuits et détaillés après une première consultation pour comprendre vos besoins."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <div className="container">
        <div className="faq-content">
          <div className="faq-left">
            <h2 className="section-title accent">Questions fréquemment posées</h2>
            <button className="btn btn-outline">
              Plus d'information
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div className="faq-right">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="faq-number">{index + 1}</span>
                  <span className="faq-question-text">{faq.question}</span>
                  <motion.span
                    className="faq-icon"
                    animate={{ rotate: activeIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="faq-answer"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
