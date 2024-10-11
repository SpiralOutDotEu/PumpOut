import HallOfFame from "./components/HallOfFame";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Starfield from "./components/Starfield";

export default function Home() {
  return (
    <>
      <Starfield />
      <main>
        <Header />
        <br />
        <HallOfFame />
        <Hero />
      </main>
    </>
  );
}
