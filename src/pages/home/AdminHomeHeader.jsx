import { useEffect, useState } from "react";
import {
  getHomeHeader,
  createHomeHeader,
  updateHomeHeader,
} from "../../services/home/homeService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Heading, description and button text may only contain plain text:
// letters, numbers, spaces, and basic punctuation like . , ! ? - '
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'-]+$/;

// Empty values are allowed; anything with markup or special characters is not
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

function AdminHomeHeader() {
  const [form, setForm] = useState({
    heading: "",
    description: "",
    button_text: "",
    button_link: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [currentVideo, setCurrentVideo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHomeHeader()
      .then((data) => {
        if (data.header) {
          setRecordExists(true);
        }

        const header = data.header || {};
        setForm({
          heading: header.heading || "",
          description: header.description || "",
          button_text: header.button_text || "",
          button_link: header.button_link || "",
        });
        setCurrentVideo(header.background_video || "");
        setCurrentLogo(header.logo || "");
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVideoChange = (e) => {
    setMessage({ type: "", text: "" });
    setVideoFile(e.target.files[0] || null);
  };

  const handleLogoChange = (e) => {
    setMessage({ type: "", text: "" });
    setLogoFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!form.heading.trim()) {
      setMessage({ type: "error", text: "Heading is required" });
      return;
    }

    const textFields = [
      { key: "heading", label: "Heading" },
      { key: "description", label: "Description" },
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

    const formData = new FormData();
    formData.append("heading", form.heading);
    formData.append("description", form.description);
    formData.append("button_text", form.button_text);
    formData.append("button_link", form.button_link);
    if (videoFile) {
      formData.append("video", videoFile);
    }
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createHomeHeader(formData)
        : await updateHomeHeader(formData);
      setRecordExists(true);
      setCurrentVideo((data.header && data.header.background_video) || "");
      setCurrentLogo((data.header && data.header.logo) || "");
      setVideoFile(null);
      setLogoFile(null);
      setMessage({
        type: "success",
        text: isCreate
          ? "Home page header created successfully"
          : "Home page header updated successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
             Header Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the logo, heading, description, button and background video of
            the website Home page.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="logo"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Logo
                </label>

                {currentLogo && (
                  <div className="mb-3 rounded-xl border border-brand-100 p-4">
                    <img
                      src={resolveMediaUrl(currentLogo)}
                      alt="Home page logo"
                      className="mb-3 h-24 w-auto rounded-lg border border-brand-200 bg-white object-contain p-2"
                    />
                    <a
                      href={resolveMediaUrl(currentLogo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Uploaded Image
                    </a>
                  </div>
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
                  <p className="mt-1.5 text-xs text-ink-500">
                    Current logo will be kept unless you choose a new one.
                  </p>
                )}
                {logoFile && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    New logo selected: {logoFile.name}
                  </p>
                )}
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
                  placeholder="e.g. Your Healthiest Smile Starts Here"
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
                  htmlFor="video"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Background Video
                </label>

                 {currentVideo && (
                    <div className="mb-3 rounded-xl border border-brand-100 p-4">
                      <a
                        href={resolveMediaUrl(currentVideo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                      >
                        View Background Video
                      </a>
                    </div>
                  )}

                <input
                  id="video"
                  name="video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!videoFile && currentVideo && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    Current video will be kept unless you choose a new one.
                  </p>
                )}
                {videoFile && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    New video selected: {videoFile.name}
                  </p>
                )}
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
                  ? "Save"
                  : "Create Header"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHomeHeader;