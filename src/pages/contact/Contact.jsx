import ContactHeaderSection from "../../components/contact/ContactHeaderSection";
import ConnectUsSection from "../../components/contact/ConnectUsSection";
import ClinicsSection from "../../components/contact/ClinicsSection";
import Footer from "../../components/footer/Footer";

function Contact() {
  return (
    <>
      {/* The header band is always the first section of the Contact Us page */}
      <ContactHeaderSection />

      {/* The Connect Us section follows the header */}
      <ConnectUsSection />

      {/* The Clinics section is the last section of the Contact Us page */}
      <ClinicsSection />

      {/* The footer is the last block of every public page */}
      <Footer />
    </>
  );
}

export default Contact;
