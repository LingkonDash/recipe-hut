"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HomeAnimations() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Hero animations
    gsap.fromTo(
      ".hero-animate",
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out" 
      }
    );

    // 2. Section entrance animations
    const sections = gsap.utils.toArray<HTMLElement>(".gsap-section");
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

      // Animate staggered children (cards, etc) inside this section if any exist
      const staggerCards = section.querySelectorAll(".gsap-stagger-card");
      if (staggerCards.length > 0) {
        tl.fromTo(
          staggerCards,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
          "-=0.2" // start slightly before section animation finishes
        );
      }

      // Animate numbers counting up if they exist in this section
      const numbers = section.querySelectorAll<HTMLElement>(".gsap-number");
      if (numbers.length > 0) {
        numbers.forEach((num) => {
          const endValue = parseFloat(num.dataset.value || "0");
          if (!isNaN(endValue)) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: endValue,
              duration: 1.5,
              ease: "power2.out",
              onUpdate: () => {
                num.innerHTML = Math.round(obj.val).toString();
              }
            });
          }
        });
      }
    });

  });

  return null;
}
