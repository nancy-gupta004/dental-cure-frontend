import { useEffect, useState } from "react";
import {
  getGallery,
  createGallery,
  updateGallery,
} from "../../services/home/galleryService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&:/-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = () => ({
  title: "",
  heading: "",
  description: "",
});

// The 7 gallery image upload fields
const IMAGE_FIELDS = [
  { key: "image_1", label: "Image 1" },
  { key: "image_2", label: "Image 2" },
  { key: "image_3", label: "Image 3" },
  { key: "image_4", label: "Image 4" },
  { key: "image_5", label: "Image 5" },
  { key: "image_6", label: "Image 6" },
  { key: "image_7", label: "Image 7" },
];

function AdminGallery() {
  const [form, setForm] = useState(EMPTY_FORM());
  const [images, setImages] = useState({});
  const [files, setFiles] = useState({});
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGallery()
      .then((data) => {
        if (data.section) {
          setRecordExists(true);
        }

        const section = data.section || {};
        setForm({
          title: section.title || "",
          heading: section.heading || "",
          description: section.description || "",
        });
        const current = {};
        IMAGE_FIELDS.forEach(({ key }) => {
          current[key] = section[key] || "";
        });
        setImages(current);
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (key, e) => {
    setMessage({ type: "", text: "" });
    setFiles({ ...files, [key]: e.target.files[0] || null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const textFields = [
      { key: "title", label: "Title" },
      { key: "heading", label: "Heading" },
      { key: "description", label: "Description" },
    ];

    for (const field of textFields) {
      if (!isPlainText(form[field.key])) {
        setMessage({
          type: "error",
          text: `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : ). HTML or other special characters are not allowed.`,
        });
        return;
      }
    }

    const formData = new FormData();
    textFields.forEach((field) => formData.append(field.key, form[field.key]));
    IMAGE_FIELDS.forEach(({ key }) => {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    });

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createGallery(formData)
        : await updateGallery(formData);
      const section = data.section || {};
      setRecordExists(true);
      setForm({
        title: section.title || "",
        heading: section.heading || "",
        description: section.description || "",
      });
      const current = {};
      IMAGE_FIELDS.forEach(({ key }) => {
        current[key] = section[key] || "";
      });
      setImages(current);
      setFiles({});
      setMessage({
        type: "success",
        text: isCreate
          ? "Gallery section created successfully"
          : "Gallery section updated successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const renderImageUpload = ({ key, label }) => (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
        {label}
      </label>

      {images[key] && (
        <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
          <a
            href={resolveMediaUrl(images[key])}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
          >
            View Current Image
          </a>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(key, e)}
        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
      />
      {!files[key] && images[key] && (
        <p className="mt-1.5 text-xs text-ink-500">
          Current image will be kept unless you choose a new one.
        </p>
      )}
      {files[key] && (
        <p className="mt-1.5 text-xs text-ink-500">
          New image selected: {files[key].name}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Gallery
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title, heading, description and the 7 images shown in the
            Gallery section on the Home page.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Section Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Moments of"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Section Heading
                </label>
                <input
                  id="heading"
                  name="heading"
                  type="text"
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Care & Confidence"
                  className={inputClass}
                />
              </div>

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
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. A glimpse into our modern facilities and the confident smiles of our happy patients."
                  className={inputClass}
                />
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Gallery Images
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {IMAGE_FIELDS.map((field) => renderImageUpload(field))}
                </div>
              </div>

              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save Section"
                  : "Create Gallery Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminGallery;
