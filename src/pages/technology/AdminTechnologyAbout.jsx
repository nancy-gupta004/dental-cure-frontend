import { useEffect, useState } from "react";
import {
  getTechnologyAbout,
  createTechnologyAbout,
  updateTechnologyAbout,
} from "../../services/technology/technologyAboutService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";
import RichTextEditor from "../../components/richText/RichTextEditor";

// Text and heading allow plain text only: letters, numbers, spaces, and basic
// punctuation like . , ! ? - ' + & : /
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;

// Info line texts also allow characters like % @ _ *
const STAT_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:%:@._-]+$/;

const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);
const isStatText = (value) => !value.trim() || STAT_TEXT_PATTERN.test(value);

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
  text_1: "",
  text_2: "",
};

const toForm = (about = {}) => ({
  text: about.text || "",
  heading: about.heading || "",
  description_1: about.description1 || "",
  description_2: about.description2 || "",
  text_1: about.text1 || "",
  text_2: about.text2 || "",
});

function AdminTechnologyAbout() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTechnologyAbout()
      .then((data) => {
        if (data.about) {
          setRecordExists(true);
          setForm(toForm(data.about));
          setCurrentImage(data.about.image || "");
          setCurrentLogo(data.about.logo || "");
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

  const handleImageChange = (e) => {
    setMessage({ type: "", text: "" });
    setImageFile(e.target.files[0] || null);
  };

  const handleLogoChange = (e) => {
    setMessage({ type: "", text: "" });
    setLogoFile(e.target.files[0] || null);
  };

  const validate = () => {
    // The image is required, but only for the very first save. Later saves keep
    // the image that is already stored.
    if (!recordExists && !imageFile) {
      return "Image is required.";
    }

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

    for (let number = 1; number <= 2; number++) {
      if (!stripRichText(form[`description_${number}`])) {
        return `Description ${number} is required.`;
      }
    }

    if (!isStatText(form.text_1)) {
      return "Text 1 can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ).";
    }
    if (!isStatText(form.text_2)) {
      return "Text 2 can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ).";
    }

    return "";
  };

  const applyAbout = (about) => {
    setRecordExists(true);
    setForm(toForm(about));
    setCurrentImage(about.image || "");
    setCurrentLogo(about.logo || "");
    setImageFile(null);
    setLogoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createTechnologyAbout(formData)
        : await updateTechnologyAbout(formData);
      applyAbout(data.about || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Technology About section created successfully."
          : "Technology About section updated successfully.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const renderUpload = ({ label, required, current, file, onChange, keepNote }) => (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {current && (
        <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
          <a
            href={resolveMediaUrl(current)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
          >
            View Uploaded Image
          </a>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={onChange}
        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
      />
      {!file && current && (
        <p className="mt-1.5 text-xs text-ink-500">{keepNote}</p>
      )}
      {file && (
        <p className="mt-1.5 text-xs text-ink-500">New image selected: {file.name}</p>
      )}
    </div>
  );

  const descriptionField = (number) => (
    <div>
      <label
        htmlFor={`technology_about_description_${number}`}
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
            Technology &rarr; About Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Technology About Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the About section of the Technology page: image, logo, text,
            heading, two rich text descriptions, and two info lines.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Images
                </h2>

                <div className="mt-4 space-y-5">
                  {renderUpload({
                    label: "Image",
                    required: !recordExists,
                    current: currentImage,
                    file: imageFile,
                    onChange: handleImageChange,
                    keepNote: "Current image will be kept unless you choose a new one.",
                  })}

                  {renderUpload({
                    label: "Logo",
                    current: currentLogo,
                    file: logoFile,
                    onChange: handleLogoChange,
                    keepNote: "Current logo will be kept unless you choose a new one.",
                  })}
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Main Content
                </h2>

                <div className="mt-4 space-y-5">
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
                      placeholder="e.g. About Our Technology"
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
                      placeholder="e.g. Precision Tools, Modern Dentistry"
                      className={inputClass}
                    />
                  </div>

                  {/* Descriptions */}
                  {descriptionField(1)}
                  {descriptionField(2)}
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Info Lines
                </h2>

                <div className="mt-4 space-y-5">
                  <div>
                    <label
                      htmlFor="text_1"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                    >
                      Text 1
                    </label>
                    <input
                      id="text_1"
                      name="text_1"
                      type="text"
                      value={form.text_1}
                      onChange={handleChange}
                      placeholder="e.g. 20+ years of experience"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="text_2"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                    >
                      Text 2
                    </label>
                    <input
                      id="text_2"
                      name="text_2"
                      type="text"
                      value={form.text_2}
                      onChange={handleChange}
                      placeholder="e.g. 100% digital workflow"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

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
                  : "Create About Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTechnologyAbout;