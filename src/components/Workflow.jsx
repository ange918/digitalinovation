const workflowSteps = [
  {
    number: "01",
    title: "Écoute & Analyse",
    description: "Nous commençons par comprendre vos besoins, vos objectifs et votre vision pour établir une stratégie solide."
  },
  {
    number: "02",
    title: "Stratégie & Planification",
    description: "Élaboration d'une feuille de route détaillée avec des étapes claires et des délais précis pour votre projet."
  },
  {
    number: "03",
    title: "Design & Création",
    description: "Conception de maquettes visuelles et d'interfaces qui reflètent votre identité de marque et captivent vos utilisateurs."
  },
  {
    number: "04",
    title: "Développement & Implémentation",
    description: "Transformation des designs en produits fonctionnels avec du code propre et des technologies modernes."
  },
  {
    number: "05",
    title: "Tests & Optimisation",
    description: "Vérification rigoureuse de la qualité, des performances et de la sécurité avant le lancement."
  },
  {
    number: "06",
    title: "Lancement & Suivi",
    description: "Mise en ligne de votre projet et accompagnement continu pour assurer son succès et son évolution."
  }
];

export default function Workflow() {
  return (
    <section className="workflow">
      <div className="container">
        <h2 className="section-title accent">Un workflow efficace pour un projet réussi</h2>
        <div className="workflow-grid">
          {workflowSteps.map((step, index) => (
            <div key={index} className="workflow-card">
              <div className="workflow-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
