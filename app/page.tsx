"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Music,
  Users,
  Radio,
  Sparkles,
 
} from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { Button } from "@/components/ui/button";
import { Appbar } from "./components/Appbar";

export default function Home() {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
      );

      // Feature cards hover animation (desktop only)
      if (window.innerWidth >= 768) {
        featureRefs.current.forEach((card) => {
          if (!card) return;

          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -10,
              boxShadow: "0 20px 40px rgba(34,211,238,0.25)",
              duration: 0.3,
              ease: "power3.out",
            });
          });

          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              boxShadow: "0 0 0 rgba(0,0,0,0)",
              duration: 0.3,
              ease: "power3.out",
            });
          });
        });
      }

      // ===== SCROLL EFFECTS =====

      // 1. Parallax background glows
      gsap.to(".bg-cyan-glow", {
        y: "-30vh",
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      });

      gsap.to(".bg-purple-glow", {
        y: "30vh",
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      });

      // 2. Hero section parallax
      gsap.to(".hero-content", {
        y: "-50px",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

      gsap.to(".hero-image", {
        y: "30px",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

      // 3. Feature cards reveal animation on scroll
      gsap.fromTo(
        ".feature-card",
        {
          opacity: 0,
          y: 60,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: "#features",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // 4. Features section title animation
      gsap.fromTo(
        ".features-title",
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#features",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // 5. Scale effect on hero image during scroll
      gsap.to(".hero-image", {
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.5
        }
      });

      // 6. Background color change effect
      gsap.to("body", {
        backgroundColor: "#0a0a0a",
        ease: "none",
        scrollTrigger: {
          trigger: "#features",
          start: "top center",
          end: "bottom center",
          scrub: 1
        }
      });

      // 7. Floating music note rotation
      gsap.to(".music-note", {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });

      // 8. Text reveal effect for features description
      gsap.fromTo(
        ".features-desc",
        {
          opacity: 0,
          x: -50
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#features",
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // 9. Progressive reveal of feature icons
      gsap.fromTo(
        ".feature-icon",
        {
          scale: 0,
          rotation: -180
        },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.3,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: "#features",
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // 10. Footer fade-in effect
      gsap.fromTo(
        "footer",
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "footer",
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );

    }, document.body);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden scroll-smooth">
      <Appbar />

      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-100 md:w-125 h-100 md:h-125 bg-cyan-500/30 rounded-full blur-[160px] bg-cyan-glow" />
        <div className="absolute -bottom-40 -right-40 w-100 md:w-125 h-100 md:h-125 bg-purple-600/30 rounded-full blur-[160px] bg-purple-glow" />
      </div>

      {/* ================= HERO ================= */}
      <section className="hero-section relative flex items-center justify-center min-h-screen px-4 sm:px-6 py-20">
        <div className="hero-content w-full max-w-7xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            {/* LEFT CONTENT */}
            <div ref={textRef} className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-cyan-400 mb-4 lg:mb-6">
                <Music className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="uppercase tracking-widest text-xs lg:text-sm">
                  Muzi Platform
                </span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 lg:mb-0">
                The Perfect Place For{" "}
                <span className="text-cyan-400">Music.</span>
              </h1>

              <p className="mt-4 lg:mt-6 max-w-xl text-gray-400 text-sm sm:text-base lg:text-lg mx-auto lg:mx-0">
                Muzi lets your audience decide the vibe. Fans suggest tracks,
                vote in real time, and shape your live stream experience.
              </p>

              <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                  <Link href="/api/auth/signin" className="flex items-center justify-center">
                    Get Started{" "}
                    <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                  </Link>
                </Button>

               
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div
              ref={imageRef}
              className="hero-image relative w-full h-50 xs:h-[250px] sm:h-87.5 md:h-100 lg:h-125 xl:h-130 rounded-2xl overflow-hidden mt-8 lg:mt-0"
            >
              <Image
                src="/muzi-image.png"
                alt="Muzi Music Streaming Platform"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/20 to-purple-500/20 mix-blend-overlay" />

              {/* Floating music note */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-cyan-400 animate-bounce music-note">
                <Music className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KEY FEATURES ================= */}
      <section
        id="features"
        className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="features-title text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Why Creators Love{" "}
            <span className="text-cyan-400">Muzi</span>
          </h2>
          <p className="features-desc mt-4 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Built for streamers, DJs, and creators who want real audience
            engagement.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" />,
              title: "Fan-Powered Playlists",
              desc: "Your audience suggests and votes for songs in real time.",
            },
            {
              icon: <Radio className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />,
              title: "Multi-Platform Support",
              desc: "Works seamlessly with YouTube and Spotify.",
            },
            {
              icon: <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400" />,
              title: "Live Engagement",
              desc: "Boost interaction with instant feedback and voting.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) featureRefs.current[i] = el;
              }}
              className="feature-card group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:bg-white/10"
            >
              <div className="feature-icon mb-4 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className=" mt-24 py-12 px-4 sm:px-6">
        
         

          {/* Bottom Section */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2025 Muzi. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <span>Made with ❤️ for music creators</span>
            </div>
          </div>
        
      </footer>
    </div>
  );
}
