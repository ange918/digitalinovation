import { Facebook, Twitter, Linkedin, Instagram } from './Icons';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">Digital Innovation</div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook">
            <Facebook />
          </a>
          <a href="#" aria-label="Twitter">
            <Twitter />
          </a>
          <a href="#" aria-label="LinkedIn">
            <Linkedin />
          </a>
          <a href="#" aria-label="Instagram">
            <Instagram />
          </a>
        </div>
      </div>
    </header>
  );
}
