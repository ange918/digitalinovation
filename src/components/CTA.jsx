import ctaBg from '../assets/images/cta-bg.jpg';

export default function CTA() {
  return (
    <section className="cta" style={{ backgroundImage: `url(${ctaBg})` }}>
      <div className="cta-overlay"></div>
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title accent">
            Prêt à transformer vos idées en succès digital ?
          </h2>
          <p className="cta-text">
            Faites le premier pas aujourd'hui. Contactez notre équipe d'experts pour discuter de votre projet et découvrir comment nous pouvons vous aider à atteindre vos objectifs.
          </p>
          <button className="btn btn-primary btn-large">
            Parlez nous de votre projet
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
