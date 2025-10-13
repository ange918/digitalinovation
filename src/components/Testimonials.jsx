import { AnimatedTestimonials } from './ui/AnimatedTestimonials';

const testimonials = [
  {
    quote: "La charte graphique réalisée par l'équipe de Digital Innovation a donné une nouvelle vie à mon entreprise.",
    name: "Émile",
    designation: "Gérant de Extra Menuiserie",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"
  },
  {
    quote: "Digital Innovation a transformé notre présence en ligne avec un site web moderne et performant. Leur expertise est impressionnante.",
    name: "Sophie Dubois",
    designation: "Directrice Marketing",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop"
  },
  {
    quote: "L'accompagnement de Digital Innovation nous a permis de lancer notre application mobile en temps record. Une équipe réactive et créative.",
    name: "Marc Laurent",
    designation: "CEO Startup Tech",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop"
  }
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title testimonials-title">
            Découvrez ce que nos clients disent de nous.
          </h2>
          <p className="testimonials-subtitle">
            Ne vous contentez pas de nous croire sur parole. Découvrez ce que nos clients disent de nous et de nos services.
          </p>
        </div>
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </section>
  );
}
