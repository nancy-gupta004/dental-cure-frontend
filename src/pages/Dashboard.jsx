import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { fetchMe, logout } from "../services/auth/authService";
import {
  getToken,
  getRefreshToken,
  clearAuth,
  getStoredUser,
} from "../utils/auth";
import { PAGES, HOME_SECTIONS, ABOUT_SECTIONS, SERVICE_SECTIONS, TECHNOLOGY_SECTIONS, INTERNATIONAL_PATIENTS_SECTIONS, TESTIMONIAL_GALLERY_SECTIONS, TESTIMONIAL_VIDEO_SECTIONS, CONTACT_SECTIONS, FOOTER_SECTIONS } from "../constants/pages";

const ADMIN_LINK = { label: "User Management", path: "/dashboard/admin/users" };

// Sits below User Management and opens into the page an enquiry came from, so
// each enquiry form on the site has its own list
const ENQUIRY_LINK = {
  label: "Contact Enquiry",
  path: "/dashboard/contact-enquiries",
  sections: [
    { key: "enquiry.home", label: "Home Page", path: "/dashboard/contact-enquiries/home" },
    { key: "enquiry.contact-us", label: "Contact Us Page", path: "/dashboard/contact-enquiries/contact-us" },
  ],
};

// Pages that contain their own collapsible section lists appear as accordions
const PAGE_SECTIONS = {
  home: HOME_SECTIONS,
  "about us": ABOUT_SECTIONS,
  service: SERVICE_SECTIONS,
  technology: TECHNOLOGY_SECTIONS,
  "international patients": INTERNATIONAL_PATIENTS_SECTIONS,
  "testimonial gallery": TESTIMONIAL_GALLERY_SECTIONS,
  "testimonial video": TESTIMONIAL_VIDEO_SECTIONS,
  contact: CONTACT_SECTIONS,
  footer: FOOTER_SECTIONS,
};

function Chevron({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const linkClass = (path, activePath) =>
  `block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
    activePath === path
      ? "bg-brand-500 text-white shadow-md shadow-brand-400/40"
      : "text-ink-700 hover:bg-brand-50 hover:text-brand-800"
  }`;

const childLinkClass = (path, activePath) =>
  `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
    activePath === path
      ? "bg-brand-500 text-white shadow-md shadow-brand-400/40"
      : "text-ink-500 hover:bg-brand-50 hover:text-brand-800"
  }`;

// Sidebar items may be a plain link or a collapsible accordion (pages that
// have their own section list, e.g. Home and About us)
function SidebarItems({ pages, activePath }) {
  const [openKeys, setOpenKeys] = useState(() => {
    const initial = {};
    pages.forEach((page) => {
      if (PAGE_SECTIONS[page.key]) {
        const base = page.path;
        initial[page.key] =
          activePath === base || activePath.startsWith(`${base}/`);
      }
    });
    return initial;
  });

  const isSectionActive = (page) =>
    activePath === page.path || activePath.startsWith(`${page.path}/`);

  return pages.map((page) => {
    const sections = PAGE_SECTIONS[page.key];

    if (sections) {
      const open = openKeys[page.key];
      const active = isSectionActive(page);
      return (
        <div key={page.key}>
          <button
            type="button"
            onClick={() => setOpenKeys({ ...openKeys, [page.key]: !open })}
            className={`flex w-full items-center justify-between gap-2 text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-brand-500 text-white shadow-md shadow-brand-400/40"
                : "text-ink-700 hover:bg-brand-50 hover:text-brand-800"
            }`}
          >
            <span>{page.label}</span>
            <Chevron open={open} />
          </button>

          {open && (
            <div className="ml-4 mt-1 space-y-1 border-l border-brand-200 pl-3">
              {sections.map((section) => (
                <Link
                  key={section.key}
                  to={section.path}
                  className={childLinkClass(section.path, activePath)}
                >
                  {section.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={page.key} to={page.path} className={linkClass(page.path, activePath)}>
        {page.label}
      </Link>
    );
  });
}

// Contact Enquiry opens into one list per page of the site
function EnquiryAccordion({ activePath }) {
  const active =
    activePath === ENQUIRY_LINK.path ||
    activePath.startsWith(`${ENQUIRY_LINK.path}/`);

  const [open, setOpen] = useState(active);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          active
            ? "bg-brand-500 text-white shadow-md shadow-brand-400/40"
            : "text-ink-700 hover:bg-brand-50 hover:text-brand-800"
        }`}
      >
        <span>{ENQUIRY_LINK.label}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l border-brand-200 pl-3">
          {ENQUIRY_LINK.sections.map((section) => (
            <Link
              key={section.key}
              to={section.path}
              className={childLinkClass(section.path, activePath)}
            >
              {section.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ user, pages, activePath, onLogout }) {
  return (
    <aside className="h-screen flex w-60 flex-none flex-col border-r border-brand-100 bg-white/80 backdrop-blur-sm">
      
      {/* Header - fixed */}
      <div className="border-b border-brand-100 px-6 py-5">
        <p className="text-base font-semibold leading-tight text-ink-900">
          The Dental Cure
        </p>

        <p className="mt-0.5 text-xs text-ink-500">
          {user.email}
        </p>

        <span className="mt-2 inline-block rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {user.role}
        </span>
      </div>

      {/* Only this area scrolls */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
        <SidebarItems pages={pages} activePath={activePath} />

        {user.role === "admin" && (
          <Link
            to={ADMIN_LINK.path}
            className={linkClass(ADMIN_LINK.path, activePath)}
          >
            {ADMIN_LINK.label}
          </Link>
        )}

        {user.role === "admin" && <EnquiryAccordion activePath={activePath} />}
      </nav>

      {/* Logout - fixed */}
      <div className="border-t border-brand-100 p-3">
        <button
          onClick={onLogout}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-800"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());
  const [permissions, setPermissions] = useState([]);
  const [ready, setReady] = useState(false);

  const handleLogout = async () => {
    const token = getToken();
    const refreshToken = getRefreshToken();

    if (token && refreshToken) {
      try {
        await logout(refreshToken);
      } catch (error) {
        console.warn("Logout API failed:", error.message);
      }
    }

    clearAuth();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }

    fetchMe()
      .then((data) => {
        setUser(data.user);
        setPermissions(data.user.permissions || []);
        setReady(true);
      })
      .catch((error) => {
        console.warn(error.message);
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 text-sm text-ink-500">
        Loading...
      </div>
    );
  }

  const allowedPages =
    user.role === "admin"
      ? PAGES
      : PAGES.filter((page) => permissions.includes(page.key));

  // Opening /dashboard should land on the first allowed page
  if (location.pathname === "/dashboard") {
    const firstPage =
      allowedPages.length > 0 ? allowedPages[0].path : "/dashboard/home";
    return <Navigate to={firstPage} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-white">
        <Sidebar
        user={user}
        pages={allowedPages}
        activePath={location.pathname}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-8 ">
        <Outlet />
        <p className="mt-8 text-center text-xs text-ink-400">
          {user.name} · {user.email}
        </p>
      </main>
    </div>
  );
}

export default Dashboard;