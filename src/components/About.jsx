import { SocialMedia, Design, Write, CodeDev } from './Icons';

const services = [
  {
    icon: SocialMedia,
    title: "Community & Social Media Manager",
    description: "Nous transformons vos réseaux sociaux en puissants leviers de croissance grâce à des contenus engageants."
  },
  {
    icon: Design,
    title: "Designer graphique & UI/UX",
    description: "Nos designers créent des designs qui captivent et des interfaces qui marquent, alliant créativité et expérience utilisateur."
  },
  {
    icon: Write,
    title: "Copywriter & Ghostwriter",
    description: "Nous donnons vie à vos idées avec des mots qui inspirent, convainquent et fidélisent votre audience."
  },
  {
    icon: CodeDev,
    title: "Développeurs web & mobile",
    description: "Nos développeurs conçoivent des sites et applications solides, performants et adaptés à vos besoins."
  }
];

export default function About() {
  return (
    <section className="about">
      <div className="container">
        <div className="about-layout">
          <div className="about-left">
            <h2 className="section-title">Qui sommes nous ?</h2>
            <p className="about-text">
              Digital Innovation, c'est une jeune équipe dynamique et passionnée, dédiée à transformer vos idées en succès digital. 
              Basée au Bénin, nous accompagnons entrepreneurs, TPE, PME et startups dans leur transformation numérique, avec des 
              solutions créatives et sur mesure.
            </p>
            <button className="btn btn-outline btn-secondary">
              En savoir plus sur nous
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <div className="service-divider"></div>
                  <div className="service-icon">
                    <service.icon size={24} />
                  </div>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
