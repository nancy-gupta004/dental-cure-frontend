import { useEffect, useState } from "react";
import { getTechnologyBenefit } from "../../services/technology/technologyBenefitService";
import { resolveMediaUrl } from "../../utils/media";

function TechnologyBenefitSection() {
  const [benefit, setBenefit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnologyBenefit()
      .then((data) => setBenefit(data.benefit || null))
      .catch(() => setBenefit(null))
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

  if (!benefit || (!benefit.heading && !benefit.image && !(benefit.cards || []).length)) {
    return null;
  }

  const { heading, image, cards = [] } = benefit;

  // Shared styling for the rich-text card descriptions
  const descriptionClass =
    "text-sm leading-relaxed text-ink-500 [&_a]:text-brand-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:font-marcellus [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5";

  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-12 lg:grid-cols-5">
        {/* Left side: heading + image */}
        <div className="lg:col-span-2 lg:sticky lg:top-24">
          {heading && (
            <h2 className="font-marcellus text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl">
              {heading}
            </h2>
          )}

          {image && (
            <div className="mt-8 flex justify-center">
              <img
                src={resolveMediaUrl(image)}
                alt={heading || "Technology benefits"}
                className="w-full rounded-[28px] object-cover shadow-xl shadow-brand-400/30"
              />
            </div>
          )}
        </div>

        {/* Right side: benefit cards in a 2 x 2 grid */}
        {cards.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-[1.75rem] border border-brand-100 bg-brand-50/40 p-6 transition hover:border-brand-200 hover:bg-brand-50"
              >
                {card.heading && (
                  <h3 className="font-marcellus text-xl font-semibold tracking-tight text-ink-900">
                    {card.heading}
                  </h3>
                )}

                {card.description && (
                  <div
                    className={`${descriptionClass} mt-3`}
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TechnologyBenefitSection;