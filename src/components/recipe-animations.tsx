"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function RecipeAnimations() {
  useGSAP(() => {
    // 1. Header animations (Image and Title card)
    gsap.fromTo(
      ".gsap-recipe-hero",
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.15, 
        ease: "power2.out" 
      }
    );

    // 2. Section entrance animations via ScrollTrigger
    const sections = gsap.utils.toArray<HTMLElement>(".gsap-recipe-section");
    sections.forEach((section) => {
      // Create a timeline for each section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%", // trigger when ~20% of section is visible
          once: true, // don't re-trigger
        }
      });

      // Animate the section itself
      tl.fromTo(
        section,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );

      // Animate staggered children (related cards) inside this section if any exist
      const staggerCards = section.querySelectorAll(".gsap-recipe-card");
      if (staggerCards.length > 0) {
        tl.fromTo(
          staggerCards,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.2" // start slightly before section animation finishes
        );
      }
    });
  });

  return null;
}
