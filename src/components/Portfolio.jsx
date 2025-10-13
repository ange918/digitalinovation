import mockupImage from '../assets/images/mockup-1.png';

export default function Portfolio() {
  return (
    <section className="portfolio">
      <div className="container">
        <h2 className="section-title accent">Voir les réalisations de Digital Innovation</h2>
        <button className="btn btn-primary">Voir nos projets</button>
        <div className="portfolio-mockup">
          <img src={mockupImage} alt="Exemple de réalisation Digital Innovation" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
