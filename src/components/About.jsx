import { SocialMedia, Design, Write, CodeDev } from './Icons';

const services = [
  {
    icon: SocialMedia,
    title: "Community & Social Media Manager",
    description: "Gestion professionnelle de vos réseaux sociaux et de votre communauté en ligne pour maximiser votre visibilité."
  },
  {
    icon: Design,
    title: "Designer graphique & UI/UX",
    description: "Création de designs modernes et d'expériences utilisateur intuitives pour vos applications et sites web."
  },
  {
    icon: Write,
    title: "Copywriter & Ghostwriter",
    description: "Rédaction de contenu percutant et authentique pour votre marque et vos campagnes marketing."
  },
  {
    icon: CodeDev,
    title: "Développeurs web & mobile",
    description: "Développement d'applications web et mobile performantes adaptées à vos besoins spécifiques."
  }
];

export default function About() {
  return (
    <section className="about">
      <div className="container">
        <h2 className="section-title">Qui sommes nous ?</h2>
        <p className="about-text">
          Digital Innovation, c'est une jeune équipe dynamique et passionnée, dédiée à transformer vos idées en succès digital. 
          Basée au Bénin, nous accompagnons entrepreneurs, TPE, PME et startups dans leur transformation numérique, 
          avec des solutions créatives et sur mesure.
        </p>
        <button className="btn btn-outline btn-secondary">En savoir plus sur nous</button>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">
                <service.icon size={30} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
