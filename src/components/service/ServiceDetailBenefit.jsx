import { resolveMediaUrl } from "../../utils/media";
import ToothMark from "../ToothMark";

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

// Decorative horizontal line with the tooth mark sitting in the middle of it
function ToothDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-300" />
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-200 to-brand-400 ring-4 ring-brand-100">
        <ToothMark className="h-5 w-5 fill-brand-700" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-300" />
    </div>
  );
}

// Fourth and last block of a service detail page. The heading is a single field,
// so the line break of the reference design is rendered from the line break the
// admin types inside that one field.
function ServiceDetailBenefit({ benefits }) {
  if (!benefits) {
    return null;
  }

  const { image, heading, description, buttonText } = benefits;
  const hasContent = Boolean(heading || description || buttonText || image);

  // Nothing has been filled in by the admin yet, so no empty band is rendered
  if (!hasContent) {
    return null;
  }

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-[2.5rem] bg-brand-50 p-6 shadow-lg shadow-brand-900/5 sm:p-10 lg:p-14">
          <ToothDivider />

          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Text content */}
            <div className="order-2 flex flex-col justify-center text-left lg:order-1">
              {heading && (
                <h2 className="whitespace-pre-line font-marcellus text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
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
                  href="#"
                  className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500"
                >
                  {buttonText}
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Image */}
            {image && (
              <div className="order-1 overflow-hidden rounded-[2rem] shadow-xl shadow-brand-900/10 lg:order-2">
                <img
                  src={resolveMediaUrl(image)}
                  alt={heading || "Dental treatment"}
                  className=" max-h-[220px] w-full object-cover lg:max-h-[320px]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailBenefit;
