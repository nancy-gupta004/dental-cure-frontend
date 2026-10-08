import { resolveMediaUrl } from "../../utils/media";

function ServiceDetailHeader({ header }) {
  const { backgroundImage, title, heading, description, buttonText, logo } = header;
  const hasBackground = Boolean(backgroundImage);

  return (
    <section className="relative isolate overflow-hidden bg-brand-700">
      {hasBackground && (
        <div className="absolute inset-0 -z-10">
          <img
            src={resolveMediaUrl(backgroundImage)}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/60 to-ink-900/75" />
        </div>
      )}

      <div
        className={`mx-auto w-full max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-10 ${
          hasBackground ? "text-white" : "text-ink-900"
        }`}
      >
        {logo && (
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#f7f3ef] ring-4 ring-white/60 sm:h-24 sm:w-24">
              <img
                src={resolveMediaUrl(logo)}
                alt=""
                className="h-full w-full rounded-full object-contain p-2"
              />
            </div>
          </div>
        )}

        {title && (
          <p className="text-sm font-medium italic tracking-[0.2em] text-brand-300 sm:text-base">
            {title}
          </p>
        )}

        {heading && (
          <h1 className="mt-4 font-marcellus text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
        )}

        {description && (
          <div
            className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${
              hasBackground ? "text-white/85" : "text-ink-500"
            } [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {buttonText && (
          <a
            href="#"
            className="mt-10 inline-block rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-9 py-4 text-base font-semibold text-white shadow-xl shadow-brand-900/30 transition hover:from-brand-300 hover:to-brand-500"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

export default ServiceDetailHeader;
