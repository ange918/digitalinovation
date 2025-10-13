import { UserIcon, Target, Palette, CodeBrackets, CheckSquare, Rocket } from './Icons';

const workflowSteps = [
  {
    icon: UserIcon,
    title: "Écoute & Analyse",
    description: "Nous commençons par vous écouter attentivement. Comprendre vos besoins, vos objectifs et votre vision est essentiel pour poser les bases du projet."
  },
  {
    icon: Target,
    title: "Stratégie & Planification",
    description: "Une fois vos besoins identifiés, nous définissons une stratégie sur mesure et planifions chaque étape pour garantir un déroulement sans accroc."
  },
  {
    icon: Palette,
    title: "Design & Création",
    description: "Nos designers entrent en scène pour donner vie à votre projet avec des visuels modernes, captivants et une expérience utilisateur fluide."
  },
  {
    icon: CodeBrackets,
    title: "Développement & Implémentation",
    description: "Nos développeurs transforment les concepts en réalité grâce à du code propre, performant et sécurisé."
  },
  {
    icon: CheckSquare,
    title: "Tests & Optimisation",
    description: "Avant le lancement, nous testons tout en détail pour corriger les moindres bugs et optimiser les performances."
  },
  {
    icon: Rocket,
    title: "Lancement & Suivi",
    description: "Votre projet est mis en ligne, mais notre travail ne s'arrête pas là. Nous vous accompagnons avec un suivi régulier pour garantir un succès durable."
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
              <div className="workflow-icon-circle">
                <step.icon size={24} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
