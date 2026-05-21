import { Link } from "react-router-dom";
import Navbar from "../layout/Navbar";
import HeroVideoBackground from "../components/landing/HeroVideoBackground";

const sectionPad = "px-4 sm:px-6 lg:px-12 xl:px-16";
const sectionY = "py-12 sm:py-16 md:py-20";

export default function Landing() {
  return (
    <>
      <Navbar />

      <section
        id="hero"
        className={`landing-hero relative flex min-h-[75vh] items-center justify-center sm:min-h-[85vh] ${sectionPad} ${sectionY} text-center text-white`}
      >
        <HeroVideoBackground />
        <div className="landing-hero__overlay" aria-hidden />
        <div className="landing-hero__content mx-auto w-full max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:mb-5 md:text-5xl lg:text-6xl">
            Your nutrition, simplified and personalized
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/95 sm:text-lg md:text-xl">
            NutriGuide analyzes your profile, goals, and dietary preferences to create a clear,
            intelligent nutrition plan adapted to your lifestyle.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              to="/register"
              className="landing-cta-primary inline-flex items-center justify-center px-6 py-3 text-center text-sm no-underline sm:px-8"
            >
              Get started
            </Link>
            <a
              href="/#about"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-white/40 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white no-underline backdrop-blur-sm transition hover:bg-white/20 sm:px-8"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      <section id="about" className={`landing-section animate-fade-in bg-[var(--bg)] ${sectionPad} ${sectionY} text-center`}>
        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl md:mb-5 md:text-4xl">
          About NutriGuide
        </h2>
        <p className="mx-auto max-w-3xl text-base sm:text-lg">
          NutriGuide is a modern platform designed to help every user better understand their
          nutrition, track progress, and receive personalized recommendations based on real data.
        </p>
      </section>

      <section id="how" className={`landing-section animate-fade-in ${sectionPad} ${sectionY} text-center`}>
        <h2 className="mb-8 text-2xl font-semibold sm:mb-10 sm:text-3xl md:text-4xl">
          How it works
        </h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {[
            {
              title: "1. Create your profile",
              body: "Enter your age, weight, height, goals, and dietary preferences.",
            },
            {
              title: "2. NutriGuide analyzes your data",
              body: "Our algorithm calculates calories, macros, and an ideal meal structure.",
            },
            {
              title: "3. Receive your plan",
              body: "Get a complete meal plan tailored to your lifestyle and objectives.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="landing-card p-6 sm:p-8 md:hover:-translate-y-1"
            >
              <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">{c.title}</h3>
              <p className="text-sm sm:text-base">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="service" className={`landing-section animate-fade-in bg-[var(--bg)] ${sectionPad} ${sectionY} text-center`}>
        <h2 className="mb-8 text-2xl font-semibold sm:mb-10 sm:text-3xl md:text-4xl">
          Our services
        </h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {[
            {
              title: "Personalized analysis",
              body: "Smart calculation of your nutritional needs based on your profile.",
            },
            {
              title: "Meal plans",
              body: "Plans adapted to your goals: weight loss, muscle gain, balance, and more.",
            },
            {
              title: "Smart dashboard",
              body: "Track daily progress with clear charts and practical insights.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="landing-card p-6 sm:p-8 md:hover:-translate-y-1"
            >
              <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">{c.title}</h3>
              <p className="text-sm sm:text-base">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className={`landing-section animate-fade-in ${sectionPad} ${sectionY} text-center`}>
        <h2 className="mb-6 text-2xl font-semibold sm:mb-8 sm:text-3xl md:text-4xl">
          Why choose NutriGuide
        </h2>
        <ul className="mx-auto max-w-xl list-none space-y-3 p-0 pl-1 text-left text-base leading-relaxed sm:text-lg md:text-xl">
          <li className="relative pl-6 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--brand)] before:content-['']">
            Personalized recommendations based on real data
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--brand)] before:content-['']">
            Interface designed for clarity and ease of use
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--brand)] before:content-['']">
            Meal suggestions grounded in nutrition science
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--brand)] before:content-['']">
            Dashboard to monitor your progress over time
          </li>
          <li className="relative pl-6 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--brand)] before:content-['']">
            Adapted to dietary preferences and goals
          </li>
        </ul>
      </section>

      <section id="gallery" className={`landing-section animate-fade-in bg-[var(--bg)] ${sectionPad} ${sectionY} text-center`}>
        <h2 className="mb-3 text-2xl font-semibold sm:mb-4 sm:text-3xl md:text-4xl">
          Gallery
        </h2>
        <p className="mb-8 max-w-2xl mx-auto text-sm sm:text-base">
          A preview of the NutriGuide experience: meals, ingredients, and planning at a glance.
        </p>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-5">
          {[
            ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd", "Balanced meal"],
            ["https://images.unsplash.com/photo-1504674900247-0877df9cc836", "Meal preparation"],
            ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c", "Fresh produce"],
            ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f", "Cooking at home"],
            ["https://images.unsplash.com/photo-1506084868230-bb9d95c24759", "Healthy bowl"],
            ["https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83", "Planning"],
          ].map(([src, alt]) => (
            <img
              key={src}
              src={src}
              alt={alt}
              className="aspect-[4/3] w-full rounded-[var(--radius-lg)] object-cover shadow-[var(--shadow-sm)] transition duration-300 hover:opacity-95 sm:aspect-[3/2] md:hover:scale-[1.02]"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      <section
        id="cta-final"
        className={`animate-fade-in ${sectionPad} py-12 sm:py-14 md:py-16`}
      >
        <div className="landing-cta-band mx-auto max-w-4xl rounded-[var(--radius-xl)] px-6 py-10 text-center sm:px-10 sm:py-12 md:px-12">
          <h2 className="mb-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
            Ready to improve your nutrition?
          </h2>
          <p className="mb-8 text-sm opacity-95 sm:text-base">
            Create an account and start with a plan tailored to you.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="landing-cta-primary landing-cta-primary--inverse inline-flex items-center justify-center px-6 py-3 text-sm no-underline sm:px-8"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-[var(--radius)] border border-white/50 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/10 sm:px-8"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-neutral-950 text-neutral-300">
        <div className={`${sectionPad} py-12 sm:py-14`}>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="lg:col-span-2">
              <p className="text-lg font-semibold text-white">NutriGuide</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
                Nutrition planning and tracking for individuals and teams who want clear,
                data-informed decisions—not guesswork.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Contact
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="text-neutral-300 hover:text-white" href="mailto:contact@nutriguide.com">
                    contact@nutriguide.com
                  </a>
                </li>
                <li>
                  <a className="text-neutral-300 hover:text-white" href="tel:+15550100200">
                    +1 (555) 010-0200
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Explore
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a className="text-neutral-300 hover:text-white" href="/#about">
                    About
                  </a>
                </li>
                <li>
                  <a className="text-neutral-300 hover:text-white" href="/#service">
                    Services
                  </a>
                </li>
                <li>
                  <Link className="text-neutral-300 hover:text-white" to="/login">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="text-neutral-300 hover:text-white" to="/register">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-black/30">
          <div className={`${sectionPad} flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-neutral-500 sm:flex-row sm:text-left sm:text-sm`}>
            <p>© {new Date().getFullYear()} NutriGuide. All rights reserved.</p>
            <p className="max-w-md sm:text-right">
              <a href="/#gallery" className="hover:text-neutral-300">
                Gallery
              </a>
              <span className="mx-2 text-neutral-600" aria-hidden>
                ·
              </span>
              <a href="/#why" className="hover:text-neutral-300">
                Why us
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
