import { Mail } from './Icons';
import CircularOrbit from './CircularOrbit';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Agence web<br />
            <span className="accent">Digital Innovation.</span>
          </h1>
          <p className="hero-subtitle">
            Entrepreneurs, TPE, PME, startups SaaS : on vous propulse dans l'ère du digital.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-outline">En savoir plus</button>
            <button className="btn btn-outline btn-icon">
              <Mail size={20} />
              Contact
            </button>
          </div>
        </div>
        <div className="hero-graphics">
          <CircularOrbit />
        </div>
      </div>
    </section>
  );
}
