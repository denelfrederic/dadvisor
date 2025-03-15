
import { useState, useEffect } from "react";

/**
 * Custom hook to create a parallax scrolling effect
 * @param factor The multiplier that determines the intensity of the parallax effect
 * @returns The calculated parallax offset based on scroll position
 */
export function useParallax(factor: number = 0.25) {
  // État pour suivre la position de défilement
  const [scrollY, setScrollY] = useState(0);
  
  // Effet pour écouter l'événement de défilement
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Calcul du décalage pour l'effet de parallaxe
  const parallaxOffset = scrollY * factor;
  
  return parallaxOffset;
}
