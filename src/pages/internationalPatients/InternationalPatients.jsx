import InternationalPatientsHeaderSection from "../../components/internationalPatients/InternationalPatientsHeaderSection";
import Dental from "../../components/internationalPatients/Dental";
import Image from "../../components/internationalPatients/Image";
import Footer from "../../components/footer/Footer";

function InternationalPatients() {
  return (
    <>
      {/* The header band is always the first section of the International Patients page */}
      <InternationalPatientsHeaderSection />
      {/* The Dental section follows the header */}
      <Dental />
      {/* The Image section is the last section of the International Patients page */}
      <Image />

      {/* The footer is the last block of every public page */}
      <Footer />
    </>
  );
}

export default InternationalPatients;