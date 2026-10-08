import { useEffect, useState } from "react";
import {
  getDentalCure,
  createDentalCure,
  updateDentalCure,
} from "../../services/about/dentalCureService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text fields allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
// Stat / info text allows characters like % + @ _
const STAT_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:%:@._-]+$/;
// Description text allows standard punctuation, quotes, and parentheses
const DESCRIPTION_PATTERN = /^[A-Za-z0-9\s.,!?'"()+&/:%:@._-]+$/;

const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);
const isStatText = (value) => !value.trim() || STAT_TEXT_PATTERN.test(value);
const isDescriptionText = (value) =>
  !value.trim() || DESCRIPTION_PATTERN.test(value);

const EMPTY_FORM = {
  heading: "",
  rating: "4.8",
  google_rating_text: "",
  patient_recover_value: "",
  patient_recover_text: "",
  title_1: "",
  description_1: "",
  title_2: "",
  description_2: "",
};

function StarRatingPreview({ rating }) {
  const num = Math.max(0, Math.min(5, parseFloat(rating) || 0));

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.max(
            0,
            Math.min(100, (num - (star - 1)) * 100)
          );
          return (
            <div key={star} className="relative inline-block w-4 h-4 text-ink-200">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-ink-200"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div
                className="absolute top-0 left-0 overflow-hidden text-amber-400"
                style={{ width: `${fillPercentage}%` }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-ink-600">
        {num.toFixed(1)} / 5
      </span>
    </div>
  );
}

function AdminDentalCureSection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [currentMainImage, setCurrentMainImage] = useState("");
  const [logoImageFile, setLogoImageFile] = useState(null);
  const [currentLogoImage, setCurrentLogoImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDentalCure()
      .then((data) => {
        const item = data.dentalCure;
        if (item) {
          setRecordExists(true);
          setForm({
            heading: item.heading || "",
            rating: item.rating !== undefined && item.rating !== null ? String(item.rating) : "4.8",
            google_rating_text: item.google_rating_text || "",
            patient_recover_value: item.patient_recover_value || "",
            patient_recover_text: item.patient_recover_text || "",
            title_1: item.title_1 || "",
            description_1: item.description_1 || "",
            title_2: item.title_2 || "",
            description_2: item.description_2 || "",
          });
          setCurrentMainImage(item.main_image || "");
          setCurrentLogoImage(item.logo_image || "");
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    setMessage({ type: "", text: "" });
    setMainImageFile(e.target.files[0] || null);
  };

  const handleLogoImageChange = (e) => {
    setMessage({ type: "", text: "" });
    setLogoImageFile(e.target.files[0] || null);
  };

  const validate = () => {
    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    const ratingNum = parseFloat(form.rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return "Rating must be a valid number between 0 and 5 (e.g. 4.8).";
    }

    if (!isStatText(form.google_rating_text)) {
      return "Google rating text can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ).";
    }

    if (!isStatText(form.patient_recover_value)) {
      return "Patient recover value can only contain letters, numbers, spaces, and basic punctuation (e.g. 1000+).";
    }

    if (!isPlainText(form.patient_recover_text)) {
      return "Patient recover text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!isPlainText(form.title_1)) {
      return "Title 1 can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!isDescriptionText(form.description_1)) {
      return "Description 1 can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!isPlainText(form.title_2)) {
      return "Title 2 can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!isDescriptionText(form.description_2)) {
      return "Description 2 can only contain letters, numbers, spaces, and basic punctuation.";
    }

    return "";
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

    if (mainImageFile) {
      formData.append("main_image", mainImageFile);
    }
    if (logoImageFile) {
      formData.append("logo_image", logoImageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createDentalCure(formData)
        : await updateDentalCure(formData);
      const item = data.dentalCure || {};
      setRecordExists(true);
      setForm({
        heading: item.heading || "",
        rating: item.rating !== undefined && item.rating !== null ? String(item.rating) : "4.8",
        google_rating_text: item.google_rating_text || "",
        patient_recover_value: item.patient_recover_value || "",
        patient_recover_text: item.patient_recover_text || "",
        title_1: item.title_1 || "",
        description_1: item.description_1 || "",
        title_2: item.title_2 || "",
        description_2: item.description_2 || "",
      });
      setCurrentMainImage(item.main_image || "");
      setCurrentLogoImage(item.logo_image || "");
      setMainImageFile(null);
      setLogoImageFile(null);
      setMessage({
        type: "success",
        text: isCreate
          ? "Dental Cure section created successfully."
          : "Dental Cure section updated successfully.",
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
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            About Us &rarr; Dental Cure Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Dental Cure Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Configure the Dental Cure section for the About Us page, including
            ratings, main image, logo, patient recovery count, and feature
            descriptions.
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
                  placeholder="e.g. About The Dental Cure"
                  className={inputClass}
                />
              </div>

              {/* Rating */}
              <div>
                <label
                  htmlFor="rating"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Rating
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange}
                    placeholder="e.g. 4.8"
                    className={inputClass}
                  />
                  <span className="text-sm font-semibold text-ink-700 whitespace-nowrap">
                    / 5.0
                  </span>
                </div>
                <StarRatingPreview rating={form.rating} />
              </div>

              {/* Google Rating Text */}
              <div>
                <label
                  htmlFor="google_rating_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Google Rating Text
                </label>
                <input
                  id="google_rating_text"
                  name="google_rating_text"
                  type="text"
                  value={form.google_rating_text}
                  onChange={handleChange}
                  placeholder="e.g. 12k ratings on google"
                  className={inputClass}
                />
              </div>

              {/* Main Image */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 space-y-3">
                <label
                  htmlFor="main_image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Main Image
                </label>

                {currentMainImage && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="text-xs font-medium text-ink-500 mb-1.5">
                      Uploaded Image:
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <a
                        href={resolveMediaUrl(currentMainImage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-600 underline hover:text-brand-700 break-all"
                      >
                        view image
                      </a>
                    </div>
                  </div>
                )}

                <input
                  id="main_image"
                  name="main_image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleMainImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!mainImageFile && currentMainImage && (
                  <p className="text-xs text-ink-500">
                    Current image will be kept unless you choose a new one.
                  </p>
                )}
                {mainImageFile && (
                  <p className="text-xs text-ink-500">
                    New image selected: {mainImageFile.name}
                  </p>
                )}
              </div>

              {/* Logo Image */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 space-y-3">
                <label
                  htmlFor="logo_image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Logo Image
                </label>

                {currentLogoImage && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="text-xs font-medium text-ink-500 mb-1.5">
                      Uploaded Logo:
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <a
                        href={resolveMediaUrl(currentLogoImage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-600 underline hover:text-brand-700 break-all"
                      >
                        View Logo
                      </a>
                    </div>
                  </div>
                )}

                <input
                  id="logo_image"
                  name="logo_image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleLogoImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!logoImageFile && currentLogoImage && (
                  <p className="text-xs text-ink-500">
                    Current logo will be kept unless you choose a new one.
                  </p>
                )}
                {logoImageFile && (
                  <p className="text-xs text-ink-500">
                    New logo selected: {logoImageFile.name}
                  </p>
                )}
              </div>

              {/* Patient Recover Value */}
              <div>
                <label
                  htmlFor="patient_recover_value"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Patient Recover Value
                </label>
                <input
                  id="patient_recover_value"
                  name="patient_recover_value"
                  type="text"
                  value={form.patient_recover_value}
                  onChange={handleChange}
                  placeholder="e.g. 1000+"
                  className={inputClass}
                />
              </div>

              {/* Patient Recover Text */}
              <div>
                <label
                  htmlFor="patient_recover_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Patient Recover Text
                </label>
                <input
                  id="patient_recover_text"
                  name="patient_recover_text"
                  type="text"
                  value={form.patient_recover_text}
                  onChange={handleChange}
                  placeholder="e.g. Patient Recover"
                  className={inputClass}
                />
              </div>

              {/* Title 1 & Description 1 */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Content Block 1
                </h2>

                <div>
                  <label
                    htmlFor="title_1"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    Title 1
                  </label>
                  <input
                    id="title_1"
                    name="title_1"
                    type="text"
                    value={form.title_1}
                    onChange={handleChange}
                    placeholder="e.g. Make Your Dental Experience A Lot Brighter"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description_1"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    Description 1
                  </label>
                  <textarea
                    id="description_1"
                    name="description_1"
                    rows="4"
                    value={form.description_1}
                    onChange={handleChange}
                    placeholder="e.g. The Dental Cure is an award winning dental clinic..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Title 2 & Description 2 */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Content Block 2
                </h2>

                <div>
                  <label
                    htmlFor="title_2"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    Title 2
                  </label>
                  <input
                    id="title_2"
                    name="title_2"
                    type="text"
                    value={form.title_2}
                    onChange={handleChange}
                    placeholder="e.g. Best Dental Clinic in Gurugram"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description_2"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    Description 2
                  </label>
                  <textarea
                    id="description_2"
                    name="description_2"
                    rows="4"
                    value={form.description_2}
                    onChange={handleChange}
                    placeholder="e.g. The Dental Cure is ISO Certified World class dental clinic..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Message Toast */}
              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60 cursor-pointer"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save / Update"
                  : "Create Dental Cure Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDentalCureSection;
