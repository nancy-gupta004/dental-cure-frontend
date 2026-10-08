import { useEffect, useState } from "react";
import { getFooterSetting } from "../../services/footer/footerService";
import { getFooterServices } from "../../services/footer/serviceItemService";
import { getFooterAddresses } from "../../services/footer/addressService";
import { resolveMediaUrl } from "../../utils/media";

function Footer() {
  const [footerSetting, setFooterSetting] = useState(null);
  const [servicesData, setServicesData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFooterSetting().catch(() => ({ footerSetting: null })),
      getFooterServices().catch(() => null),
      getFooterAddresses().catch(() => []),
    ])
      .then(([settingRes, servicesRes, addressesRes]) => {
        setFooterSetting(settingRes?.footerSetting || null);
        setServicesData(servicesRes || null);
        setAddresses(addressesRes?.addresses || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // The footer is shared by every page, so nothing is drawn until content is loaded
  if (loading || (!footerSetting && !servicesData && addresses.length === 0)) {
    return null;
  }

  const hasSocials =
    footerSetting?.socials && footerSetting.socials.length > 0;
  const hasSocialText = Boolean(footerSetting?.socialText);

  const hasServices =
    servicesData?.services && servicesData.services.length > 0;
  const hasServicesText = Boolean(servicesData?.text);

  const hasQuickLinks =
    footerSetting?.quickLinks && footerSetting.quickLinks.length > 0;

  const hasAddresses = addresses.length > 0;

  return (
    <footer className="bg-brand-900 px-5 py-14 text-brand-100 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Main top row: Logo, Description & Newsletter button */}
        {footerSetting && (
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            {/* Logo */}
            {footerSetting.logo && (
              <div className="shrink-0">
                <img
                  src={resolveMediaUrl(footerSetting.logo)}
                  alt="Footer logo"
                  className="h-16 w-auto rounded-lg bg-white/95 object-contain p-2"
                />
              </div>
            )}

            {/* Description */}
            {footerSetting.description && (
              <div className="max-w-2xl flex-1">
                <p className="text-sm leading-relaxed text-brand-100">
                  {footerSetting.description}
                </p>
              </div>
            )}

            {/* Newsletter Call To Action */}
            {footerSetting.newsletterButtonText && (
              <div className="shrink-0">
                <button
                  type="button"
                  className="cursor-pointer rounded-full bg-gradient-to-b from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:from-brand-300 hover:to-brand-400"
                >
                  {footerSetting.newsletterButtonText}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Services Links Section */}
        {(hasServicesText || hasServices) && (
          <div className="mt-12 border-t border-brand-800/80 pt-8">
            {hasServicesText && (
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-300 sm:text-sm">
                {servicesData.text}
              </h3>
            )}
            {hasServices && (
              <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {servicesData.services.map((item, index) => (
                  <li key={item.id || index}>
                    <a
                      href={item.url}
                      className="text-sm font-medium text-brand-200/90 transition hover:text-white hover:underline underline-offset-4"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Quick Links Section */}
        {footerSetting && hasQuickLinks && (
          <div className="mt-8 border-t border-brand-800/80 pt-8">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-300 sm:text-sm">
              Quick Links
            </h3>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {footerSetting.quickLinks.map((item, index) => (
                <li key={item.id || index}>
                  <a
                    href={item.url}
                    className="text-sm font-medium text-brand-200/90 transition hover:text-white hover:underline underline-offset-4"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address Section - up to four cards per row on desktop */}
        {hasAddresses && (
          <div className="mt-8 border-t border-brand-800/80 pt-8">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-wider text-brand-300 sm:text-sm">
              Address
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-brand-800/80 bg-brand-900/40 p-5"
                >
                  {item.logo && (
                    <img
                      src={resolveMediaUrl(item.logo)}
                      alt={item.title || "Address"}
                      className="mb-4 h-12 w-auto rounded-lg bg-white/95 p-2 object-contain"
                    />
                  )}
                  {item.title && (
                    <h4 className="text-sm font-semibold text-white">
                      {item.title}
                    </h4>
                  )}
                  {item.description && (
                    <p className="mt-1 text-xs leading-relaxed text-brand-200/90">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Section */}
        {footerSetting && (hasSocialText || hasSocials) && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-brand-800/80 pt-6 sm:flex-row">
            {/* Social Heading Text */}
            {hasSocialText && (
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 sm:text-sm">
                {footerSetting.socialText}
              </span>
            )}

            {/* Clickable Social Media Icons */}
            {hasSocials && (
              <div className="flex flex-wrap items-center gap-3">
                {footerSetting.socials.map((item, index) => (
                  <a
                    key={item.id || index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.url}
                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-brand-800/80 p-2 text-brand-100 shadow-sm transition hover:scale-110 hover:bg-brand-500 hover:text-white"
                  >
                    {item.icon ? (
                      <img
                        src={resolveMediaUrl(item.icon)}
                        alt="Social icon"
                        className="h-5 w-5 object-contain transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 transition-transform group-hover:scale-110"
                      >
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;