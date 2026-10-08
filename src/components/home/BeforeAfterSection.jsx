import { useEffect, useRef, useState } from "react";
import { getBeforeAfter } from "../../services/home/beforeAfterService";
import { resolveMediaUrl } from "../../utils/media";

function SparkleIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0c.75 6.9 5.1 11.25 12 12-6.9.75-11.25 5.1-12 12-.75-6.9-5.1-11.25-12-12C6.9 11.25 11.25 6.9 12 0Z" />
    </svg>
  );
}

function BeforeAfterCard({ before, after, title, active, onHover }) {
  const [hovering, setHovering] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleMouseEnter = () => {
    clearTimers();
    setHovering(true);
    setSparkle(true);
    timersRef.current.push(setTimeout(() => setSparkle(false), 850));
    if (onHover) onHover();
  };

  const handleMouseLeave = () => {
    clearTimers();
    setHovering(false);
    setSparkle(false);
  };

  const hasImage = before || after;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group aspect-[4/3] overflow-hidden rounded-2xl bg-brand-100 transition-shadow duration-500 ${
        active && !hovering ? "ring-1 ring-brand-300/70" : "ring-0"
      }`}
    >
      {!hasImage ? (
        <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-ink-400">
          No images yet
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Before */}
          {before && (
            <>
              <img
                src={resolveMediaUrl(before)}
                alt={`${title} before`}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${
                  hovering ? "scale-105 opacity-0" : "scale-100 opacity-100"
                }`}
              />
              <span
                className={`absolute bottom-3 left-3 z-10 rounded-full bg-ink-900/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-opacity duration-500 ${
                  hovering ? "opacity-0" : "opacity-100"
                }`}
              >
                Before →
              </span>
            </>
          )}

          {/* After */}
          {after && (
            <>
              <img
                src={resolveMediaUrl(after)}
                alt={`${title} after`}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${
                  hovering ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
              <span
                className={`absolute bottom-3 right-3 z-10 rounded-full bg-ink-900/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-opacity duration-500 ${
                  hovering ? "opacity-100" : "opacity-0"
                }`}
              >
                ← After
              </span>
            </>
          )}

          {/* Decorative sparkle during the transition */}
          <SparkleIcon
            className={`pointer-events-none absolute left-1/2 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-brand-300 drop-shadow-lg transition-all duration-500 ease-in-out ${
              sparkle ? "rotate-45 scale-100 opacity-100" : "rotate-0 scale-50 opacity-0"
            }`}
          />
        </div>
      )}
    </div>
  );
}

function BeforeAfterSection() {
  const [section, setSection] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    getBeforeAfter()
      .then((data) => setSection(data.section || null))
      .catch(() => setSection(null));
  }, []);

  if (!section) return null;

  const items = [1, 2, 3, 4].map((n) => ({
    title: section[`title_${n}`] || "",
    before: section[`before_image_${n}`] || "",
    after: section[`after_image_${n}`] || "",
  }));

  const hasContent =
    section.title || section.heading || items.some((item) => item.title || item.before || item.after);

  if (!hasContent) return null;

  const label = section.title || "After/Before";
  const rawHeading = section.heading || "See stunning smile transformation | before and after";
const words = rawHeading.trim().split(" ");

const headingLine1 = words.slice(0, -3).join(" ");
const headingLine2 = words.slice(-3).join(" ");
  return (
    <section className="overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        {/* Section heading */}
        <div >
          <p className="text-xs font-medium italic uppercase tracking-[0.2em] text-brand-600">
            {label}
          </p>
          <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
            {headingLine1 && <span className="block">{headingLine1}</span>}
            {headingLine2 && (
              <span className="block text-brand-600">{headingLine2}</span>
            )}
          </h2> 
        </div>

        {/* Left titles + right image grid */}
        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-[2fr_3fr] lg:gap-14">
          {/* Treatment titles */}
          <div className="order-1 space-y-8 lg:order-none">
            {items.map((item, index) => {
              const isActive = active === index;
              return ( 
                <button
                  key={`title-${index}`}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => setActive(index)}
                  className={`group/title block w-full text-left transition-colors duration-300 ${
                    isActive ? "text-brand-800" : "text-ink-300"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.title && (
                      <span className="text-xl font-marcellus leading-snug sm:text-2xl">
                        {item.title}
                      </span>
                    )}
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <span
                      className={`block h-px transition-all duration-500 ${
                        isActive ? "w-16 bg-brand-500" : "w-8 bg-ink-200"
                      }`}
                    />
                    <SparkleIcon
                      className={`h-3.5 w-3.5 text-brand-500 transition-all duration-300 ${
                        isActive ? "rotate-45 scale-100 opacity-100" : "rotate-0 scale-50 opacity-0"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2x2 before / after image grid */}
          <div className="order-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:order-none">
            {items.map((item, index) => (
              <BeforeAfterCard
                key={`card-${index}`}
                {...item}
                active={active === index}
                onHover={() => setActive(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterSection;