import article1 from '../assets/images/article-1.jpg';
import article2 from '../assets/images/article-2.jpg';
import article3 from '../assets/images/article-3.jpg';
import article4 from '../assets/images/article-4.jpg';

const articles = [
  {
    image: article1,
    title: "Introduction à React",
    excerpt: "Découvrez les fondamentaux de React et comment cette bibliothèque JavaScript révolutionne le développement web moderne.",
    link: "#"
  },
  {
    image: article2,
    title: "Optimisation pour les moteurs de recherche",
    excerpt: "Les meilleures pratiques SEO pour améliorer la visibilité de votre site web et attirer plus de visiteurs qualifiés.",
    link: "#"
  },
  {
    image: article3,
    title: "Pourquoi migrer vers le cloud en 2025 ?",
    excerpt: "Les avantages du cloud computing pour votre entreprise : flexibilité, évolutivité et réduction des coûts.",
    link: "#"
  },
  {
    image: article4,
    title: "Protégez vos données en ligne",
    excerpt: "Guide complet sur la cybersécurité et les bonnes pratiques pour protéger vos informations sensibles.",
    link: "#"
  }
];

export default function Blog() {
  return (
    <section className="blog">
      <div className="container">
        <h2 className="section-title accent">Derniers articles</h2>
        <div className="blog-grid">
          {articles.map((article, index) => (
            <article key={index} className="blog-card">
              <img src={article.image} alt={article.title} loading="lazy" />
              <div className="blog-content">
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <a href={article.link} className="blog-link">Lire plus →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
