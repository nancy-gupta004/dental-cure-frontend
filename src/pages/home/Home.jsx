import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ToothMark from "../../components/ToothMark";
import DrSection from "../../components/home/DrSection";
import DentalServicesSection from "../../components/home/DentalServicesSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import TrustedCareSection from "../../components/home/TrustedCareSection";
import TeamsSection from "../../components/home/TeamsSection";
import CertificatesSection from "../../components/home/CertificatesSection";
import BeforeAfterSection from "../../components/home/BeforeAfterSection";
import GallerySection from "../../components/home/GallerySection";
import ContactSection from "../../components/home/ContactSection";
import Footer from "../../components/footer/Footer";
import { getHomeHeader } from "../../services/home/homeService";
import { resolveMediaUrl } from "../../utils/media";

// A link without a path keeps its placeholder anchor, so a page is only linked
// once its public route exists
const navLinks = [
  { label: "Home" },
  { label: "About us" },
  { label: "Services", path: "/services" },
  { label: "International Patients", path: "/international-patients" },
  // { label: "Testimonial Gallery", path: "/testimonial-gallery" },
  // { label: "Testimonial Video", path: "/testimonial-video" },
  { label: "Contact Us", path: "/contact" },
];

function Home() {
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeHeader()
      .then((data) => setHeader(data.header))
      .catch(() => setHeader(null))
      .finally(() => setLoading(false));
  }, []);

  const videoUrl = header?.background_video
    ? resolveMediaUrl(header.background_video)
    : null;

  const logoUrl = header?.logo ? resolveMediaUrl(header.logo) : null;

  const heading = header?.heading || "Your Healthiest Smile Starts Here";
  const description =
    header?.description ||
    "Welcome to The Dental Cure. Modern dentistry delivered with gentle, compassionate care — because your smile deserves the best.";
  const buttonText = header?.button_text || "Book an Appointment";
  const buttonText1 = "Make an Appointment";
  const buttonLink = header?.button_link || "#";

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100">
      {videoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      <div className="absolute inset-0 bg-ink-900/60" />

      <header className="absolute inset-x-0 top-0 z-20">
<nav className="flex items-center justify-between px-6 pt-8 pb-5 sm:px-10">  
          <a href="#" className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="The Dental Cure"
                  className="max-h-[9rem] max-w-[9rem] object-contain"
                />
              ) : (
                <ToothMark className="h-6 w-6 fill-white" />
              )}
           
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) =>
              link.path ? (
                <Link
                  key={link.label}
                  to={link.path}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href="#"
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          <a
            href={buttonLink}
            className="rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-5 py-2.5 text-sm font-marcellus text-white shadow-lg shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500"
          >
            {buttonText1}
                      <span className="ml-2 text-sm leading-none">→</span>

          </a>
        </nav>
      </header>

   <main className="relative z-10 flex min-h-screen flex-col items-start justify-center px-6 pt-24 pb-4 text-left sm:px-10 lg:px-16">
  {loading && (
    <p className="text-sm font-medium tracking-wide text-white/70">
      Loading...
    </p>
  )}

  {!loading && (
    <div className="mt-80 max-w-3xl font-marcellus">
      <h1 className="mt-6 text-2xl leading-tight tracking-tight text-white sm:text-xl lg:text-3xl">
        {heading}
      </h1>

      <p className="mt-4 max-w-md  line-clamp-2 text-sm leading-relaxed text-white/85 sm:text-base">
        {description}
      </p>

      <a
        href={buttonLink}
        className="mt-6 inline-block rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-7 py-3 text-sm text-white shadow-xl shadow-brand-900/30 transition hover:from-brand-300 hover:to-brand-500"
      >
        {buttonText}
          <span className="ml-2 text-sm leading-none">→</span>

      </a>
    </div>
  )}
</main>
      </div>

      <DrSection />
      <DentalServicesSection />
      <TestimonialsSection />
       <TrustedCareSection />
      <TeamsSection />
      <CertificatesSection />
      <BeforeAfterSection />
      <GallerySection />
      <ContactSection />

      {/* The footer is the last block of every public page */}
      <Footer />

    </>
  );
}

export default Home;