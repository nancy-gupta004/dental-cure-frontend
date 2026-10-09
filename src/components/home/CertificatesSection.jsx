import { useEffect, useState } from "react";
import { getCertificates } from "../../services/home/certificateService";
import { resolveMediaUrl } from "../../utils/media";

// Responsive grid that adapts to the number of certificates:

function getGridClass(count) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

function MapPinIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

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

function CertificatesSection() {
  const [section, setSection] = useState(null);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    getCertificates()
      .then((data) => {
        setSection(data.section || {});
        setCertificates(data.certificates || []);
      })
      .catch(() => setSection(null));
  }, []);

  if (
    !section ||
    (!section.title && !section.heading && certificates.length === 0)
  ) {
    return null;
  }

  return (
    <section className="-mt-48 overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* Section header */}
        <div className="text-center">
          {section.title && (
            <p className="text-sm font-medium italic text-brand-400">
              {section.title}
            </p>
          )}

          {section.heading && (
            <h2 className="mt-3 text-4xl font-marcellus leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {section.heading}
            </h2>
          )}
        </div>

        {/* Certificate cards */} 
        {certificates.length > 0 && (
          <div
            className={`mt-14 grid ${getGridClass(certificates.length)} gap-x-1 gap-y-10 `}
          >
            {certificates.map((certificate) => (
             <article
                  key={certificate.id}
                  className="mx-auto w-full max-w-[500px] rounded-2xl p-4 shadow-brand-900/5 sm:p-5"
                >
                  {certificate.image && (
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={resolveMediaUrl(certificate.image)}
                        alt={certificate.title || "Certificate"}
                        className="mx-auto aspect-[4/3] w-full max-h-[300px] object-contain"
                      />
                    </div>
                  )}

                {certificate.title && (
                  <h3 className="mt-6 font-marcellus text-2xl leading-tight tracking-tight text-ink-900">
                    {certificate.title}
                  </h3>
                )}

                {(certificate.country || certificate.level_certificate) && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm ">
                    {certificate.country && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-ink-700">
                        <MapPinIcon className="h-4 w-4 text-brand-600" />
                        {certificate.country}
                      </span>
                    )}

                    {certificate.country && certificate.level_certificate && (
                      <span className="h-4 w-px " />
                    )}

                    {certificate.level_certificate && (
                      <span >
                        {certificate.level_certificate}
                      </span>
                    )}
                  </div>
                )}

                {certificate.description && (
                  <p className="mt-4 text-sm leading-relaxed ">
                    {certificate.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {/* We're Open & Ready to Care */}
      <div className="mt-10 grid h-[350px] grid-cols-1 gap-6 overflow-hidden rounded-[32px] bg-[#f7f3ee] p-6 lg:grid-cols-2 lg:gap-8 lg:p-8">

        {/* Left Content */}
        <div className="flex min-h-0 flex-col justify-center">
          <h4 className="font-marcellus text-3xl leading-tight tracking-tight text-ink-900 lg:text-4xl">
            {section.appointment_heading || "We’re Open & Ready to Care"}
          </h4>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
            {section.appointment_description ||
              "Drop by during our working hours or schedule an appointment that fits your day."}
          </p>

          <a
            href="#"
            className="mt-4 inline-flex w-fit items-center gap-3 rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500"
          >
            {section.appointment_button_text || "Book an Appointment"}
            <ArrowRightIcon className="h-4 w-4" />
          </a>

          <div className="mt-4 flex w-full max-w-sm items-center justify-between gap-4 rounded-2xl bg-white p-4">
            <div>
              <p className="text-xs font-semibold text-ink-700">
                {section.open_days_label || "All Days Open"}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {section.open_days_value || "Monday to Sunday"}
              </p>
            </div>

            <span className="h-10 w-px shrink-0 bg-ink-200" />

            <div>
              <p className="text-xs font-semibold text-ink-700">
                {section.office_hours_label || "Office Hours"}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {section.office_hours_value || "9:00 Am - 7 Pm"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative min-h-0">
          <div className="absolute -left-6 -top-6 hidden h-32 w-32 rounded-full bg-brand-200/60 lg:block" />

          <div className="relative h-full overflow-hidden rounded-[28px]">
            {section.appointment_image ? (
              <img
                src={resolveMediaUrl(section.appointment_image)}
                alt="Dental treatment"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-brand-200/50" />
            )}
          </div>
  </div>

</div>
      </div>
    </section>
  );
}

export default CertificatesSection;