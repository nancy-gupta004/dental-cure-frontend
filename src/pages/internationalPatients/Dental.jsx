import { useEffect, useState } from "react";
import {
  getDental,
  createDental,
  updateDental,
} from "../../services/internationalPatients/dentalService";
import { inputClass, getMessageClass } from "../../utils/classes";
import RichTextEditor from "../../components/richText/RichTextEditor";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

// An empty rich-text editor still holds markup such as "<p></p>", so the tags
// are stripped before checking whether anything was actually typed
const stripRichText = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const EMPTY_FORM = {
  text: "",
  heading: "",
  description_1: "",
  description_2: "",
  description_3: "",
  description_4: "",
};

function Dental() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDental()
      .then((data) => {
        const section = data.dental;
        if (section) {
          setRecordExists(true);
          setForm({
            text: section.text || "",
            heading: section.heading || "",
            description_1: section.description1 || "",
            description_2: section.description2 || "",
            description_3: section.description3 || "",
            description_4: section.description4 || "",
          });
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRichTextChange = (field, html) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [field]: html });
  };

  const validate = () => {
    if (!form.text.trim()) {
      return "Text is required.";
    }
    if (!isPlainText(form.text)) {
      return "Text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    for (let number = 1; number <= 4; number++) {
      if (!stripRichText(form[`description_${number}`])) {
        return `Description ${number} is required.`;
      }
    }

    return "";
  };

  const applyDental = (dental) => {
    setRecordExists(true);
    setForm({
      text: dental.text || "",
      heading: dental.heading || "",
      description_1: dental.description1 || "",
      description_2: dental.description2 || "",
      description_3: dental.description3 || "",
      description_4: dental.description4 || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    try {
      // A section that already exists is always updated, so saving twice can
      // never create a second record
      const isCreate = !recordExists;
      const data = isCreate
        ? await createDental(form)
        : await updateDental(form);

      applyDental(data.dental || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Dental section created successfully."
          : "Dental section updated successfully.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const descriptionField = (number) => (
    <div>
      <label
        htmlFor={`dental_description_${number}`}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
      >
        Description {number} <span className="text-red-500">*</span>
      </label>
      <RichTextEditor
        content={form[`description_${number}`]}
        onChange={(html) => handleRichTextChange(`description_${number}`, html)}
      />
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            International Patients &rarr; Dental Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Dental Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Dental section of the International Patients page: text,
            heading and four rich text descriptions.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text */}
              <div>
                <label
                  htmlFor="text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text <span className="text-red-500">*</span>
                </label>
                <input
                  id="text"
                  name="text"
                  type="text"
                  value={form.text}
                  onChange={handleChange}
                  placeholder="e.g. DENTAL"
                  className={inputClass}
                />
              </div>

              {/* Heading */}
              <div>
                <label
                  htmlFor="heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  id="heading"
                  name="heading"
                  type="text"
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Dentistry That Feels Like Home"
                  className={inputClass}
                />
              </div>

              {/* Descriptions */}
              {descriptionField(1)}
              {descriptionField(2)}
              {descriptionField(3)}
              {descriptionField(4)}

              {/* Message Toast */}
              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              {/* Save / Update Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60 cursor-pointer"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save / Update"
                  : "Create Dental Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dental;