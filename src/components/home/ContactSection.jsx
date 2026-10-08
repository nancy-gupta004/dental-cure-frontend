import { useEffect, useState } from "react";
import { getContact, submitContactEnquiry } from "../../services/contact/contactService";
import { resolveMediaUrl } from "../../utils/media";

const AREAS = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Other",
];

function ContactSection() {
  const [section, setSection] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    area: "",
    message: "",
  });
  const [messageBox, setMessageBox] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getContact()
      .then((data) => {
        const contact = data.contact || {};
        setSection(contact);
      })
      .catch(() => setSection(null));
  }, []);

  if (!section) return null;

  const hasContent =
    section.text ||
    section.heading ||
    section.description ||
    section.image ||
    section.button_text;

  if (!hasContent) return null;

  const handleChange = (e) => {
    setMessageBox({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessageBox({ type: "", text: "" });

    if (!form.name.trim()) {
      setMessageBox({ type: "error", text: "Please enter your name" });
      return;
    }
    if (!form.email.trim()) {
      setMessageBox({ type: "error", text: "Please enter your email" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessageBox({ type: "error", text: "Please enter a valid email address" });
      return;
    }
    if (!form.number.trim()) {
      setMessageBox({ type: "error", text: "Please enter your number" });
      return;
    }
    if (!form.area) {
      setMessageBox({ type: "error", text: "Please select your area" });
      return;
    }
    if (!form.message.trim()) {
      setMessageBox({ type: "error", text: "Please enter your message" });
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitContactEnquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        number: form.number.trim(),
        area: form.area,
        message: form.message.trim(),
        // Records that this submission came from the Home page, so the single
        // admin Contact Enquiry list can show where it was sent from
        source: "home",
      });
      setForm({ name: "", email: "", number: "", area: "", message: "" });
      setMessageBox({ type: "success", text: data.message || "Enquiry sent successfully" });
    } catch (err) {
      setMessageBox({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-ink-100 bg-white px-5 py-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-200/60";

  return (
    <section className="overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ================= LEFT: TEXT + FORM ================= */}
          <div>
            {section.text && (
              <p className="text-xs font-medium italic tracking-[0.2em] text-brand-600">
                {section.text}
              </p>
            )}

            {section.heading && (
              <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
                {section.heading}
              </h2>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={section.text_1 || "Your Name"}
                  className={inputClass}
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={section.text_2 || "Your Email"}
                  className={inputClass}
                />
              </div>

              <div>
                <input
                  type="tel"
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  placeholder={section.text_3 || "Your Number"}
                  className={inputClass}
                />
              </div>

              <div>
                <select
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  className={`${inputClass} ${form.area ? "" : "text-ink-300"}`}
                >
                  <option value="" disabled>
                    {section.text_4 || "Your Area"}
                  </option>
                  {AREAS.map((area) => (
                    <option key={area} value={area} className="text-ink-900">
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <textarea
                  name="message"
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={section.text_5 || "Message"}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {messageBox.text && (
                <p
                  className={
                    messageBox.type === "success"
                      ? "rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
                      : "rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                  }
                >
                  {messageBox.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-b from-brand-400 to-brand-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-400/40 transition hover:from-brand-300 hover:to-brand-500 disabled:opacity-60 sm:w-auto"
              >
                {submitting
                  ? "Sending..."
                  : section.button_text || "Get Appointment Now"}
              </button>
            </form>
          </div>

          {/* ================= RIGHT: DESCRIPTION + IMAGE ================= */}
          <div className="flex flex-col justify-center">
            {section.description && (
              <p className="text-base leading-relaxed text-ink-500 sm:text-lg">
                {section.description}
              </p>
            )}

            {section.image && (
              <div className="mt-8 overflow-hidden rounded-[2rem] rounded-tl-[6rem] border border-brand-100 bg-brand-50 p-3 sm:p-4">
                <img
                  src={resolveMediaUrl(section.image)}
                  alt={section.heading || "Contact Us"}
                  className="h-full max-h-[520px] w-full rounded-[1.5rem] rounded-tl-[4rem] object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;