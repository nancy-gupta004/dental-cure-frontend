import { useEffect, useState } from "react";
import { getContactHeader } from "../../services/contact/contactHeaderService";
import { resolveMediaUrl } from "../../utils/media";

function ContactHeaderSection() {
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContactHeader()
      .then((data) => setHeader(data.header || null))
      .catch(() => setHeader(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-[500px] items-center justify-center bg-brand-700">
        <p className="text-center text-sm text-white/70">Loading...</p>
      </section>
    );
  }

  if (!header || (!header.heading && !header.image)) {
    return null;
  }

  const { image, heading } = header;
  const hasImage = Boolean(image);

  return (
    <section className="relative isolate flex min-h-[500px] w-full items-center overflow-hidden bg-brand-700">
      {hasImage && (
        <div className="absolute inset-0 -z-10 h-full w-full">
          <img
            src={resolveMediaUrl(image)}
            alt=""
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/60 to-ink-900/75" />
        </div>
      )}

      <div
        className={`mx-auto flex min-h-[590px] w-full max-w-7xl items-center justify-center px-5 py-24 text-center sm:px-8 sm:py-32 lg:px-10 ${
          hasImage ? "text-white" : "text-ink-900"
        }`}
      >
        {heading && (
          <h1 className="font-marcellus text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
        )}
      </div>
    </section>
  );
}

export default ContactHeaderSection;