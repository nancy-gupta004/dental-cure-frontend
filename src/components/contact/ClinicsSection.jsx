import { useEffect, useState } from "react";
import { getClinics } from "../../services/contact/contactClinicsService";
import { resolveMediaUrl } from "../../utils/media";

// A small icon-like dot is not used here, so each detail row is labelled with
// its own text so nothing depends on a hardcoded value
function ClinicCard({ card }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:shadow-md sm:flex-row">
      {/* Left side: the clinic image */}
      {card.image && (
        <img
          src={resolveMediaUrl(card.image)}
          alt={card.heading || "Clinic"}
          className="h-48 w-full object-cover sm:h-auto sm:w-56 sm:shrink-0"
        />
      )}

      {/* Right side: heading, address, phone, timing and the button */}
      <div className="flex flex-1 flex-col p-6">
        {card.heading && (
          <h3 className="font-marcellus text-xl leading-snug tracking-tight text-ink-900">
            {card.heading}
          </h3>
        )}

        <div className="mt-4 space-y-3">
          {card.address && (
            <div className="flex items-start gap-3">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-brand-700">
                Address
              </span>
              <span className="font-sans text-sm leading-relaxed text-ink-500">
                {card.address}
              </span>
            </div>
          )}

          {card.phone && (
            <div className="flex items-start gap-3">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-brand-700">
                Phone
              </span>
              <span className="font-sans text-sm text-ink-500">{card.phone}</span>
            </div>
          )}

          {card.timing && (
            <div className="flex items-start gap-3">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-brand-700">
                Timing
              </span>
              <span className="font-sans text-sm text-ink-500">{card.timing}</span>
            </div>
          )}
        </div>

        {/* The button label always comes from button_text */}
        {card.button_text && (
          <button
            type="button"
            className="mt-6 w-fit cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
          >
            {card.button_text}
          </button>
        )}
      </div>
    </div>
  );
}

function ClinicsSection() {
  const [section, setSection] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinics()
      .then((data) => {
        setSection(data.section || null);
        setCards(data.cards || []);
      })
      .catch(() => {
        setSection(null);
        setCards([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm text-ink-500">Loading...</p>
        </div>
      </section>
    );
  }

  // Nothing to show yet: the section is only rendered once the admin has given
  // it content, so an unfinished section never leaves a broken block behind
  if (!section) {
    return null;
  }

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        {/* Top centered content */}
        <div className="text-center">
          {section.title && (
            <p className="text-sm font-medium italic tracking-wide text-brand-600">
              {section.title}
            </p>
          )}

          {section.heading && (
            <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {section.heading}
            </h2>
          )}

          {section.description && (
            <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-500 sm:text-lg">
              {section.description}
            </p>
          )}
        </div>

        {/* Clinic cards: stacked on mobile, two columns from tablet upwards */}
        {cards.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
            {cards.map((card) => (
              <ClinicCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ClinicsSection;
