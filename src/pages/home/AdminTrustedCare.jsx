import { useEffect, useState } from "react";
import {
  getTrustedCare,
  createTrustedCare,
  updateTrustedCare,
} from "../../services/home/trustedCareService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";
import RichTextEditor from "../../components/richText/RichTextEditor";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_ITEMS = () =>
  Array.from({ length: 4 }, () => ({ text: "", logo: "", logoFile: null }));
const EMPTY_FEATURES = () =>
  Array.from({ length: 4 }, () => ({ description: "", logo: "", logoFile: null }));

function AdminTrustedCare() {
  const [form, setForm] = useState({ heading: "", description: "", image: "" });
  const [imageFile, setImageFile] = useState(null);
  const [items, setItems] = useState(EMPTY_ITEMS);
  const [features, setFeatures] = useState(EMPTY_FEATURES);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTrustedCare()
      .then((data) => {
        if (data.section) {
          setRecordExists(true);
        }

        const section = data.section || {};
        setForm({
          heading: section.heading || "",
          description: section.description || "",
          image: section.image || "",
        });

        const savedItems = (section.items || []).map((item) => ({
          text: item.text || "",
          logo: item.logo || "",
          logoFile: null,
        }));

        const savedFeatures = (section.features || []).map((feature) => ({
          description: feature.description || "",
          logo: feature.logo || "",
          logoFile: null,
        }));

        // The section always uses exactly 4 items and 4 features
        setItems([
          ...savedItems,
          ...EMPTY_ITEMS(),
        ].slice(0, 4));
        setFeatures([
          ...savedFeatures,
          ...EMPTY_FEATURES(),
        ].slice(0, 4));
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

  const updateItem = (index, field, value) => {
    setMessage({ type: "", text: "" });
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const updateFeature = (index, field, value) => {
    setMessage({ type: "", text: "" });
    setFeatures((prev) =>
      prev.map((feature, i) => (i === index ? { ...feature, [field]: value } : feature))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!form.heading.trim()) {
      setMessage({ type: "error", text: "Heading is required" });
      return;
    }

    if (!isPlainText(form.heading)) {
      setMessage({
        type: "error",
        text: "Heading can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + ). HTML or other special characters are not allowed.",
      });
      return;
    }

    for (let i = 0; i < items.length; i += 1) {
      if (!isPlainText(items[i].text)) {
        setMessage({
          type: "error",
          text: `Floating item ${i + 1} text can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + ). HTML or other special characters are not allowed.`,
        });
        return;
      }
    }

    for (let i = 0; i < features.length; i += 1) {
      if (!isPlainText(features[i].description)) {
        setMessage({
          type: "error",
          text: `Feature ${i + 1} description can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + ). HTML or other special characters are not allowed.`,
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append("heading", form.heading);
    formData.append("description", form.description);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    items.forEach((item, i) => {
      formData.append(`item_text_${i}`, item.text);
      if (item.logoFile) {
        formData.append(`item_logo_${i}`, item.logoFile);
      }
    });

    features.forEach((feature, i) => {
      formData.append(`feature_description_${i}`, feature.description);
      if (feature.logoFile) {
        formData.append(`feature_logo_${i}`, feature.logoFile);
      }
    });

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createTrustedCare(formData)
        : await updateTrustedCare(formData);
      const section = data.section || {};
      setRecordExists(true);

      setForm({
        heading: section.heading || form.heading,
        description: section.description || form.description,
        image: section.image || form.image,
      });
      setImageFile(null);

      setItems(
        (section.items || []).slice(0, 4).map((item) => ({
          text: item.text || "",
          logo: item.logo || "",
          logoFile: null,
        }))
      );
      setFeatures(
        (section.features || []).slice(0, 4).map((feature) => ({
          description: feature.description || "",
          logo: feature.logo || "",
          logoFile: null,
        }))
      );

      setMessage({
        type: "success",
        text: isCreate
          ? "Trusted Care created successfully"
          : "Trusted Care updated successfully",
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
            Trusted Care
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the heading, description, image, floating card items and the
            right-side features shown on the Home page.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Heading + Description + Image */}
              <div className="space-y-5">
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
                    placeholder="e.g. Creating Healthy Smiles with Trusted Dental Care"
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
                    htmlFor="image"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    Trusted Care Image
                  </label>

                  {form.image && (
                    <div className="mb-3 rounded-xl border border-brand-100 p-4">
                      <a
                        href={resolveMediaUrl(form.image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                      >
                        View Trusted Care Image
                      </a>
                    </div>
                  )}

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                  />
                  {!imageFile && form.image && (
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
              </div>

              {/* Floating Items */}
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Floating Items
                </p>
                <p className="-mt-3 text-xs text-ink-500">
                  These appear inside the white floating card over the image.
                </p>

                {items.map((item, index) => (
                  <div
                    key={`item-${index}`}
                    className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
                  >
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                      Item {index + 1}
                    </p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Logo
                        </label>

                        {item.logo && (
                          <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                            <a
                              href={resolveMediaUrl(item.logo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                            >
                              View Logo
                            </a>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateItem(index, "logoFile", e.target.files[0] || null)
                          }
                          className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                        />
                        {!item.logoFile && item.logo && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            Current logo will be kept unless you choose a new one.
                          </p>
                        )}
                        {item.logoFile && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            New logo selected: {item.logoFile.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Text
                        </label>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateItem(index, "text", e.target.value)}
                          placeholder="e.g. Invisalign"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side Features */}
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Right Side Features
                </p>
                <p className="-mt-3 text-xs text-ink-500">
                  These appear in the bordered feature row on the right side.
                </p>

                {features.map((feature, index) => (
                  <div
                    key={`feature-${index}`}
                    className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
                  >
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                      Feature {index + 1}
                    </p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Logo
                        </label>

                        {feature.logo && (
                          <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                            <a
                              href={resolveMediaUrl(feature.logo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                            >
                              View Logo
                            </a>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateFeature(index, "logoFile", e.target.files[0] || null)
                          }
                          className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                        />
                        {!feature.logoFile && feature.logo && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            Current logo will be kept unless you choose a new one.
                          </p>
                        )}
                        {feature.logoFile && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            New logo selected: {feature.logoFile.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Description
                        </label>
                        <input
                          type="text"
                          value={feature.description}
                          onChange={(e) =>
                            updateFeature(index, "description", e.target.value)
                          }
                          placeholder="e.g. 15+ Years Of Experience"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  ? "Save Trusted Care"
                  : "Create Trusted Care"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTrustedCare;