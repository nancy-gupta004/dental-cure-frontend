import { useEffect, useState } from "react";
import {
  getFounder,
  createFounder,
  updateFounder,
} from "../../services/about/founderService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";
import RichTextEditor from "../../components/richText/RichTextEditor";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  title_1: "",
  heading: "",
  dr_name: "",
  designation: "",
  description: "",
};

function AdminFounderSection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFounder()
      .then((data) => {
        const item = data.founder;
        if (item) {
          setRecordExists(true);
          setForm({
            title_1: item.title_1 || "",
            heading: item.heading || "",
            dr_name: item.dr_name || "",
            designation: item.designation || "",
            description: item.description || "",
          });
          setCurrentImage(item.dr_image || "");
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
    if (!form.title_1.trim()) {
      return "Title 1 is required.";
    }
    if (!isPlainText(form.title_1)) {
      return "Title 1 can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.dr_name.trim()) {
      return "Doctor Name is required.";
    }
    if (!isPlainText(form.dr_name)) {
      return "Doctor Name can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!form.designation.trim()) {
      return "Designation is required.";
    }
    if (!isPlainText(form.designation)) {
      return "Designation can only contain letters, numbers, spaces, and basic punctuation.";
    }

    const strippedDesc = form.description.replace(/<[^>]*>/g, "").trim();
    if (!strippedDesc) {
      return "Description is required.";
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
    formData.append("title_1", form.title_1);
    formData.append("heading", form.heading);
    formData.append("dr_name", form.dr_name);
    formData.append("designation", form.designation);
    formData.append("description", form.description);

    if (imageFile) {
      formData.append("dr_image", imageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createFounder(formData)
        : await updateFounder(formData);
      const item = data.founder || {};
      setRecordExists(true);
      setForm({
        title_1: item.title_1 || "",
        heading: item.heading || "",
        dr_name: item.dr_name || "",
        designation: item.designation || "",
        description: item.description || "",
      });
      setCurrentImage(item.dr_image || "");
      setImageFile(null);
      setMessage({
        type: "success",
        text: isCreate
          ? "Founder section created successfully."
          : "Founder section updated successfully.",
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
            About Us &rarr; Founder Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Founder Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Founder section of the About Us page, including doctor
            details, designation, profile picture, and rich-text biography.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title 1 */}
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
                  placeholder="e.g. MEET OUR FOUNDER"
                  className={inputClass}
                />
              </div>

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
                  placeholder="e.g. Committed to Your Dental Health & Beautiful Smiles"
                  className={inputClass}
                />
              </div>

              {/* Doctor Name */}
              <div>
                <label
                  htmlFor="dr_name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Doctor Name
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

              {/* Designation */}
              <div>
                <label
                  htmlFor="designation"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Designation
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="e.g. BDS, MDS - Chief Dental Surgeon"
                  className={inputClass}
                />
              </div>

              {/* Doctor Image */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 space-y-3">
                <label
                  htmlFor="dr_image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Doctor Image
                </label>

                {currentImage && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-ink-500">
                      Uploaded Doctor Image:
                    </p>
                    <img
                      src={resolveMediaUrl(currentImage)}
                      alt="Uploaded doctor"
                      className="h-32 w-32 rounded-xl object-cover border border-brand-200 shadow-sm"
                    />
                  </div>
                )}

                <input
                  id="dr_image"
                  name="dr_image"
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

              {/* Description (Tiptap RichTextEditor) */}
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
                  : "Create Founder Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFounderSection;
