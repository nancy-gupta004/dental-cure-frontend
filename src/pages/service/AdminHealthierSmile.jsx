import { useEffect, useState } from "react";
import {
  getServiceHealthierSmile,
  createServiceHealthierSmile,
  updateServiceHealthierSmile,
} from "../../services/service/healthierSmileService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  heading: "",
  description: "",
  button_text: "",
};

function AdminHealthierSmile() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getServiceHealthierSmile()
      .then((data) => {
        const item = data.section;
        if (item) {
          setRecordExists(true);
          setForm({
            heading: item.heading || "",
            description: item.description || "",
            button_text: item.button_text || "",
          });
          setCurrentImage(item.image || "");
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setMessage({ type: "", text: "" });
    setImageFile(e.target.files[0] || null);
  };

  const validate = () => {
    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!isPlainText(form.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.button_text.trim()) {
      return "Button text is required.";
    }
    if (!isPlainText(form.button_text)) {
      return "Button text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    return "";
  };

  // The saved record is read back into the form, so the image preview always
  // shows the image that is actually stored in the database
  const applySection = (section) => {
    setRecordExists(true);
    setForm({
      heading: section.heading || "",
      description: section.description || "",
      button_text: section.button_text || "",
    });
    setCurrentImage(section.image || "");
    setImageFile(null);
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
    formData.append("heading", form.heading);
    formData.append("description", form.description);
    formData.append("button_text", form.button_text);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      // The section is a singleton: POST only for the very first save, every
      // later save is an update of the same record
      const isCreate = !recordExists;
      const data = isCreate
        ? await createServiceHealthierSmile(formData)
        : await updateServiceHealthierSmile(formData);
      applySection(data.section || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Healthier Smile section created successfully."
          : "Healthier Smile section updated successfully.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Service &rarr; Healthier Smile Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Healthier Smile Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Healthier Smile section of the Services page, including
            the image, the heading, and the call-to-action button.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Image
                </label>

                {currentImage && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-ink-500">
                      Uploaded Image:
                    </p>
                    <img
                      src={resolveMediaUrl(currentImage)}
                      alt="Uploaded healthier smile"
                      className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                    />
                    <a
                      href={resolveMediaUrl(currentImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Image
                    </a>
                  </div>
                )}

                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!imageFile && currentImage && (
                  <p className="text-xs text-ink-500">
                    Current image will be kept unless you choose a new one.
                  </p>
                )}
                {imageFile && (
                  <p className="text-xs text-ink-500">
                    New image selected: {imageFile.name}
                  </p>
                )}
              </div>

              {/* Heading */}
              <div>
                <label
                  htmlFor="heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading
                </label>
                <textarea
                  id="heading"
                  name="heading"
                  rows="2"
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. A Healthier Smile&#10;Begin with us"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description shown under the heading"
                  className={inputClass}
                />
              </div>

              {/* Button Text */}
              <div>
                <label
                  htmlFor="button_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Button Text
                </label>
                <input
                  id="button_text"
                  name="button_text"
                  type="text"
                  value={form.button_text}
                  onChange={handleChange}
                  placeholder="e.g. Schedule Visit"
                  className={inputClass}
                />
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
                  : "Create Healthier Smile Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHealthierSmile;
