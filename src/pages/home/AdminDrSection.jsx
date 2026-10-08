import { useEffect, useState } from "react";
import {
  getDr,
  createDr,
  updateDr,
} from "../../services/home/drService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";
import RichTextEditor from "../../components/richText/RichTextEditor";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

function AdminDrSection() {
  const [form, setForm] = useState({
    years_of_experience: "",
    title_1: "",
    dr_name: "",
    certification_name: "",
    title_2: "",
    description: "",
    button_text: "",
    google_rating: "3",
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDr()
      .then((data) => {
        if (data.dr) {
          setRecordExists(true);
        }

        const dr = data.dr || {};
        setForm({
          years_of_experience: dr.years_of_experience ?? "",
          title_1: dr.title_1 || "",
          dr_name: dr.dr_name || "",
          certification_name: dr.certification_name || "",
          title_2: dr.title_2 || "",
          description: dr.description || "",
          button_text: dr.button_text || "",
          google_rating: dr.google_rating ?? "3",
        });
        setCurrentImage(dr.dr_image_url || "");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const textFields = [
      { key: "title_1", label: "Title 1" },
      { key: "dr_name", label: "DR Name" },
      { key: "certification_name", label: "Certification Name" },
      { key: "title_2", label: "Title 2" },
      { key: "button_text", label: "Button text" },
    ];

    for (const field of textFields) {
      if (!isPlainText(form[field.key])) {
        setMessage({
          type: "error",
          text: `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' ). HTML or other special characters are not allowed.`,
        });
        return;
      }
    }

    const years = Number(form.years_of_experience);
    if (!Number.isInteger(years) || years < 0 || years > 100) {
      setMessage({
        type: "error",
        text: "Years of Experience must be a whole number between 0 and 100.",
      });
      return;
    }

    const rating = Number(form.google_rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage({ type: "error", text: "Google Rating must be a number between 1 and 5." });
      return;
    }

    const formData = new FormData();
    formData.append("years_of_experience", form.years_of_experience);
    formData.append("title_1", form.title_1);
    formData.append("dr_name", form.dr_name);
    formData.append("certification_name", form.certification_name);
    formData.append("title_2", form.title_2);
    formData.append("description", form.description);
    formData.append("button_text", form.button_text);
    formData.append("google_rating", form.google_rating);
    if (imageFile) {
      formData.append("dr_image", imageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createDr(formData)
        : await updateDr(formData);
      setRecordExists(true);
      setCurrentImage((data.dr && data.dr.dr_image_url) || "");
      setImageFile(null);
      setMessage({
        type: "success",
        text: isCreate
          ? "DR section created successfully"
          : "DR section updated successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            DR Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the doctor image, experience, titles, description, button and
            Google rating shown on the Home page.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="dr_image"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  DR Image
                </label>

                   {currentImage && (
                      <div className="mb-3 rounded-xl border border-brand-100 p-4">
                        <a
                          href={resolveMediaUrl(currentImage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View DR Image
                        </a>
                      </div>
                    )}

                <input
                  id="dr_image"
                  name="dr_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!imageFile && currentImage && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    Current image will be kept unless you choose a new one.
                  </p>
                )}
                {imageFile && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    New image selected: {imageFile.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="years_of_experience"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Years of Experience
                </label>
                <input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  max="100"
                  value={form.years_of_experience}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className={inputClass}
                />
              </div>

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
                  placeholder="e.g. Meet Our Doctor"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="dr_name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  DR Name
                </label>
                <input
                  id="dr_name"
                  name="dr_name"
                  type="text"
                  value={form.dr_name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Nancy Gupta"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="certification_name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Certification Name
                </label>
                <input
                  id="certification_name"
                  name="certification_name"
                  type="text"
                  value={form.certification_name}
                  onChange={handleChange}
                  placeholder="e.g. BDS, MDS"
                  className={inputClass}
                />
              </div>

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
                  placeholder="e.g. Your Smile, Our Priority"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Description
                </label>
                <RichTextEditor
                  content={form.description}
                  onChange={(html) => {
                    setMessage({ type: "", text: "" });
                    setForm({ ...form, description: html });
                  }}
                />
              </div>

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
                  placeholder="e.g. Book an Appointment"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="google_rating"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Google Rating
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="google_rating"
                    name="google_rating"
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    value={form.google_rating}
                    onChange={handleChange}
                    placeholder="3"
                    className={inputClass}
                  />
                  <span className="text-sm font-semibold text-ink-700">/ 5</span>
                </div>
              </div>

              {message.text && (
                <p className={getMessageClass(message.type)}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save DR Section"
                  : "Create DR Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDrSection;