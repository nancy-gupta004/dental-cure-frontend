import { useEffect, useState } from "react";
import {
  getFooterServices,
  saveFooterServices,
} from "../../services/footer/serviceItemService";
import { inputClass, getMessageClass } from "../../utils/classes";

const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

function createEmptyItem(order = 1) {
  return {
    tempId: Date.now() + Math.random(),
    id: null,
    name: "",
    url: "",
    display_order: order,
  };
}

function AdminFooterServices() {
  const [text, setText] = useState("Services");
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFooterServices()
      .then((data) => {
        setText(data.text || "Services");
        const loaded = (data.services || []).map((s, index) => ({
          tempId: Date.now() + Math.random() + (s.id || index),
          id: s.id,
          name: s.name || "",
          url: s.url || "",
          display_order: s.display_order || index + 1,
        }));
        setItems(loaded.length > 0 ? loaded : [createEmptyItem(1)]);
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = () => {
    setMessage({ type: "", text: "" });
    setItems((prev) => [...prev, createEmptyItem(prev.length + 1)]);
  };

  const handleRemoveItem = (index) => {
    setMessage({ type: "", text: "" });
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemNameChange = (index, value) => {
    setMessage({ type: "", text: "" });
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: value } : item))
    );
  };

  const handleItemUrlChange = (index, value) => {
    setMessage({ type: "", text: "" });
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, url: value } : item))
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setMessage({ type: "", text: "" });
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    setMessage({ type: "", text: "" });
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const validate = () => {
    if (!text.trim()) {
      return "Section text is required.";
    }
    if (!isPlainText(text)) {
      return "Section text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemNum = i + 1;

      if (!item.name.trim()) {
        return `Item ${itemNum}: Service Name is required.`;
      }
      if (!isPlainText(item.name)) {
        return `Item ${itemNum}: Service Name can only contain letters, numbers, spaces, and basic punctuation.`;
      }
      if (!item.url.trim()) {
        return `Item ${itemNum}: URL is required.`;
      }
      if (/^javascript:/i.test(item.url.trim())) {
        return `Item ${itemNum}: Invalid URL format.`;
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

    setSaving(true);
    try {
      const payload = {
        text: text.trim(),
        services: items.map((item, index) => ({
          id: item.id || null,
          name: item.name.trim(),
          url: item.url.trim(),
          display_order: index + 1,
        })),
      };

      const data = await saveFooterServices(payload);
      setText(data.text || "Services");
      const loaded = (data.services || []).map((s, index) => ({
        tempId: Date.now() + Math.random() + (s.id || index),
        id: s.id,
        name: s.name || "",
        url: s.url || "",
        display_order: s.display_order || index + 1,
      }));
      setItems(loaded.length > 0 ? loaded : [createEmptyItem(1)]);

      setMessage({
        type: "success",
        text: "Service links saved successfully",
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
            Footer &rarr; Service Links
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Service Links
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the service heading text and repeatable service links shown in the footer.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Heading Text */}
              <div>
                <label
                  htmlFor="text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text
                </label>
                <input
                  id="text"
                  name="text"
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setMessage({ type: "", text: "" });
                    setText(e.target.value);
                  }}
                  placeholder="e.g. Services"
                  className={inputClass}
                />
              </div>

              {/* Service Items Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <div>
                    <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                      Service Items
                    </h2>
                    <p className="text-xs text-ink-500">
                      Add, edit, remove and reorder service links.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
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
                    Add Service Item
                  </button>
                </div>

                {items.length === 0 && (
                  <p className="py-6 text-center text-sm text-ink-500">
                    No service items added yet. Click &quot;Add Service Item&quot; to add one.
                  </p>
                )}

                {items.map((item, index) => (
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
                          Service Item {index + 1}
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
                          disabled={index === items.length - 1}
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
                          onClick={() => handleRemoveItem(index)}
                          className="ml-2 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Service Name */}
                    <div>
                      <label
                        htmlFor={`item_name_${item.tempId}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                      >
                        Service Name
                      </label>
                      <input
                        id={`item_name_${item.tempId}`}
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleItemNameChange(index, e.target.value)
                        }
                        placeholder="e.g. Dental Implants"
                        className={inputClass}
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label
                        htmlFor={`item_url_${item.tempId}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                      >
                        URL
                      </label>
                      <input
                        id={`item_url_${item.tempId}`}
                        type="text"
                        value={item.url}
                        onChange={(e) =>
                          handleItemUrlChange(index, e.target.value)
                        }
                        placeholder="e.g. /service/dental-implants or https://example.com/service"
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full rounded-xl border border-dashed border-brand-300 py-3 text-xs font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer"
                  >
                    + Add Another Service Item
                  </button>
                )}
              </div>

              {/* Message Toast */}
              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Service Links"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFooterServices;
