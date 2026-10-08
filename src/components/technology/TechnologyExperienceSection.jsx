import { useEffect, useState } from "react";
import { getTechnologyExperience } from "../../services/technology/technologyExperienceService";
import { resolveMediaUrl } from "../../utils/media";

function ArrowUpRightIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

function TechnologyExperienceSection() {
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnologyExperience()
      .then((data) => setExperience(data.experience || null))
      .catch(() => setExperience(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return null;
  }

  if (
    !experience ||
    (!experience.heading &&
      !experience.description &&
      !experience.button_text &&
      !experience.image)
  ) {
    return null;
  }

  const { image, heading, description, button_text, button_link } = experience;

  return (
    <section className="bg-white px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="relative mx-auto max-h-[25rem] w-full max-w-7xl overflow-hidden rounded-[2.5rem] bg-brand-700 sm:rounded-[3rem]">
        {/* Image on the right, separated by a curved/diagonal edge */}
        {image && (
          <div className="relative h-60 w-full sm:h-72 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[54%]">
            <img
              src={resolveMediaUrl(image)}
              alt={heading || "Our experience"}
              className="h-full w-full object-cover [clip-path:polygon(0_0,100%_0,100%_100%,18%_100%)] sm:[clip-path:polygon(0_0,100%_0,100%_100%,12%_100%)] lg:[clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)]"
            />
          </div>
        )}

        {/* Content on the left */}
<div className="relative z-10 max-w-2xl px-8  pt-8 pb-16 sm:px-12 sm:pt-10 sm:pb-20 lg:px-16 lg:pt-12 lg:pb-24">          {heading && (
            <h2 className="font-marcellus text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {heading}
            </h2>
          )}

          {description && (
            <p className="mt-6 max-w-[20rem] whitespace-pre-line text-base leading-relaxed text-white/85 sm:text-lg">
              {description}
            </p>
          )}

          {button_text && (
            <a
              href={button_link || "#"}
              className="mt-9 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-xl shadow-brand-900/20 transition hover:bg-brand-50"
            >
              {button_text}
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export default TechnologyExperienceSection;