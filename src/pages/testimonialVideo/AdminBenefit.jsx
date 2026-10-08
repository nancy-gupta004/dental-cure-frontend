import { useEffect, useState } from "react";
import { getBenefit, createBenefit, updateBenefit } from "../../services/testimonialVideo/benefitService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  heading: "",
  description: "",
  button_text: "",
  button_link: "",
};

function AdminBenefit() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBenefit()
      .then((data) => {
        const benefit = data.benefit;
        if (benefit) {
          setRecordExists(true);
          setForm({
            heading: benefit.heading || "",
            description: benefit.description || "",
            button_text: benefit.button_text || "",
            button_link: benefit.button_link || "",
          });
          setCurrentLogo(benefit.logo || "");
          setCurrentImage(benefit.image || "");
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    setMessage({ type: "", text: "" });
    setLogoFile(e.target.files[0] || null);
  };

  const handleImageChange = (e) => {
    setMessage({ type: "", text: "" });
    setImageFile(e.target.files[0] || null);
  };

  const validate = () => {
    // The image is required, but only for the very first save.
    // Later saves keep the image that is already stored.
    if (!recordExists && !imageFile) {
      return "Image is required.";
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

    if (!isPlainText(form.button_text)) {
      return "Button text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    return "";
  };

  const applyBenefit = (benefit) => {
    setRecordExists(true);
    setForm({
      heading: benefit.heading || "",
      description: benefit.description || "",
      button_text: benefit.button_text || "",
      button_link: benefit.button_link || "",
    });
    setCurrentLogo(benefit.logo || "");
    setCurrentImage(benefit.image || "");
    setLogoFile(null);
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
    formData.append("button_link", form.button_link);

    if (logoFile) {
      formData.append("logo", logoFile);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createBenefit(formData)
        : await updateBenefit(formData);
      applyBenefit(data.benefit || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Benefit section created successfully."
          : "Benefit section updated successfully.",
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
            Testimonial Video &rarr; Benefit Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Testimonial Video Benefit Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Benefit section of the Testimonial Video page: logo,
            heading, description, call-to-action button, and the image shown on
            the right.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="logo"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Logo
                </label>

                {currentLogo ? (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-3 text-xs font-medium text-ink-500">
                      Current Logo:
                    </p>
                    <img
                      src={resolveMediaUrl(currentLogo)}
                      alt="Current Benefit Logo"
                      className="h-16 w-auto"
                    />
                    <a
                      href={resolveMediaUrl(currentLogo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Logo
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-ink-500">No logo uploaded yet.</p>
                )}

                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!logoFile && currentLogo && (
                  <p className="text-xs text-ink-500">
                    Current logo will be kept unless you choose a new one.
                  </p>
                )}
                {logoFile && (
                  <p className="text-xs text-ink-500">
                    New logo selected: {logoFile.name}
                  </p>
                )}
              </div>

              {/* Image */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Image
                  {!recordExists && <span className="ml-1 text-red-500">*</span>}
                </label>

                {currentImage ? (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-3 text-xs font-medium text-ink-500">
                      Current Image:
                    </p>
                    <img
                      src={resolveMediaUrl(currentImage)}
                      alt="Current Benefit"
                      className="max-h-56 w-full rounded-lg object-cover"
                    />
                    <a
                      href={resolveMediaUrl(currentImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Image
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-ink-500">
                    No image uploaded yet.
                  </p>
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
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  id="heading"
                  name="heading"
                  type="text"
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Hear It From Our Patients"
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
                  placeholder="e.g. Book An Appointment"
                  className={inputClass}
                />
              </div>

              {/* Button Link */}
              <div>
                <label
                  htmlFor="button_link"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Button Link
                </label>
                <input
                  id="button_link"
                  name="button_link"
                  type="text"
                  value={form.button_link}
                  onChange={handleChange}
                  placeholder="e.g. /contact or https://..."
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
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save / Update"
                  : "Create Benefit Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBenefit;
