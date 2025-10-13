import { Code, Design, Mobile } from './Icons';

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
          <div className="tech-icon floating" style={{ animationDelay: '0s' }}>
            <Code size={60} />
          </div>
          <div className="tech-icon floating" style={{ animationDelay: '0.5s' }}>
            <Design size={50} />
          </div>
          <div className="tech-icon floating" style={{ animationDelay: '1s' }}>
            <Mobile size={55} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Mail({ size }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
