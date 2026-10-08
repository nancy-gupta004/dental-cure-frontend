import { useEffect, useRef, useState } from "react";
import { getDental } from "../../services/home/dentalService";
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

function DentalServiceCard({ card }) {
  return (
    <article
      data-card
      className="relative snap-start h-[262px] w-[251px] min-w-[251px] shrink-0 rounded-[29px] border border-white bg-[#F7F3EF] px-6 pb-6 pt-20 text-center transition duration-300 hover:shadow-md"
    >
      {/* Icon */}
      {card.icon_image && (
         <div className="absolute left-1/2 top-1 flex h-23 w-23 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full  bg-[#f7f3ef]">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                  src={resolveMediaUrl(card.icon_image)}
                  alt={card.title_1 || "Dental service"}
                  className="h-14 w-14 rounded-full object-contain p-2"
                />
              </div>
           </div>
      )}

      {/* Title 1 */}
      {card.title_1 && (
        <h3 className="min-h-[56px] text-xl leading-snug text-ink-900">
          {card.title_1}
        </h3>
      )}

      {/* Title 2 */}
      {card.title_2 && (
        <p className="mx-auto mt-3 min-h-[48px] max-w-[210px] text-sm leading-relaxed text-ink-500">
          {card.title_2}
        </p>
      )}

      {/* Bottom Arrow */}
      <div className="mt-6 flex justify-center ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-9 w-9 text-brand-500 hover:lg:animate-bounce"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17 17 7M7 7h10v10"
          />
        </svg>
      </div>
    </article>
  );
}

function DentalServicesSection() {
  const trackRef = useRef(null);
  const [section, setSection] = useState(null);
  const [cards, setCards] = useState([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    getDental()
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
    <section className="overflow-hidden bg-white px-4 py-20 sm:px-8 lg:px-10">
      {/* Section Title */}
      <div className="mx-auto max-w-4xl text-center">
        {section?.title_1 && (
          <p className="text-sm font-medium italic tracking-wide text-brand-600">
            {section.title_1}
          </p>
        )}

          <div className="mx-auto w-full max-w-[900px]">
            {section?.heading && (
              <h2 className="mt-6 text-center font-marcellus text-[46px] font-normal leading-[46px] tracking-tight text-[#1F1F1F]">
                {section.heading.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="font-marcellus text-[46px] font-normal leading-[46px] text-[#BEA68E]">
                  {section.heading.split(" ").slice(-1)}
                </span>
              </h2>
            )}

            {section?.description && (
              <p className="mx-auto mt-4 w-full max-w-[750px] text-center font-manrope text-[16px] font-light leading-[22px] text-[#7C7878]">
                {section.description}
              </p>
            )}
          </div>
      </div>

      {/* Cards + Navigation */}
      {cards.length > 0 && (
        <div className="relative mx-auto mt-24 w-full max-w-[1500px]">
          {/* Left Arrow */}
          <div className="pointer-events-none absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              aria-label="Previous cards"
              onClick={() => scrollCards(-1)}
              disabled={!canLeft}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-900 shadow-md transition duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="left" />
            </button>
          </div>

          {/* Cards */}
          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible scroll-smooth pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards.map((card) => (
              <DentalServiceCard key={card.id} card={card} />
            ))}
          </div>

          {/* Right Arrow */}
          <div className="pointer-events-none absolute right-0 top-1/2 z-20 translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              aria-label="Next cards"
              onClick={() => scrollCards(1)}
              disabled={!canRight}
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-900 shadow-md transition duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DentalServicesSection;