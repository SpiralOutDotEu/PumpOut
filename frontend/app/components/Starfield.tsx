"use client";
import { useEffect } from "react";

const Starfield = () => {
  useEffect(() => {
    const starfield = document.createElement("div");
    starfield.classList.add("starfield");
    document.body.appendChild(starfield);

    const starCount = 100; // Number of stars
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("star");
      const x = Math.random() * 100; // Random position
      const y = Math.random() * 100;
      const delay = Math.random() * 10; // Random delay for staggered animation
      star.style.left = `${x}vw`;
      star.style.top = `${y}vh`;
      star.style.animationDelay = `${delay}s`;
      starfield.appendChild(star);
    }

    return () => {
      document.body.removeChild(starfield); // Cleanup
    };
  }, []);

  return null; // No visible output, just a background effect
};

export default Starfield;
