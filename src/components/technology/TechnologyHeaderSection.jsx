import { useEffect, useState } from "react";
import { getTechnologyHeader } from "../../services/technology/technologyHeaderService";
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

function TechnologyHeaderSection() {
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnologyHeader()
      .then((data) => setHeader(data.header || null))
      .catch(() => setHeader(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-brand-700">
        <p className="text-center text-sm text-white/70">Loading...</p>
      </section>
    );
  }

  if (!header || (!header.heading && !header.background_image)) {
    return null;
  }

  const { background_image, text, heading, description, button_text, button_link } = header;
  const hasBackground = Boolean(background_image);

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-brand-700">
      {/* Background Image */}
      {hasBackground && (
        <div className="absolute inset-0 -z-10">
          <img
            src={resolveMediaUrl(background_image)}
            alt=""
            className="h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/60 to-ink-900/75" />
        </div>
      )}

      {/* Content */}
      <div
        className={`mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-10 ${
          hasBackground ? "text-white" : "text-ink-900"
        }`}
      >
        {text && (
          <p className="text-sm font-medium italic tracking-[0.2em] text-brand-300 sm:text-base">
            {text}
          </p>
        )}

        {heading && (
          <h1 className="mt-4 font-marcellus text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
        )}

        {description && (
          <p
            className={`mx-auto mt-6 max-w-2xl whitespace-pre-line text-base leading-relaxed sm:text-lg ${
              hasBackground ? "text-white/85" : "text-ink-500"
            }`}
          >
            {description}
          </p>
        )}

        {button_text && (
          <a
            href={button_link || "#"}
            className="mt-9 inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500"
          >
            {button_text}
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>
    </section>
  );
}

export default TechnologyHeaderSection;