import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getServiceDetailBySlug } from "../../services/service/detailHeaderService";
import ServiceDetailHeader from "../../components/service/ServiceDetailHeader";
import ServiceDetailTreatment from "../../components/service/ServiceDetailTreatment";
import ServiceDetailTreatmentProcess from "../../components/service/ServiceDetailTreatmentProcess";
import ServiceDetailBenefit from "../../components/service/ServiceDetailBenefit";
import SmileResultsSection from "../../components/service/SmileResultsSection";
import LocationSection from "../../components/service/LocationSection";
import Testimonialssection from "../../components/home/TestimonialsSection";
import Footer from "../../components/footer/Footer";

function ServiceDetail() {
  // The slug comes straight from the /services/:slug route, so the page never
  // hardcodes a service - every value is resolved by the backend from it
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Without a slug there is nothing to resolve, so the request is skipped
    // and the empty state below is rendered instead
    if (!slug) return;

    getServiceDetailBySlug(slug)
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // All sections come from the same slug, so they always belong to the same
  // service card. A section the admin has not filled in is null and is skipped
  // without affecting the other ones.
  const header = data?.detail?.header || null;
  const treatment = data?.detail?.treatment || null;
  const treatmentProcess = data?.detail?.treatmentProcess || null;
  const benefits = data?.detail?.benefits || null;
  const smileResults = data?.detail?.smileResults || null;
  const location = data?.detail?.location || null;
  // The card heading of the resolved service, used for the image alt text of
  // the before/after pairs
  const serviceName = data?.service?.heading || "";
  const missing = error || !slug;

  if (missing) {
    return (
      <section className="bg-brand-50 px-5 py-24 sm:px-8">
        <p className="text-center text-sm text-ink-500">
          {error || "Service not found."}
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-brand-50 px-5 py-24 sm:px-8">
        <p className="text-center text-sm text-ink-500">Loading...</p>
      </section>
    );
  }

  if (
    !header &&
    !treatment &&
    !treatmentProcess &&
    !benefits &&
    !smileResults &&
    !location
  ) {
    return (
      <section className="bg-brand-50 px-5 py-24 sm:px-8">
        <p className="text-center text-sm text-ink-500">
          This service does not have detail content yet.
        </p>
      </section>
    );
  }

  return (
    <>
      {header && <ServiceDetailHeader header={header} />}
      {treatment && <ServiceDetailTreatment treatment={treatment} />}
      {treatmentProcess && (
        <ServiceDetailTreatmentProcess treatmentProcess={treatmentProcess} />
      )}
      {benefits && <ServiceDetailBenefit benefits={benefits} />}
       {<Testimonialssection />}

      {smileResults && (
        <SmileResultsSection
          smileResults={smileResults}
          serviceName={serviceName}
        />
      )}

      {location && <LocationSection location={location} />}

      {/* The footer is the last block of every public page */}
      <Footer />
    </>
  );
}

export default ServiceDetail;
