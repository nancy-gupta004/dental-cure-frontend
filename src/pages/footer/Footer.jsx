import { useEffect, useState } from "react";
import {
  getFooterSetting,
  createFooterSetting,
  updateFooterSetting,
} from "../../services/footer/footerService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// The button text, description and social text allow letters, numbers,
// spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;

const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_FORM = {
  newsletter_button_text: "",
  description: "",
  social_text: "Follow With Us",
};

function createEmptySocial(order = 1) {
  return {
    tempId: Date.now() + Math.random(),
    id: null,
    icon: "",
    iconFile: null,
    url: "",
    display_order: order,
  };
}

function Footer() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [socials, setSocials] = useState([]);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applySection = (section) => {
    setRecordExists(true);
    setForm({
      newsletter_button_text: section.newsletterButtonText || "",
      description: section.description || "",
      social_text: section.socialText || "Follow With Us",
    });
    setCurrentLogo(section.logo || "");
    setLogoFile(null);

    const loadedSocials = (section.socials || []).map((s, index) => ({
      tempId: Date.now() + Math.random() + (s.id || index),
      id: s.id,
      icon: s.icon || "",
      iconFile: null,
      url: s.url || "",
      display_order: s.display_order || index + 1,
    }));
    setSocials(loadedSocials);
  };

  useEffect(() => {
    getFooterSetting()
      .then((data) => {
        if (data.footerSetting) {
          applySection(data.footerSetting);
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (file) => {
    setMessage({ type: "", text: "" });
    setLogoFile(file);
  };

  // Social items handlers
  const handleAddSocial = () => {
    setMessage({ type: "", text: "" });
    setSocials((prev) => [...prev, createEmptySocial(prev.length + 1)]);
  };

  const handleRemoveSocial = (index) => {
    setMessage({ type: "", text: "" });
    setSocials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSocialUrlChange = (index, value) => {
    setMessage({ type: "", text: "" });
    setSocials((prev) =>
      prev.map((item, i) => (i === index ? { ...item, url: value } : item))
    );
  };

  const handleSocialIconChange = (index, file) => {
    setMessage({ type: "", text: "" });
    setSocials((prev) =>
      prev.map((item, i) => (i === index ? { ...item, iconFile: file } : item))
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setMessage({ type: "", text: "" });
    setSocials((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index) => {
    if (index === socials.length - 1) return;
    setMessage({ type: "", text: "" });
    setSocials((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const validate = () => {
    const textFields = [
      { key: "newsletter_button_text", label: "Newsletter Button Text" },
      { key: "description", label: "Description" },
      { key: "social_text", label: "Social Media Text" },
    ];

    for (const field of textFields) {
      if (!isPlainText(form[field.key] || "")) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : / ). HTML or other special characters are not allowed.`;
      }
    }

    for (let i = 0; i < socials.length; i++) {
      const item = socials[i];
      const itemNum = i + 1;
      if (!item.url.trim()) {
        return `Social Link ${itemNum}: URL is required.`;
      }
      if (/^javascript:/i.test(item.url.trim())) {
        return `Social Link ${itemNum}: Invalid URL format.`;
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
    formData.append("newsletter_button_text", form.newsletter_button_text);
    formData.append("description", form.description);
    formData.append("social_text", form.social_text);

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    const socialsPayload = socials.map((item, index) => {
      const fileKey = `social_icon_${item.id || item.tempId || index}`;
      if (item.iconFile) {
        formData.append(fileKey, item.iconFile);
      }
      return {
        id: item.id || null,
        url: item.url.trim(),
        icon: item.icon,
        fileKey,
        display_order: index + 1,
      };
    });

    formData.append("socials", JSON.stringify(socialsPayload));

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createFooterSetting(formData)
        : await updateFooterSetting(formData);

      applySection(data.footerSetting || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Footer Setting created successfully"
          : "Footer Setting updated successfully",
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
            Footer &rarr; Footer Setting
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Footer Setting
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the logo, newsletter button text, description and social media
            links shown in the site footer.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo */}
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
                      alt="Footer logo"
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
                  onChange={(e) => handleLogoChange(e.target.files[0] || null)}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />

                {!logoFile && currentLogo && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    Current logo will be kept unless you choose a new one.
                  </p>
                )}

                {logoFile && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    New image selected: {logoFile.name}
                  </p>
                )}
              </div>

              {/* Newsletter Button Text */}
              <div>
                <label
                  htmlFor="newsletter_button_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Newsletter Button Text
                </label>
                <input
                  id="newsletter_button_text"
                  name="newsletter_button_text"
                  type="text"
                  value={form.newsletter_button_text}
                  onChange={handleChange}
                  placeholder="e.g. Subscribe to our newsletter"
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
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Gentle, modern dentistry for every smile."
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Social Media Section */}
              <div className="pt-6 border-t border-brand-100">
                <div className="mb-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                    Social Media
                  </span>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-brand-900">
                    Social Media
                  </h2>
                  <p className="mt-1 text-xs text-ink-500">
                    Configure the social media heading text and manage social links with icons and URLs.
                  </p>
                </div>

                {/* Social Media Text */}
                <div className="mb-6">
                  <label
                    htmlFor="social_text"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    Text
                  </label>
                  <input
                    id="social_text"
                    name="social_text"
                    type="text"
                    value={form.social_text}
                    onChange={handleChange}
                    placeholder="e.g. Follow With Us"
                    className={inputClass}
                  />
                </div>

                {/* Repeatable Social Media Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-800">
                        Social Media Items
                      </h3>
                      <p className="text-xs text-ink-500">
                        Add, edit, delete and reorder your social media channels.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSocial}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 hover:text-brand-800 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                      </svg>
                      Add Social Link
                    </button>
                  </div>

                  {socials.length === 0 && (
                    <p className="py-6 text-center text-sm text-ink-500">
                      No social media items added yet. Click &quot;Add Social Link&quot; to add one.
                    </p>
                  )}

                  {socials.map((item, index) => (
                    <div
                      key={item.tempId}
                      className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5 space-y-4 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-200 text-xs font-bold text-brand-800">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                            Social Media Item {index + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            title="Move Up"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-700 shadow-sm transition hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === socials.length - 1}
                            title="Move Down"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-700 shadow-sm transition hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSocial(index)}
                            className="ml-2 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Icon */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Icon
                        </label>

                        {item.icon && (
                          <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
                            <img
                              src={resolveMediaUrl(item.icon)}
                              alt={`Social ${index + 1} Icon`}
                              className="h-10 w-10 rounded-lg border border-brand-200 bg-brand-50 object-contain p-1.5"
                            />
                            <div className="text-xs">
                              <a
                                href={resolveMediaUrl(item.icon)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-brand-600 underline hover:text-brand-700"
                              >
                                View Uploaded Icon
                              </a>
                              <p className="text-ink-400">
                                Current icon will be kept unless changed.
                              </p>
                            </div>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) =>
                            handleSocialIconChange(index, e.target.files[0] || null)
                          }
                          className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                        />

                        {item.iconFile && (
                          <p className="mt-1 text-xs text-ink-500">
                            New icon selected: {item.iconFile.name}
                          </p>
                        )}
                      </div>

                      {/* URL */}
                      <div>
                        <label
                          htmlFor={`social_url_${item.tempId}`}
                          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                        >
                          URL
                        </label>
                        <input
                          id={`social_url_${item.tempId}`}
                          type="text"
                          value={item.url}
                          onChange={(e) =>
                            handleSocialUrlChange(index, e.target.value)
                          }
                          placeholder="e.g. https://instagram.com/thedentalcure"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}

                  {socials.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddSocial}
                      className="w-full rounded-xl border border-dashed border-brand-300 py-3 text-xs font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer"
                    >
                      + Add Another Social Link
                    </button>
                  )}
                </div>
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
                  : "Create Footer Setting"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Footer;