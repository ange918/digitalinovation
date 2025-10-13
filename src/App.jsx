import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Workflow from './components/Workflow';
import Blog from './components/Blog';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Workflow />
        <Blog />
      </main>
      <Footer />
    </>
  );
}

export default App;
