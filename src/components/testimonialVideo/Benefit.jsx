import { useEffect, useState } from "react";
import { getBenefit } from "../../services/testimonialVideo/benefitService";
import { resolveMediaUrl } from "../../utils/media";

function ArrowRightIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
      />
    </svg>
  );
}

// Benefit section of the Testimonial Video page: the logo, heading,
// description and call-to-action sit on the left, while the image sweeps into
// the content area from the right inside one large rounded container.
function Benefit() {
  const [benefit, setBenefit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBenefit()
      .then((data) => setBenefit(data.benefit || null))
      .catch(() => setBenefit(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10">
        <p className="text-center text-sm text-ink-500">Loading...</p>
      </section>
    );
  }

  // Nothing has been filled in by the admin yet, so no empty band is rendered
  if (
    !benefit ||
    (!benefit.logo &&
      !benefit.heading &&
      !benefit.description &&
      !benefit.button_text &&
      !benefit.image)
  ) {
    return null;
  }

  const {
    logo,
    heading,
    description,
    button_text: buttonText,
    button_link: buttonLink,
    image,
  } = benefit;

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[2.5rem] bg-brand-50 p-6 shadow-lg shadow-brand-900/5 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
          {/* Text content */}
          <div className="order-2 flex flex-col justify-center text-left lg:order-1">
            {logo && (
              <img
                src={resolveMediaUrl(logo)}
                alt=""
                className="h-10 w-auto sm:h-12"
              />
            )}

            {heading && (
              <h2 className="mt-6 whitespace-pre-line font-marcellus text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            )}

            {description && (
              <p className="mt-5 max-w-md whitespace-pre-line text-sm leading-relaxed text-ink-500 sm:text-base">
                {description}
              </p>
            )}

            {buttonText && (
              <a
                href={buttonLink || "#"}
                className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500"
              >
                {buttonText}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Image, curved on its left edge so it blends into the content */}
          {image && (
            <div className="order-1 overflow-hidden rounded-[2.5rem] shadow-xl shadow-brand-900/10 lg:order-2 lg:-ml-6 lg:rounded-r-[2.5rem] lg:rounded-l-[8rem]">
              <img
                src={resolveMediaUrl(image)}
                alt={heading || "Testimonial video benefit"}
                className="h-full max-h-[380px] w-full object-cover sm:max-h-[460px] lg:max-h-[540px]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Benefit;
