import { useEffect, useState } from "react";
import { getContactEnquiries } from "../../services/contact/contactService";
import { getMessageClass } from "../../utils/classes";

// Every enquiry form on the site writes to the same table and records where it
// came from, so the admin gets one screen per page. Anything unexpected falls
// back to the raw stored value so a new form never shows up blank.
const SOURCE_LABELS = {
  home: "Home Page",
  "contact-us": "Contact Us Page",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(source) {
  return SOURCE_LABELS[source] || source || "";
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// The list is a table of the columns an admin scans first, and the eye button on
// each row opens the full enquiry, so area and message stay out of the way
function AdminContactEnquiries({ source }) {
  const [enquiries, setEnquiries] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Every state update happens once the request settles, so the effect body only
  // has to subscribe to it. The "active" guard drops a response that arrived
  // after the admin switched page or pressed refresh.
  useEffect(() => {
    let active = true;

    getContactEnquiries(source)
      .then((data) => {
        if (active) setEnquiries(data.enquiries || []);
      })
      .catch((err) => {
        if (active) setMessage({ type: "error", text: err.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [source, reloadKey]);

  // Escape closes the popup
  useEffect(() => {
    if (!selected) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  const handleRefresh = () => {
    setMessage({ type: "", text: "" });
    setSelected(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const label = sourceLabel(source);

  const detailClass = "font-medium text-ink-900";
  const detailLabelClass =
    "mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Contact Enquiry
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            {label} Enquiries
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Enquiries submitted from the {label.toLowerCase()}, newest first.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-500">
              {loading
                ? "Loading..."
                : `${enquiries.length} ${
                    enquiries.length === 1 ? "enquiry" : "enquiries"
                  }`}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="cursor-pointer rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {message.text && (
            <p className={getMessageClass(message.type)}>{message.text}</p>
          )}

          {!loading && message.text === "" && enquiries.length === 0 && (
            <p className="text-sm text-ink-500">
              No enquiries yet. When a visitor submits the {label.toLowerCase()}{" "}
              enquiry form, it will appear here.
            </p>
          )}

          {!loading && enquiries.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-brand-100">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-brand-50">
                  <tr className="border-b border-brand-100 text-xs uppercase tracking-wider text-ink-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      #
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Email
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Number
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="border-b border-brand-50 text-sm transition last:border-0 hover:bg-brand-50/50"
                    >
                      <td className="px-5 py-4 font-semibold text-brand-700">
                        {enquiry.id}
                      </td>
                      <td className="px-5 py-4 font-medium text-ink-900">
                        {enquiry.name || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="font-medium text-brand-700 underline hover:text-brand-900"
                        >
                          {enquiry.email || "-"}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-ink-700">
                        {enquiry.number || "-"}
                      </td>
                      <td className="px-5 py-4 text-ink-500">
                        {formatDate(enquiry.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(enquiry)}
                          title="View enquiry"
                          aria-label={`View enquiry ${enquiry.id}`}
                          className="cursor-pointer rounded-lg border border-brand-200 bg-white p-2 text-brand-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
                        >
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Popup with the rest of the enquiry, including the area and the message */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-6 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                  Enquiry #{selected.id}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-900">
                  {selected.name || "-"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="shrink-0 cursor-pointer rounded-lg p-1.5 text-brand-700 transition hover:bg-brand-200/60"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <span className={detailLabelClass}>Name</span>
                  <span className={detailClass}>{selected.name || "-"}</span>
                </div>

                <div>
                  <span className={detailLabelClass}>Email</span>
                  <a
                    href={`mailto:${selected.email}`}
                    className={`${detailClass} underline hover:text-brand-700`}
                  >
                    {selected.email || "-"}
                  </a>
                </div>

                <div>
                  <span className={detailLabelClass}>Number</span>
                  <span className={detailClass}>{selected.number || "-"}</span>
                </div>

                <div>
                  <span className={detailLabelClass}>Area</span>
                  <span className={detailClass}>{selected.area || "-"}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className={detailLabelClass}>Date</span>
                  <span className={detailClass}>
                    {formatDate(selected.createdAt)}
                  </span>
                </div>
              </div>

              <div>
                <span className={detailLabelClass}>Message</span>
                <p className="rounded-2xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-sm leading-relaxed text-ink-700">
                  {selected.message || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactEnquiries;