import { useEffect, useState } from "react";
import { getTrustedCare } from "../../services/home/trustedCareService";
import { resolveMediaUrl } from "../../utils/media";

function TrustedCareSection() {
  const [section, setSection] = useState(null);
  const [items, setItems] = useState([]);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    getTrustedCare()
      .then((data) => {
        const value = data.section || {};
        setSection(value);
        setItems(value.items || []);
        setFeatures(value.features || []);
      })
      .catch(() => setSection(null));
  }, []);

  if (!section || (!section.image && !section.heading && items.length === 0 && features.length === 0)) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: image + floating card */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[28px]">
            {section.image ? (
              <img
                src={resolveMediaUrl(section.image)}
                alt={section.heading || "Trusted dental care"}
    className="h-80 w-full rounded-[28px] object-cover shadow-xl shadow-brand-400/30 transition-transform duration-700 ease-in hover:scale-110 sm:h-[26rem] lg:h-[30rem]"
              />
            ) : (
              <div className="h-80 w-full rounded-[28px] bg-brand-100 sm:h-[26rem] lg:h-[30rem]" />
            )}

            {items.length > 0 && (
              <div className="absolute mb-16 h-10 -bottom-7 left-1/2 w-[92%] -translate-x-1/2 rounded-2xl bg-white p-5 shadow-2xl shadow-brand-900/15 sm:-bottom-8 sm:w-[90%] sm:p-6">
                <div className=" gap-x-4 gap-y-3 flex flex-wrap -mt-5 justify-center">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id || index}`}
                      className="flex items-center gap-3 mb-20"
                    >
                      {item.logo && (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full  ">
                          <img
                            src={resolveMediaUrl(item.logo)}
                            alt={item.text || `Floating item ${index + 1}`}
                            className="h-8 w-8 object-contain rounded-full"
                          />
                        </span>
                      )}
                      {item.text && (
                        <span className="text-sm font-semibold text-ink-900">
                          {item.text}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: heading + description + features */}
        <div className="mt-8 lg:mt-0">
          {section.heading && (
            <h2 className="text-3xl font-marcellus leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-[2.6rem]">
            {section.heading.split(" ").slice(0, -3).join(" ")}{" "}
                <span className="text-ink-300">
                  {section.heading.split(" ").slice(-3).join(" ")}
                </span> 
           </h2>
          )}

          {section.description && (
            <div
              className="mt-5 text-sm leading-relaxed text-ink-500 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: section.description }}
            />
          )}

          {features.length > 0 && (
            <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-6 rounded-2xl border border-brand-200/80 bg-white p-5 sm:p-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-brand-100 lg:p-0">
              {features.map((feature, index) => (
                <div
                  key={`${feature.id || index}`}
                  className="flex flex-col items-center px-3 py-3 text-center lg:py-8"
                >
                  {feature.logo && (
                    <span className="flex h-12 w-12 items-center justify-center bg-brand-50 rounded-full">
                      <img
                        src={resolveMediaUrl(feature.logo)}
                        alt={feature.description || `Feature ${index + 1}`}
                        className="h-9 w-9 object-contain rounded-full"
                      />
                    </span>
                  )}
                  {feature.description && (
                    <p className="mt-3 text-sm font-semibold leading-snug text-ink-700">
                      {feature.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TrustedCareSection;