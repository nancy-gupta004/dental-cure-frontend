import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Service from "./pages/service/Service";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import ContentPage from "./pages/ContentPage";
import AdminUsers from "./pages/auth/AdminUsers";
import HomeSettings from "./pages/home/HomeSettings";
import AdminHomeHeader from "./pages/home/AdminHomeHeader";
import AdminDrSection from "./pages/home/AdminDrSection";
import AdminDentalTreatments from "./pages/home/AdminDentalTreatments";
import AdminDentalServices from "./pages/home/AdminDentalServices";
import AdminTestimonials from "./pages/home/AdminTestimonials";
import AdminTrustedCare from "./pages/home/AdminTrustedCare";
import AdminTeams from "./pages/home/AdminTeams";
import AdminCertificates from "./pages/home/AdminCertificates";
import AdminBeforeAfter from "./pages/home/AdminBeforeAfter";
import AdminGallery from "./pages/home/AdminGallery";
import AdminBlog from "./pages/home/AdminBlog";
import AdminContactUs from "./pages/contact/AdminContactUs";
import AdminContactHeader from "./pages/contact/AdminContactHeader";
import AdminContactConnectUs from "./pages/contact/AdminContactConnectUs";
import AdminContactClinics from "./pages/contact/AdminContactClinics";
import AdminContactEnquiries from "./pages/contact/AdminContactEnquiries";
import AdminNeedHelp from "./pages/home/AdminNeedHelp";
import AdminAboutSection from "./pages/about/AdminAboutSection";
import AdminDentalCureSection from "./pages/about/AdminDentalCureSection";
import AdminPromiseSection from "./pages/about/AdminPromiseSection";
import AdminFounderSection from "./pages/about/AdminFounderSection";
import AdminDentalSection from "./pages/about/AdminDentalSection";
import AdminTreatmentProcess from "./pages/about/AdminTreatmentProcess";
import AdminTestimonialSection from "./pages/about/AdminTestimonialSection";
import AdminGallerySection from "./pages/about/AdminGallerySection";
import AdminQuestionSection from "./pages/about/AdminQuestionSection";
import AdminServiceHeader from "./pages/service/AdminServiceHeader";
import AdminDentalCare from "./pages/service/AdminDentalCare";
import AdminServiceDental from "./pages/service/AdminServiceDental";
import AdminServiceDetail from "./pages/service/AdminServiceDetail";
import AdminHealthierSmile from "./pages/service/AdminHealthierSmile";
import ServiceDetail from "./pages/service/ServiceDetail";
import Contact from "./pages/contact/Contact";
import InternationalPatients from "./pages/internationalPatients/InternationalPatients";
import AdminInternationalPatientsHeader from "./pages/internationalPatients/AdminInternationalPatientsHeader";
import InternationalPatientsDental from "./pages/internationalPatients/Dental";
import InternationalPatientsImage from "./pages/internationalPatients/Image";
import Technology from "./pages/technology/Technology";
import AdminTechnologyHeader from "./pages/technology/AdminTechnologyHeader";
import AdminTechnologyAbout from "./pages/technology/AdminTechnologyAbout";
import AdminTechnologyProcess from "./pages/technology/AdminTechnologyProcess";
import AdminTechnologyBenefit from "./pages/technology/AdminTechnologyBenefit";
import AdminTechnologyExperience from "./pages/technology/AdminTechnologyExperience";
import TestimonialGallery from "./pages/testimonialGallery/TestimonialGallery";
import AdminTestimonialGalleryHeader from "./pages/testimonialGallery/AdminTestimonialGalleryHeader";
import AdminTestimonialGallery from "./pages/testimonialGallery/AdminTestimonialGallery";
import TestimonialVideo from "./pages/testimonialVideo/TestimonialVideo";
import AdminTestimonialVideoHeader from "./pages/testimonialVideo/AdminTestimonialVideoHeader";
import AdminBenefit from "./pages/testimonialVideo/AdminBenefit";
import AdminPlaylist from "./pages/testimonialVideo/AdminPlaylist";
import AdminFooter from "./pages/footer/Footer";
import AdminFooterServices from "./pages/footer/AdminFooterServices";
import AdminFooterQuickLink from "./pages/footer/AdminFooterQuickLink";
import AdminFooterAddress from "./pages/footer/AdminFooterAddress";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminOnly from "./components/auth/AdminOnly";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Service />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/international-patients" element={<InternationalPatients />} />
        <Route path="/technology" element={<Technology />} />
        <Route path="/testimonial-gallery" element={<TestimonialGallery />} />
        <Route path="/testimonial-video" element={<TestimonialVideo />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="home">
            <Route index element={<HomeSettings />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminHomeHeader />
                </AdminOnly>
              }
            />
            <Route
              path="dr"
              element={
                <AdminOnly>
                  <AdminDrSection />
                </AdminOnly>
              }
            />
            <Route
              path="treatments"
              element={
                <AdminOnly>
                  <AdminDentalTreatments />
                </AdminOnly>
              }
            />
            <Route
              path="trusted-care"
              element={
                <AdminOnly>
                  <AdminTrustedCare />
                </AdminOnly>
              }
            />
            <Route
              path="teams"
              element={
                <AdminOnly>
                  <AdminTeams />
                </AdminOnly>
              }
            />
            <Route
              path="certificates"
              element={
                <AdminOnly>
                  <AdminCertificates />
                </AdminOnly>
              }
            />
            <Route
              path="services"
              element={
                <AdminOnly>
                  <AdminDentalServices />
                </AdminOnly>
              }
            />
            <Route
              path="before-after"
              element={
                <AdminOnly>
                  <AdminBeforeAfter />
                </AdminOnly>
              }
            />
            <Route
              path="testimonials"
              element={
                <AdminOnly>
                  <AdminTestimonials />
                </AdminOnly>
              }
            />
            <Route
              path="gallery"
              element={
                <AdminOnly>
                  <AdminGallery />
                </AdminOnly>
              }
            />
            <Route
              path="blog"
              element={
                <AdminOnly>
                  <AdminBlog />
                </AdminOnly>
              }
            />
            <Route
              path="contact"
              element={
                <AdminOnly>
                  <AdminContactUs />
                </AdminOnly>
              }
            />
            <Route
              path="need-help"
              element={
                <AdminOnly>
                  <AdminNeedHelp />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="about">
            <Route index element={<ContentPage pageKey="about" />} />
            <Route
              path="about-section"
              element={
                <AdminOnly>
                  <AdminAboutSection />
                </AdminOnly>
              }
            />
            <Route
              path="dental-cure"
              element={
                <AdminOnly>
                  <AdminDentalCureSection />
                </AdminOnly>
              }
            />
            <Route
              path="promise"
              element={
                <AdminOnly>
                  <AdminPromiseSection />
                </AdminOnly>
              }
            />
            <Route
              path="founder"
              element={
                <AdminOnly>
                  <AdminFounderSection />
                </AdminOnly>
              }
            />
            <Route
              path="dental"
              element={
                <AdminOnly>
                  <AdminDentalSection />
                </AdminOnly>
              }
            />
            <Route
              path="treatment-process"
              element={
                <AdminOnly>
                  <AdminTreatmentProcess />
                </AdminOnly>
              }
            />
            <Route
              path="testimonial"
              element={
                <AdminOnly>
                  <AdminTestimonialSection />
                </AdminOnly>
              }
            />
            <Route
              path="gallery"
              element={
                <AdminOnly>
                  <AdminGallerySection />
                </AdminOnly>
              }
            />
            <Route
              path="question"
              element={
                <AdminOnly>
                  <AdminQuestionSection />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="service">
            <Route index element={<ContentPage pageKey="service" />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminServiceHeader />
                </AdminOnly>
              }
            />
            <Route
              path="dental-care"
              element={
                <AdminOnly>
                  <AdminDentalCare />
                </AdminOnly>
              }
            />
            <Route
              path="healthier-smile"
              element={
                <AdminOnly>
                  <AdminHealthierSmile />
                </AdminOnly>
              }
            />
            <Route path="dental">
              <Route
                index
                element={
                  <AdminOnly>
                    <AdminServiceDental />
                  </AdminOnly>
                }
              />
              {/* Detail page of a single service card, identified by its card id */}
              <Route
                path=":serviceCardId/details"
                element={
                  <AdminOnly>
                    <AdminServiceDetail />
                  </AdminOnly>
                }
              />
            </Route>
          </Route>
          <Route path="international-patients">
            {/* The header is the first section of the page, so the index sends you there */}
            <Route index element={<Navigate to="header" replace />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminInternationalPatientsHeader />
                </AdminOnly>
              }
            />
            <Route
              path="dental"
              element={
                <AdminOnly>
                  <InternationalPatientsDental />
                </AdminOnly>
              }
            />
            <Route
              path="image"
              element={
                <AdminOnly>
                  <InternationalPatientsImage />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="testimonial-gallery">
            {/* The header is the first section of the page, so the index sends you there */}
            <Route index element={<Navigate to="header" replace />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminTestimonialGalleryHeader />
                </AdminOnly>
              }
            />
            <Route
              path="gallery"
              element={
                <AdminOnly>
                  <AdminTestimonialGallery />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="testimonial-video">
            {/* The header is the first section of the page, so the index sends you there */}
            <Route index element={<Navigate to="header" replace />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminTestimonialVideoHeader />
                </AdminOnly>
              }
            />
            <Route
              path="benefit"
              element={
                <AdminOnly>
                  <AdminBenefit />
                </AdminOnly>
              }
            />
            <Route
              path="playlist"
              element={
                <AdminOnly>
                  <AdminPlaylist />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="technology">
            {/* The header is the first section of the page, so the index sends you there */}
            <Route index element={<Navigate to="header" replace />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminTechnologyHeader />
                </AdminOnly>
              }
            />
            <Route
              path="about"
              element={
                <AdminOnly>
                  <AdminTechnologyAbout />
                </AdminOnly>
              }
            />
            <Route
              path="process"
              element={
                <AdminOnly>
                  <AdminTechnologyProcess />
                </AdminOnly>
              }
            />
            <Route
              path="benefit"
              element={
                <AdminOnly>
                  <AdminTechnologyBenefit />
                </AdminOnly>
              }
            />
            <Route
              path="experience"
              element={
                <AdminOnly>
                  <AdminTechnologyExperience />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="contact">
            <Route index element={<ContentPage pageKey="contact" />} />
            <Route
              path="header"
              element={
                <AdminOnly>
                  <AdminContactHeader />
                </AdminOnly>
              }
            />
            <Route
              path="connect-us"
              element={
                <AdminOnly>
                  <AdminContactConnectUs />
                </AdminOnly>
              }
            />
            <Route
              path="clinics"
              element={
                <AdminOnly>
                  <AdminContactClinics />
                </AdminOnly>
              }
            />
          </Route>
          <Route path="footer">
            {/* Footer Setting is the first section of the footer, so the index sends you there */}
            <Route index element={<Navigate to="setting" replace />} />
            <Route
              path="setting"
              element={
                <AdminOnly>
                  <AdminFooter />
                </AdminOnly>
              }
            />
            <Route
              path="services"
              element={
                <AdminOnly>
                  <AdminFooterServices />
                </AdminOnly>
              }
            />
            <Route
              path="quick-links"
              element={
                <AdminOnly>
                  <AdminFooterQuickLink />
                </AdminOnly>
              }
            />
            <Route
              path="address"
              element={
                <AdminOnly>
                  <AdminFooterAddress />
                </AdminOnly>
              }
            />
          </Route>
          <Route
            path="admin/users"
            element={
              <AdminOnly>
                <AdminUsers />
              </AdminOnly>
            }
          />
          {/* One enquiry list per page of the site, so the admin can open the
              page an enquiry came from */}
          <Route path="contact-enquiries">
            <Route index element={<Navigate to="home" replace />} />
            <Route
              path="home"
              element={
                <AdminOnly>
                  <AdminContactEnquiries source="home" />
                </AdminOnly>
              }
            />
            <Route
              path="contact-us"
              element={
                <AdminOnly>
                  <AdminContactEnquiries source="contact-us" />
                </AdminOnly>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;