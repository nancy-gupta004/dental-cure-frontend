import { useEffect, useRef, useState } from "react";
import { getTestimonials } from "../../services/home/testimonialService";
import { resolveMediaUrl } from "../../utils/media";

function ArrowIcon({ direction }) {
  const chevron =
    direction === "left" ? (
      <path d="M15.75 19.5 8.25 12l7.5-7.5" />
    ) : (
      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      {chevron}
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="ml-0.5 h-6 w-6 text-white"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function TestimonialCard({ card }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  return (
    <article
      data-card
      className="group relative h-[310px] w-[230px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-ink-900"
    >
      {/* Video fills the whole card as the visual background */}
      <video
        ref={videoRef}
        src={resolveMediaUrl(card.video_url)}
        className="absolute inset-0 h-full w-full object-cover"
        preload="metadata"
        muted={!playing}
        playsInline
        controls={playing}
        onEnded={() => setPlaying(false)}
      />

      {/* Dark gradient overlay at the bottom */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />

      {/* Centered play button */}
      {!playing && (
        <button
          type="button"
          aria-label={`Play ${card.name || "patient"} video`}
          onClick={handlePlay}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm transition duration-200 hover:scale-105 hover:bg-white/40"
        >
          <PlayIcon />
        </button>
      )}

      {/* Name + designation at the bottom */}
      {!playing && (
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center">
          {card.name && (
            <p className="text-base font-semibold text-white">{card.name}</p>
          )}
          {card.designation && (
            <p className="mt-0.5 text-xs font-medium text-white/70">
              {card.designation}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function TestimonialsSection() {
  const trackRef = useRef(null);
  const [section, setSection] = useState(null);
  const [cards, setCards] = useState([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    getTestimonials()
      .then((data) => {
        setSection(data.section || {});
        setCards(data.cards || []);
      })
      .catch(() => setSection(null));
  }, []);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    setTimeout(() => updateArrows(), 0);
  }, [cards]);

  const scrollCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    const card = el.querySelector("[data-card]");
    const amount = card ? card.offsetWidth + 20 : 285;

    el.scrollBy({
      left: dir * amount,
      behavior: "smooth",
    });
  };

  if (!section?.title_1 && !section?.heading && !section?.description && cards.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-50 px-4 py-16 sm:px-8 lg:px-10 bg-white">
      {/* Section Title */}
      <div className="mx-auto max-w-4xl text-center">
        {section?.title_1 && (
          <p className="text-sm font-medium italic tracking-wide text-brand-600">
            {section.title_1}
          </p>
        )}

        {section?.heading && (
          <h2 className="mt-3 text-4xl font-marcellus leading-tight tracking-tight text-ink-900 sm:text-5xl">
            {section.heading.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-ink-300">
              {section.heading.split(" ").slice(-2).join(" ")}
            </span>
          </h2>
        )}

        {section?.description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500 font-sans sm:text-sm">
            {section.description}
          </p>
        )}
      </div>

      {/* Cards */}
      {cards.length > 0 && (
        <div className="mx-auto mt-16 w-full max-w-[1500px]">
          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards.map((card) => (
              <TestimonialCard key={card.id} card={card} />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Previous cards"
              onClick={() => scrollCards(-1)}
              disabled={!canLeft}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-900 shadow-md transition duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next cards"
              onClick={() => scrollCards(1)}
              disabled={!canRight}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-900 shadow-md transition duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default TestimonialsSection;