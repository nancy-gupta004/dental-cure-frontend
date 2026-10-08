import ServiceDentalSection from "../../components/service/ServiceDentalSection";
import HealthierSmileSection from "../../components/service/HealthierSmileSection";
import Footer from "../../components/footer/Footer";

function Service() {
  return (
    <>
      <ServiceDentalSection />
      <HealthierSmileSection />

      {/* The footer is the last block of every public page */}
      <Footer />
    </>
  );
}

export default Service;
