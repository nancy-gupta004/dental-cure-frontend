import { useEffect, useState } from "react";
import { getContactConnectUs } from "../../services/contact/contactConnectUsService";
import { submitContactEnquiry } from "../../services/contact/contactService";
import { resolveMediaUrl } from "../../utils/media";

// The five Connect Us fields double as the enquiry form on the public Contact Us
// page, so each one has a fixed role. The admin only sets their labels (Text 1 to
// Text 5), which are shown above the inputs.
const EMPTY_FORM = {
  field_1: "",
  field_2: "",
  field_3: "",
  field_4: "",
  field_5: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\-\s0-9]{7,20}$/;

function ConnectUsSection() {
  const [section, setSection] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [messageBox, setMessageBox] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getContactConnectUs()
      .then((data) => {
        setSection(data.section || null);
        setCards(data.cards || []);
      })
      .catch(() => {
        setSection(null);
        setCards([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setMessageBox({ type: "", text: "" });
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Text 1 is the name, Text 2 the area, Text 3 the phone number, Text 4 the
  // email and Text 5 the message, which is what the enquiry endpoint stores.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessageBox({ type: "", text: "" });

    const name = formData.field_1.trim();
    const area = formData.field_2.trim();
    const number = formData.field_3.trim();
    const email = formData.field_4.trim();
    const message = formData.field_5.trim();

    if (!name) {
      setMessageBox({ type: "error", text: "Please enter your name" });
      return;
    }
    if (!area) {
      setMessageBox({ type: "error", text: "Please enter your area" });
      return;
    }
    if (!number) {
      setMessageBox({ type: "error", text: "Please enter your number" });
      return;
    }
    if (!PHONE_PATTERN.test(number)) {
      setMessageBox({ type: "error", text: "Please enter a valid phone number" });
      return;
    }
    if (!email) {
      setMessageBox({ type: "error", text: "Please enter your email" });
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setMessageBox({ type: "error", text: "Please enter a valid email address" });
      return;
    }
    if (!message) {
      setMessageBox({ type: "error", text: "Please enter your message" });
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitContactEnquiry({
        name,
        area,
        number,
        email,
        message,
        // Records that this submission came from the Contact Us page, so the
        // single admin Contact Enquiry list can show where it was sent from
        source: "contact-us",
      });
      setFormData(EMPTY_FORM);
      setMessageBox({
        type: "success",
        text: data.message || "Enquiry sent successfully",
      });
    } catch (err) {
      setMessageBox({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm text-ink-500">Loading...</p>
        </div>
      </section>
    );
  }

  const hasContent = Boolean(
    section &&
      (
        section.heading ||
        section.description ||
        section.text_1 ||
        section.text_2 ||
        section.text_3 ||
        section.text_4 ||
        section.text_5 ||
        section.button_name
      )
  );

  if (!hasContent && !cards.length) {
    return null;
  }

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

          {/* LEFT SIDE */}
          <div>
            {section?.heading && (
              <h2 className="font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
                {section.heading}
              </h2>
            )}

            {section?.description && (
              <p className="mt-4 max-w-2xl text-left font-sans text-base leading-relaxed text-ink-500 sm:text-lg">
                {section.description}
              </p>
            )}

            {/* CONTACT FORM */}
            <form onSubmit={handleSubmit} className="mt-8">

              {/* First Name + Last Name */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                {section?.text_1 && (
                  <div>
                    <label className="mb-2 block font-marcellus text-base text-ink-900">
                      {section.text_1}
                    </label>

                    <input
                      type="text"
                      value={formData.field_1}
                      onChange={(e) =>
                        handleChange("field_1", e.target.value)
                      }
                      placeholder={`Enter your ${section.text_1.toLowerCase()}`}
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                )}

                {section?.text_2 && (
                  <div>
                    <label className="mb-2 block font-marcellus text-base text-ink-900">
                      {section.text_2}
                    </label>

                    <input
                      type="text"
                      value={formData.field_2}
                      onChange={(e) =>
                        handleChange("field_2", e.target.value)
                      }
                      placeholder={`Enter your ${section.text_2.toLowerCase()}`}
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                )}
              </div>

              {/* Phone + Email */}
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">

                {section?.text_3 && (
                  <div>
                    <label className="mb-2 block font-marcellus text-base text-ink-900">
                      {section.text_3}
                    </label>

                    <input
                      type="tel"
                      value={formData.field_3}
                      onChange={(e) =>
                        handleChange("field_3", e.target.value)
                      }
                      placeholder={`Enter your ${section.text_3.toLowerCase()}`}
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                )}

                {section?.text_4 && (
                  <div>
                    <label className="mb-2 block font-marcellus text-base text-ink-900">
                      {section.text_4}
                    </label>

                    <input
                      type="email"
                      value={formData.field_4}
                      onChange={(e) =>
                        handleChange("field_4", e.target.value)
                      }
                      placeholder={`Enter your ${section.text_4.toLowerCase()}`}
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                )}
              </div>

              {/* Message */}
              {section?.text_5 && (
                <div className="mt-6">
                  <label className="mb-2 block font-marcellus text-base text-ink-900">
                    {section.text_5}
                  </label>

                  <textarea
                    rows="6"
                    value={formData.field_5}
                    onChange={(e) =>
                      handleChange("field_5", e.target.value)
                    }
                    placeholder={`Tell us about your ${section.text_5.toLowerCase()}...`}
                    className="w-full resize-none rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* Button */}
              {section?.button_name && (
                <button
                  type="submit"
                  disabled={submitting}
                  title={section.button_title || section.button_name}
                  className="mt-7 w-full cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                >
                  {submitting ? "Sending..." : section.button_name}
                </button>
              )}

              {messageBox.text && (
                <p
                  className={
                    messageBox.type === "success"
                      ? "mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
                      : "mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                  }
                >
                  {messageBox.text}
                </p>
              )}

              {/* Privacy text */}
              <p className="mt-5 text-center text-sm text-ink-400">
                Your information is kept confidential and will only be used to
                respond to your inquiry.
              </p>
            </form>
          </div>

          {/* RIGHT SIDE — CONTACT CARDS */}
          {cards.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
                >
                  {card.logo && (
                    <img
                      src={resolveMediaUrl(card.logo)}
                      alt={card.title || "Contact"}
                      className="mb-5 h-14 w-14 rounded-xl border border-brand-200 bg-white object-contain shadow-sm"
                    />
                  )}

                  {card.title && (
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                      {card.title}
                    </h3>
                  )}

                  {card.text && (
                    <p className="mt-2 font-sans text-sm leading-relaxed text-ink-700">
                      {card.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export default ConnectUsSection;