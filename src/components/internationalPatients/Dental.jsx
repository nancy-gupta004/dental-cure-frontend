import { useEffect, useState } from "react";
import { getDental } from "../../services/internationalPatients/dentalService";

function Dental() {
  const [dental, setDental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDental()
      .then((data) => setDental(data.dental || null))
      .catch(() => setDental(null))
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

  if (!dental) {
    return null;
  }

  const { text, heading, description1, description2, description3, description4 } =
    dental;

  if (!text && !heading && !description1 && !description2 && !description3 && !description4) {
    return null;
  }

  // Shared styling for all four rich-text descriptions
  const descriptionClass =
    "text-base leading-relaxed text-ink-500 sm:text-lg [&_a]:text-brand-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:font-marcellus [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5";

  const descriptions = [description1, description2, description3, description4];

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        {/* Top centered content */}
        <div className="text-center">
          {text && (
            <p className="text-sm font-medium italic tracking-wide text-brand-600 sm:text-base">
              {text}
            </p>
          )}

          {heading && (
            <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {heading}
            </h2>
          )}
        </div>

        {/* The four description blocks, stacked in the order they were entered */}
        {descriptions.some((description) => description) && (
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
            {descriptions.map((description, index) =>
              description ? (
                <div
                  key={index}
                  className={`${descriptionClass} rounded-2xl border border-brand-100 bg-brand-50/40 p-6 text-left`}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Dental;