import { useEffect, useState } from "react";
import {
  getBeforeAfter,
  createBeforeAfter,
  updateBeforeAfter,
} from "../../services/home/beforeAfterService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = () => ({
  title: "",
  heading: "",
  title_1: "",
  title_2: "",
  title_3: "",
  title_4: "",
});

// All 8 image upload fields, grouped per treatment for the UI
const IMAGE_FIELDS = [
  { num: 1, key: "before_image_1", label: "Before Image" },
  { num: 1, key: "after_image_1", label: "After Image" },
  { num: 2, key: "before_image_2", label: "Before Image" },
  { num: 2, key: "after_image_2", label: "After Image" },
  { num: 3, key: "before_image_3", label: "Before Image" },
  { num: 3, key: "after_image_3", label: "After Image" },
  { num: 4, key: "before_image_4", label: "Before Image" },
  { num: 4, key: "after_image_4", label: "After Image" },
];

function AdminBeforeAfter() {
  const [form, setForm] = useState(EMPTY_FORM());
  const [images, setImages] = useState({});
  const [files, setFiles] = useState({});
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBeforeAfter()
      .then((data) => {
        if (data.section) {
          setRecordExists(true);
        }

        const section = data.section || {};
        setForm({
          title: section.title || "",
          heading: section.heading || "",
          title_1: section.title_1 || "",
          title_2: section.title_2 || "",
          title_3: section.title_3 || "",
          title_4: section.title_4 || "",
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
      { key: "title_1", label: "Title 1" },
      { key: "title_2", label: "Title 2" },
      { key: "title_3", label: "Title 3" },
      { key: "title_4", label: "Title 4" },
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
        ? await createBeforeAfter(formData)
        : await updateBeforeAfter(formData);
      const section = data.section || {};
      setRecordExists(true);
      setForm({
        title: section.title || "",
        heading: section.heading || "",
        title_1: section.title_1 || "",
        title_2: section.title_2 || "",
        title_3: section.title_3 || "",
        title_4: section.title_4 || "",
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
          ? "Before & After section created successfully"
          : "Before & After section updated successfully",
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
            Before & After Teeth
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title, heading, treatment titles and the before/after images
            shown on the Home page.
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
                  placeholder="e.g. After/Before"
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
                  placeholder="e.g. See stunning smile transformation | before and after"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={`title_${n}`}>
                    <label
                      htmlFor={`title_${n}`}
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                    >
                      Title {n}
                    </label>
                    <input
                      id={`title_${n}`}
                      name={`title_${n}`}
                      type="text"
                      value={form[`title_${n}`]}
                      onChange={handleChange}
                      placeholder={`e.g. Treatment ${n}`}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Treatment 1
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {renderImageUpload(IMAGE_FIELDS[0])}
                  {renderImageUpload(IMAGE_FIELDS[1])}
                </div>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Treatment 2
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {renderImageUpload(IMAGE_FIELDS[2])}
                  {renderImageUpload(IMAGE_FIELDS[3])}
                </div>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Treatment 3
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {renderImageUpload(IMAGE_FIELDS[4])}
                  {renderImageUpload(IMAGE_FIELDS[5])}
                </div>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Treatment 4
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {renderImageUpload(IMAGE_FIELDS[6])}
                  {renderImageUpload(IMAGE_FIELDS[7])}
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
                  : "Create Before & After Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBeforeAfter;