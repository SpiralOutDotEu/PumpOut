import HallOfFame from "./components/HallOfFame";
import Hero from "./components/Hero";
import Starfield from "./components/Starfield";

export default function Home() {
  return (
    <>
      <Starfield />
      <main>
        <br />
        <HallOfFame />
        <Hero />
      </main>
    </>
  );
}
