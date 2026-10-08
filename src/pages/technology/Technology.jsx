import TechnologyHeaderSection from "../../components/technology/TechnologyHeaderSection";
import TechnologyAboutSection from "../../components/technology/TechnologyAboutSection";
import TechnologyProcessSection from "../../components/technology/TechnologyProcessSection";
import TechnologyBenefitSection from "../../components/technology/TechnologyBenefitSection";
import TechnologyExperienceSection from "../../components/technology/TechnologyExperienceSection";
import Footer from "../../components/footer/Footer";

function Technology() {
  return (
    <>
      {/* The header band is always the first section of the Technology page */}
      <TechnologyHeaderSection />
      {/* The About section follows the header */}
      <TechnologyAboutSection />
      {/* The Process section follows the About section */}
      <TechnologyProcessSection />
      {/* The Benefit section follows the Process section */}
      <TechnologyBenefitSection />
      {/* The Experience section follows the Benefit section */}
      <TechnologyExperienceSection />

      {/* The footer is the last block of every public page */}
      <Footer />
    </>
  );
}

export default Technology;