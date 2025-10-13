import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Workflow from './components/Workflow';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Blog from './components/Blog';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Workflow />
        <Testimonials />
        <FAQ />
        <CTA />
        <Blog />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

export default App;
