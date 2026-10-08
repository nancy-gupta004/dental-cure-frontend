import { resolveMediaUrl } from "../../utils/media";



function ServiceDetailTreatmentProcess({ treatmentProcess }) {
  if (!treatmentProcess) {
    return null;
  }

  const { title, heading, description, cards } = treatmentProcess;
  const processCards = cards || [];
  const hasHeadingBlock = Boolean(title || heading || description);

  // Nothing has been filled in for this card yet, so no empty band is rendered
  if (!hasHeadingBlock && processCards.length === 0) {
    return null;
  }

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        {/* Centered title, heading and description */}
        {(title || heading || description) && (
          <div className="mx-auto max-w-3xl text-center">
            {title && (
              <p className="text-sm font-medium italic tracking-[0.2em] text-brand-600 sm:text-base">
                {title}
              </p>
            )}

            {heading && (
              <h2 className="mt-4 font-marcellus text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            )}

            {description && (
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-ink-500 sm:text-lg">
                {description}
              </p>
            )}

            <div className="mx-auto my-8 h-px w-24 bg-brand-300" />
          </div>
        )}

        {/* Numbered process cards */}
        {processCards.length > 0 && (
          <div className="rounded-[2.5rem] border border-brand-100 bg-brand-50/40 p-6 shadow-lg shadow-brand-900/5 sm:p-10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {processCards.map((card, index) => {
                // The number follows the intended order. The array position is
                // only a fallback, so a gap in the database never shows up here.
                const step = card.displayOrder ?? index + 1;

                return (
                  <div
                    key={card.id ?? `process-card-${step}`}
                    className="flex flex-col items-center text-center"
                  >
                    {card.image && (
                      <div className="w-full overflow-hidden rounded-[28px] shadow-md shadow-brand-900/10">
                        <img
                          src={resolveMediaUrl(card.image)}
                          alt={card.heading || `Step ${step}`}
                          className="aspect-[4/5] w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Circular number badge, sitting on the lower edge of the image */}
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 font-marcellus text-xl text-brand-800 shadow-md shadow-brand-900/10 ring-4 ring-brand-50 ${
                        card.image ? "-mt-7" : ""
                      }`}
                    >
                      {step}
                    </span>

                    {card.heading && (
                      <h3 className="mt-4 font-marcellus text-xl leading-snug tracking-tight text-brand-900">
                        {card.heading}
                      </h3>
                    )}

                    {card.text && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-500">
                        {card.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ServiceDetailTreatmentProcess;
