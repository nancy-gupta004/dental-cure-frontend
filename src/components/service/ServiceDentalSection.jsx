import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getServiceDental } from "../../services/service/dentalService";
import { resolveMediaUrl } from "../../utils/media";

function ArrowUpRightIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

function ServiceDentalCard({ card }) {
  const hasLogo = Boolean(card.logo);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[28px] bg-brand-700 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-900/20">
      {card.image && (
        <div className="relative h-48 shrink-0 overflow-hidden sm:h-52">
          <img
            src={resolveMediaUrl(card.image)}
            alt={card.heading || "Dental service"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {hasLogo && (
            <div className="absolute -bottom-8 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-[#f7f3ef] ring-4 ring-white">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                  src={resolveMediaUrl(card.logo)}
                  alt=""
                  className="h-full w-full rounded-full object-contain p-1.5"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className={` flex flex-1 flex-col items-center px-5 text-center ${
          hasLogo ? "pt-12" : "pt-7"
        } pb-6`}
      >
        {card.heading && (
          <h3 className="font-marcellus text-xl leading-snug tracking-tight text-white">
            {card.heading}
          </h3>
        )}

        {card.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">
            {card.description}
          </p>
        )}

        {card.slug && (
          <Link
            to={`/services/${card.slug}`}
            aria-label={`View ${card.heading || "service"} details`}
            className="mt-auto inline-flex h-11 w-11 items-center justify-center rounded-full pt-5 text-white transition duration-300 hover:translate-x-0.5 hover:-translate-y-0.5 hover:bg-white/10"
          >
            <ArrowUpRightIcon className="h-5 w-5" />
          </Link>
        )}
      </div>
    </article>
  );
}

function ServiceDentalSection() {
  const [section, setSection] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServiceDental()
      .then((data) => {
        const value = data.section || {};
        setSection(value);
        const list = value.cards || data.cards || [];
        setCards(
          [...list].sort(
            (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
          )
        );
      })
      .catch(() => setSection(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10">
        <p className="text-center text-sm text-ink-500">Loading...</p>
      </section>
    );
  }

  if (
    !section ||
    (!section.section_text &&
      !section.section_heading &&
      !section.section_description &&
      cards.length === 0)
  ) {
    return null;
  }

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="text-center">
          {section.section_text && (
            <p className="text-sm font-medium italic tracking-wide text-brand-600">
              {section.section_text}
            </p>
          )}

          {section.section_heading && (
            <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {section.section_heading}
            </h2>
          )}

          {section.section_description && (
            <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-500 sm:text-lg">
              {section.section_description}
            </p>
          )}
        </div>

        {cards.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {cards.map((card) => (
              <ServiceDentalCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServiceDentalSection;