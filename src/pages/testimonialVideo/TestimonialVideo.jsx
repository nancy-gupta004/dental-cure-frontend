import TestimonialVideoHeaderSection from "../../components/testimonialVideo/TestimonialVideoHeaderSection";
import Benefit from "../../components/testimonialVideo/Benefit";
import Playlist from "../../components/testimonialVideo/Playlist";
import Footer from "../../components/footer/Footer";

function TestimonialVideo() {
  return (
    <>
      {/* The header band is always the first section of the Testimonial Video page */}
      <TestimonialVideoHeaderSection />
  <Playlist />
      {/* Benefit section shown under the header */}
      <Benefit />

      {/* Playlist section with the video player */}
    

      <Footer />
    </>
  );
}

export default TestimonialVideo;