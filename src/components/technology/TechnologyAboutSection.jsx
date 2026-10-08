import { useEffect, useState } from "react";
import { getTechnologyAbout } from "../../services/technology/technologyAboutService";
import { resolveMediaUrl } from "../../utils/media";

function TechnologyAboutSection() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnologyAbout()
      .then((data) => setAbout(data.about || null))
      .catch(() => setAbout(null))
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

  if (!about) {
    return null;
  }

  const { image, text, heading, description1, description2, logo, text1, text2 } = about;

  if (!image && !text && !heading && !description1 && !description2) {
    return null;
  }

  // Shared styling for the two rich-text descriptions
  const descriptionClass =
    "text-base leading-relaxed text-ink-500 sm:text-lg [&_a]:text-brand-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:font-marcellus [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5";

  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* Image on the left */}
        {image && (
          <div className="flex justify-center">
            <img
              src={resolveMediaUrl(image)}
              alt={heading || "About our technology"}
              className="w-full max-w-120 rounded-[28px] object-cover shadow-xl shadow-brand-400/30"
            />
          </div>
        )}

        {/* Content on the right */}
        <div>
          {text && (
            <p className="mb-1 text-xs font-sans italic uppercase tracking-[0.2em] text-brand-600">
              {text}
            </p>
          )}

          {heading && (
            <h2 className="text-4xl font-marcellus leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {heading}
            </h2>
          )}

          {description1 && (
            <div
              className={`${descriptionClass} mt-6`}
              dangerouslySetInnerHTML={{ __html: description1 }}
            />
          )}

          {description2 && (
            <div
              className={`${descriptionClass} mt-4`}
              dangerouslySetInnerHTML={{ __html: description2 }}
            />
          )}

          {(logo || text1 || text2) && (
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {logo && (
                <img
                  src={resolveMediaUrl(logo)}
                  alt=""
                  className="h-14 w-14 rounded-full object-contain"
                />
              )}

              <div className="grid flex-1 grid-cols-2 gap-6">
                {text1 && (
                  <p className="text-sm font-semibold text-ink-700">{text1}</p>
                )}
                {text2 && (
                  <p className="text-sm font-semibold text-ink-700">{text2}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TechnologyAboutSection;