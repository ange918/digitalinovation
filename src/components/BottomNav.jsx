import { Home, HelpCircle, Services, Blog, Mail } from './Icons';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <a href="#accueil" aria-label="Accueil">
        <Home size={20} />
      </a>
      <a href="#aide" aria-label="Aide">
        <HelpCircle size={20} />
      </a>
      <a href="#services" aria-label="Services">
        <Services size={20} />
      </a>
      <a href="#blog" aria-label="Blog">
        <Blog size={20} />
      </a>
      <a href="#contact" aria-label="Contact">
        <Mail size={20} />
      </a>
    </nav>
  );
}
