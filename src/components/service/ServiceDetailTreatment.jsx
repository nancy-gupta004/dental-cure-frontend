import { resolveMediaUrl } from "../../utils/media";

function ServiceDetailTreatment({ treatment }) {
  if (!treatment) {
    return null;
  }

  const { image, text, heading, description1, title, description2 } = treatment;
  const hasImage = Boolean(image);
  const hasContent = Boolean(
    text || heading || description1 || title || description2
  );

  // Nothing has been filled in for this card yet, so no empty band is rendered
  if (!hasImage && !hasContent) {
    return null;
  }

  // Shared styling for both rich-text descriptions
  const descriptionClass =
    "text-base leading-relaxed text-ink-500 sm:text-lg [&_a]:text-brand-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:font-marcellus [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5";

  return (
    <section className="bg-brand-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`grid grid-cols-1 items-center gap-10 lg:gap-14 ${
            hasImage ? "lg:grid-cols-2" : ""
          }`}
        >
          {hasImage && (
            <div className="overflow-hidden rounded-[28px] shadow-xl shadow-brand-900/10">
              <img
                src={resolveMediaUrl(image)}
                alt={heading || text || "Dental treatment"}
                className="h-full max-h-[420px] w-full object-cover"
              />
            </div>
          )}

          {/* Without an image the content keeps a comfortable reading width */}
          <div className={`text-left ${hasImage ? "" : "mx-auto max-w-3xl"}`}>
            {text && (
              <p className="text-sm font-medium italic tracking-wide text-brand-600 sm:text-base">
                {text}
              </p>
            )}

            {heading && (
              <h2 className="mt-3 font-marcellus text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            )}

            {description1 && (
              <div
                className={`mt-5 ${descriptionClass}`}
                dangerouslySetInnerHTML={{ __html: description1 }}
              />
            )}

            {title && (
              <>
                <div className="my-8 h-px w-24 bg-brand-300" />
                <h3 className="font-marcellus text-2xl leading-snug tracking-tight text-brand-900 sm:text-3xl">
                  {title}
                </h3>
              </>
            )}

            {description2 && (
              <div
                className={`mt-4 ${descriptionClass}`}
                dangerouslySetInnerHTML={{ __html: description2 }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailTreatment;
