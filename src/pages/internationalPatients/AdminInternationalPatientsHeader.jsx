import { useEffect, useState } from "react";
import {
  getInternationalPatientsHeader,
  createInternationalPatientsHeader,
  updateInternationalPatientsHeader,
} from "../../services/internationalPatients/internationalPatientsHeaderService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  title: "",
  heading: "",
  description: "",
};

function AdminInternationalPatientsHeader() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInternationalPatientsHeader()
      .then((data) => {
        const item = data.header;
        if (item) {
          setRecordExists(true);
          setForm({
            title: item.title || "",
            heading: item.heading || "",
            description: item.description || "",
          });
          setCurrentImage(item.background_image || "");
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
    // The background image is required, but only for the very first save.
    // Later saves keep the image that is already stored.
    if (!recordExists && !imageFile) {
      return "Background image is required.";
    }

    if (!form.title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(form.title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.description.trim()) {
      return "Description is required.";
    }
    if (!isPlainText(form.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }

    return "";
  };

  const applyHeader = (header) => {
    setRecordExists(true);
    setForm({
      title: header.title || "",
      heading: header.heading || "",
      description: header.description || "",
    });
    setCurrentImage(header.background_image || "");
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
    formData.append("title", form.title);
    formData.append("heading", form.heading);
    formData.append("description", form.description);

    if (imageFile) {
      formData.append("background_image", imageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createInternationalPatientsHeader(formData)
        : await updateInternationalPatientsHeader(formData);
      applyHeader(data.header || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "International Patients header created successfully."
          : "International Patients header updated successfully.",
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
            International Patients &rarr; Header Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            International Patients Header Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the header of the International Patients page: background
            image, title, heading, and description.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Background Image */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="background_image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Background Image
                  {!recordExists && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                {currentImage && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-ink-500">
                      Uploaded Background Image:
                    </p>

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
                  id="background_image"
                  name="background_image"
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

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. International Patients"
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
                  placeholder="e.g. Care That Crosses Borders"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description shown under the heading"
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
                  : "Create Header Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminInternationalPatientsHeader;