import { useEffect, useState } from "react";
import { getTechnologyProcess } from "../../services/technology/technologyProcessService";
import { resolveMediaUrl } from "../../utils/media";

function TechnologyProcessSection() {
  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnologyProcess()
      .then((data) => setProcess(data.process || null))
      .catch(() => setProcess(null))
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

  if (!process || (!process.heading && !(process.items || []).length)) {
    return null;
  }

  const { text, heading, items = [] } = process;

  // Shared styling for the rich-text item descriptions
  const descriptionClass =
    "text-sm leading-relaxed text-ink-500 sm:text-base [&_a]:text-brand-600 [&_a]:underline [&_h2]:mb-2 [&_h2]:font-marcellus [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5";

  return (
    <section className="bg-brand-50 px-6 py-16 sm:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        {/* Centered title + heading */}
        {text && (
          <p className="text-center text-xs font-sans italic uppercase tracking-[0.2em] text-brand-600">
            {text}
          </p>
        )}

        {heading && (
          <h2 className="mx-auto mt-3 max-w-3xl text-center font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
            {heading}
          </h2>
        )}

        {/* 3-column process items with connecting line */}
        <div className="relative mt-20 grid gap-16 lg:grid-cols-3 lg:gap-8">
          {/* Connecting horizontal line between items */}
          <div className="absolute inset-x-8 top-[32rem] hidden border-t-2 border-dotted border-brand-200 lg:block" />

          {items.map((item, index) => (
            <div key={item.id} className="relative text-center">
              {/* Decorative diamond sitting on the connecting line */}
              <span className="absolute left-1/2 top-[32rem]   hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-brand-300 bg-white lg:block" />

              {/* Large faded process number */}
              <span className="block font-marcellus text-8xl leading-none tracking-tight text-brand-100">
                {item.number || String(index + 1).padStart(2, "0")}
              </span>

              {/* Circular logo below the number */}
              {item.logo && (
                <div className="mt-10 flex justify-center">
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-50 ring-4 ring-brand-100">
                    <img
                      src={resolveMediaUrl(item.logo)}
                      alt={item.heading || `Process ${item.number}`}
                      className="h-full w-full object-cover"
                    />
                  </span>
                </div>
              )}

              {item.heading && (
                <h3 className="mt-6 font-marcellus text-2xl font-semibold tracking-tight text-ink-900">
                  {item.heading}
                </h3>
              )}

              {item.description && (
                <div
                  className={`${descriptionClass} mt-3`}
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}

              {/* Circular process images below the item */}
              {item.images && item.images.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  {item.images.map((image) => (
                    <img
                      key={image.id}
                      src={resolveMediaUrl(image.image)}
                      alt={item.heading || "Process image"}
                      className="h-16 w-16 rounded-full object-cover ring-4 ring-brand-50 shadow-lg shadow-brand-400/20"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TechnologyProcessSection;