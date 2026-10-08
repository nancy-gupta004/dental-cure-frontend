import { useState } from "react";
import { resolveMediaUrl } from "../../utils/media";

function LocationMap({ mapUrl, title }) {
  if (!mapUrl) {
    return null;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-[2rem] border border-brand-100 bg-brand-50/40 shadow-lg shadow-brand-900/5">
      <iframe
        src={mapUrl}
        title={title ? `${title} map` : "Service location map"}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[280px] w-full border-0 sm:h-[340px] lg:h-[380px]"
      />
    </div>
  );
}

function LocationAccordionCard({ card, isOpen, onToggle, position }) {
  const heading = card.heading || "";
  const description = card.description || "";
  const hasImage = Boolean(card.image);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
        isOpen
          ? "border-brand-200 bg-white shadow-lg shadow-brand-900/5"
          : "border-brand-100 bg-brand-50/40 hover:border-brand-200"
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`location-card-panel-${card.id ?? position}`}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
        >
          <span className="flex items-center gap-4">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-marcellus text-sm transition-colors duration-300 ${
                isOpen
                  ? "bg-brand-500 text-white"
                  : "bg-brand-100 text-brand-800"
              }`}
            >
              {position}
            </span>

            <span
              className={`font-marcellus text-lg leading-snug tracking-tight transition-colors duration-300 sm:text-xl ${
                isOpen ? "text-brand-900" : "text-ink-700"
              }`}
            >
              {heading}
            </span>
          </span>

          {/* Down arrow that turns upwards while the card is open */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </h3>

      {/* Collapsible body: 0fr -> 1fr animates the height without a fixed max-height */}
      <div
        id={`location-card-panel-${card.id ?? position}`}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden ">
          <div className="px-5 pb-6 sm:px-6 grid grid-cols-2">
            {description && (
              <div
                className="text-sm leading-relaxed text-ink-500 [&_a]:text-brand-600 [&_a]:underline [&_p]:mb-2 [&_p]:last:mb-0"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {hasImage && (
              <div className="mt-4 overflow-hidden rounded-2xl">
                <img
                  src={resolveMediaUrl(card.image)}
                  alt={heading || `Location card ${position}`}
                  loading="lazy"
                  className="aspect-[16/10]  w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationSection({ location }) {
  // The admin never types a number, so the cards are always ordered by the
  // display_order the backend assigned.
  const cards = (location?.cards || [])
    .filter(Boolean)
    .slice()
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (a.id ?? 0) - (b.id ?? 0);
    });

  const [openCardId, setOpenCardId] = useState(null);

  const title = location?.title || "";
  const heading = location?.heading || "";
  const description = location?.description || "";
  const mapUrl = location?.mapUrl || "";

  if (!title && !heading && !description && !mapUrl && cards.length === 0) {
    return null;
  }

  // The first card is open until the visitor picks another one. A null state
  // means "nothing was clicked yet", so no effect is needed to keep it in sync
  // when the admin changes the cards.
  const activeCardId =
    openCardId !== null && cards.some((card) => card.id === openCardId)
      ? openCardId
      : cards[0]?.id ?? null;

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* LEFT: title, heading, description and the Google Maps embed */}
          <div className="lg:pr-4">
            {title && (
              <p className="text-sm font-medium italic tracking-[0.2em] text-brand-600 sm:text-base">
                {title}
              </p>
            )}

            {heading && (
              <h2 className="mt-4 font-marcellus text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem]">
                {heading}
              </h2>
            )}

            {description && (
              <div
                className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg [&_a]:text-brand-600 [&_a]:underline [&_p]:mb-3 [&_p]:last:mb-0"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            <LocationMap mapUrl={mapUrl} title={heading || title} />
          </div>

          {/* RIGHT: one open card at a time */}
          {cards.length > 0 && (
            <div className="space-y-4">
              {cards.map((card, index) => {
                const position = card.displayOrder || index + 1;

                return (
                  <LocationAccordionCard
                    key={card.id ?? `location-card-${position}`}
                    card={card}
                    position={position}
                    isOpen={card.id === activeCardId}
                    onToggle={() => setOpenCardId(card.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LocationSection;
