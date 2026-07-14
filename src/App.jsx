import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Systems from "./components/Systems.jsx";
import Projects from "./components/Projects.jsx";
import Stack from "./components/Stack.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Systems />
        <Projects />
        <Stack />
      </main>
      <Footer />
    </>
  );
}
