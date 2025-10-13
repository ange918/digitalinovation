import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-left">
          <h3 className="footer-brand">Digital Innovation</h3>
          <p className="footer-tagline">Votre partenaire digital de confiance</p>
          <div className="footer-contact">
            <a href="mailto:contact@digitalinnovation.bj" className="contact-badge">
              <Mail size={16} />
              contact@digitalinnovation.bj
            </a>
            <a href="tel:+22912345678" className="contact-badge">
              <Phone size={16} />
              +229 12 34 56 78
            </a>
          </div>
        </div>
        <div className="footer-right">
          <h4>Entrer en contact</h4>
          <p>Prêt à transformer votre présence digitale ? Contactez-nous dès aujourd'hui pour discuter de votre projet.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter size={24} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Linkedin size={24} />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2025 Digital Innovation. Tous droits réservés.</p>
          <a href="#" className="legal-link">Mentions légales</a>
        </div>
      </div>
    </footer>
  );
}
