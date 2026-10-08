import { useEffect, useState } from "react";
import {
  getServiceDentalCare,
  createServiceDentalCare,
  updateServiceDentalCare,
} from "../../services/service/dentalCareService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  heading: "",
  description: "",
};

function AdminDentalCare() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getServiceDentalCare()
      .then((data) => {
        const item = data.dentalCare;
        if (item) {
          setRecordExists(true);
          setForm({
            heading: item.heading || "",
            description: item.description || "",
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

    return "";
  };

  const applyDentalCare = (dentalCare) => {
    setRecordExists(true);
    setForm({
      heading: dentalCare.heading || "",
      description: dentalCare.description || "",
    });
    setCurrentImage(dentalCare.image || "");
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

    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createServiceDentalCare(formData)
        : await updateServiceDentalCare(formData);
      applyDentalCare(data.dentalCare || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Dental care section created successfully."
          : "Dental care section updated successfully.",
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
            Service &rarr; Dental Care Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Dental Care Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Dental Care section of the Services page, including the
            heading, description, and image.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Heading */}
              <div>
                <label
                  htmlFor="heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading
                </label>
                <input
                  id="heading"
                  name="heading"
                  type="text"
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Complete Care Under One Roof"
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
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description shown under the heading"
                  className={inputClass}
                />
              </div>

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
                  : "Create Dental Care Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDentalCare;
