import { useEffect, useState } from "react";
import { getAbout, createAbout, updateAbout } from "../../services/about/aboutService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Heading, description, title and button text only allow plain text:
// letters, numbers, spaces, and basic punctuation like . , ! ? - ' + & : /
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;

// Statistic/info item texts also allow characters like % @ _ *
const STAT_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:%:@._-]+$/;

const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);
const isStatText = (value) => !value.trim() || STAT_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  title_1: "",
  heading: "",
  description: "",
  button_text: "",
  button_link: "",
  text_1: "",
  text_2: "",
  text_3: "",
};

function AdminAboutSection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [currentBackgroundImage, setCurrentBackgroundImage] = useState("");
  const [logoFiles, setLogoFiles] = useState({ 1: null, 2: null, 3: null });
  const [currentLogos, setCurrentLogos] = useState({ 1: "", 2: "", 3: "" });
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAbout()
      .then((data) => {
        if (data.about) {
          setRecordExists(true);
        }

        const about = data.about || {};
        setForm({
          title_1: about.title_1 || "",
          heading: about.heading || "",
          description: about.description || "",
          button_text: about.button_text || "",
          button_link: about.button_link || "",
          text_1: about.text_1 || "",
          text_2: about.text_2 || "",
          text_3: about.text_3 || "",
        });
        setCurrentBackgroundImage(about.background_image || "");
        setCurrentLogos({
          1: about.logo_1 || "",
          2: about.logo_2 || "",
          3: about.logo_3 || "",
        });
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBackgroundImageChange = (file) => {
    setMessage({ type: "", text: "" });
    setBackgroundImageFile(file);
  };

  const handleLogoChange = (index, file) => {
    setMessage({ type: "", text: "" });
    setLogoFiles({ ...logoFiles, [index]: file });
  };

  const validate = () => {
    const textFields = [
      { key: "title_1", label: "Title 1" },
      { key: "heading", label: "Heading" },
      { key: "description", label: "Description" },
      { key: "button_text", label: "Button Text" },
    ];

    for (const field of textFields) {
      if (!isPlainText(form[field.key])) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : / ). HTML or other special characters are not allowed.`;
      }
    }

    const statFields = [
      { key: "text_1", label: "Item 1 Text" },
      { key: "text_2", label: "Item 2 Text" },
      { key: "text_3", label: "Item 3 Text" },
    ];

    for (const field of statFields) {
      if (!isStatText(form[field.key])) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ). HTML or other special characters are not allowed.`;
      }
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
    if (backgroundImageFile) {
      formData.append("background_image", backgroundImageFile);
    }
    [1, 2, 3].forEach((index) => {
      if (logoFiles[index]) {
        formData.append(`logo_${index}`, logoFiles[index]);
      }
    });

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createAbout(formData)
        : await updateAbout(formData);
      const about = data.about || {};
      setRecordExists(true);
      setForm({
        title_1: about.title_1 || "",
        heading: about.heading || "",
        description: about.description || "",
        button_text: about.button_text || "",
        button_link: about.button_link || "",
        text_1: about.text_1 || "",
        text_2: about.text_2 || "",
        text_3: about.text_3 || "",
      });
      setCurrentBackgroundImage(about.background_image || "");
      setCurrentLogos({
        1: about.logo_1 || "",
        2: about.logo_2 || "",
        3: about.logo_3 || "",
      });
      setBackgroundImageFile(null);
      setLogoFiles({ 1: null, 2: null, 3: null });
      setMessage({
        type: "success",
        text: isCreate
          ? "About section created successfully"
          : "About section updated successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const renderUpload = ({
    label,
    accept,
    current,
    file,
    onChange,
    keepNote,
  }) => (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
        {label}
      </label>

      {current && (
        <div className="mb-3 rounded-xl border border-brand-100 p-4">
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
        accept={accept}
        onChange={(e) => onChange(e.target.files[0] || null)}
        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
      />
      {!file && current && (
        <p className="mt-1.5 text-xs text-ink-500">{keepNote}</p>
      )}
      {file && (
        <p className="mt-1.5 text-xs text-ink-500">
          New image selected: {file.name}
        </p>
      )}
    </div>
  );

  const renderItemBlock = (index) => (
    <div className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
        Item {index}
      </h3>

      {renderUpload({
        label: `Logo ${index}`,
        accept: "image/*",
        current: currentLogos[index],
        file: logoFiles[index],
        onChange: (file) => handleLogoChange(index, file),
        keepNote: "Current logo will be kept unless you choose a new one.",
      })}

      <div>
        <label
          htmlFor={`text_${index}`}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
        >
          Text {index}
        </label>
        <input
          id={`text_${index}`}
          name={`text_${index}`}
          type="text"
          value={form[`text_${index}`]}
          onChange={handleChange}
          placeholder="e.g. 20+ years of experience"
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            About Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the About Us section of the website, including the background
            image, main content and three statistics/info items.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Main Content
                </h2>

                <div className="mt-4 space-y-5">
                  {renderUpload({
                    label: "Background Image",
                    accept: "image/*",
                    current: currentBackgroundImage,
                    file: backgroundImageFile,
                    onChange: handleBackgroundImageChange,
                    keepNote:
                      "Current image will be kept unless you choose a new one.",
                  })}

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
                      placeholder="e.g. About us"
                      className={inputClass}
                    />
                  </div>

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
                      placeholder="e.g. Caring for healthy, confident smiles"
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
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Short description shown under the heading"
                      className={inputClass}
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
                      placeholder="e.g. /appointments or https://... "
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Statistics / Info Items
                </h2>

                <div className="mt-4 space-y-5">
                  {[1, 2, 3].map((index) => renderItemBlock(index))}
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
                  ? "Save About Section"
                  : "Create About Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAboutSection;