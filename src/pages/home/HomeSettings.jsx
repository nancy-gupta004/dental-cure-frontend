import { getStoredUser } from "../../utils/auth";
import AdminHomeHeader from "./AdminHomeHeader";
import AdminDrSection from "./AdminDrSection";
import AdminTestimonials from "./AdminTestimonials";
import AdminTeams from "./AdminTeams";
import ContentPage from "../ContentPage";

function HomeSettings() {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  return (
    <>
      {isAdmin && (
        <>
          {/* <AdminHomeHeader />
          <AdminDrSection />
          <AdminTeams />
          <AdminTestimonials /> */}
        </>
      )}
      <div className="mt-8">
        <ContentPage pageKey="home" />
      </div>
    </>
  );
}

export default HomeSettings;