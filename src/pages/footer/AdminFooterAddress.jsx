import { useEffect, useState } from "react";
import {
  getAllFooterAddresses,
  createFooterAddress,
  updateFooterAddress,
  deleteFooterAddress,
} from "../../services/footer/addressService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

let tempKey = 0;
const newKey = () => `new-${Date.now()}-${tempKey++}`;

function createEmptyAddress() {
  return {
    key: newKey(),
    id: null,
    title: "",
    description: "",
    logo: "",
    status: "active",
    logoFile: null,
    editing: true,
    saving: false,
    message: { type: "", text: "" },
  };
}

function mapSavedAddress(address) {
  return {
    key: `address-${address.id}-${Date.now()}`,
    id: address.id,
    title: address.title || "",
    description: address.description || "",
    logo: address.logo || "",
    status: address.status || "active",
    logoFile: null,
    editing: false,
    saving: false,
    message: { type: "", text: "" },
  };
}

function AdminFooterAddress() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  const loadAddresses = () =>
    getAllFooterAddresses()
      .then((data) => setItems((data.addresses || []).map(mapSavedAddress)))
      .catch((err) => setMessage({ type: "error", text: err.message }));

  useEffect(() => {
    getAllFooterAddresses()
      .then((data) => setItems((data.addresses || []).map(mapSavedAddress)))
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const updateItemState = (key, updater) =>
    setItems((prev) => prev.map((item) => (item.key === key ? updater(item) : item)));

  const handleAddAddress = () => {
    setMessage({ type: "", text: "" });
    setItems((prev) => [...prev, createEmptyAddress()]);
  };

  const handleFieldChange = (key, field, value) => {
    updateItemState(key, (item) => ({
      ...item,
      [field]: value,
      message: { type: "", text: "" },
    }));
  };

  const handleLogoChange = (key, file) => {
    updateItemState(key, (item) => ({
      ...item,
      logoFile: file,
      message: { type: "", text: "" },
    }));
  };

  const startEditing = (key) =>
    updateItemState(key, (item) => ({
      ...item,
      editing: true,
      logoFile: null,
      message: { type: "", text: "" },
    }));

  const cancelEditing = (key) =>
    updateItemState(key, (item) => ({
      ...item,
      editing: false,
      logoFile: null,
      message: { type: "", text: "" },
    }));

  const validateItem = (item) => {
    if (!item.title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(item.title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(item.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!item.id && !item.logoFile) {
      return "Logo is required.";
    }
    return "";
  };

  const applySavedAddress = (item, saved) => {
    const savedItem = mapSavedAddress(saved);
    savedItem.message = { type: "success", text: "Address saved successfully" };
    savedItem.editing = false;
    setItems((prevItems) =>
      prevItems.map((i) => (i.key === item.key ? savedItem : i))
    );
  };

  const handleSaveAddress = async (item) => {
    const error = validateItem(item);
    if (error) {
      updateItemState(item.key, (prev) => ({
        ...prev,
        message: { type: "error", text: error },
      }));
      return;
    }

    const formData = new FormData();
    formData.append("title", item.title);
    formData.append("description", item.description);
    formData.append("status", item.status);
    if (item.logoFile) {
      formData.append("logo", item.logoFile);
    }

    updateItemState(item.key, (prev) => ({
      ...prev,
      saving: true,
      message: { type: "", text: "" },
    }));

    try {
      const data = item.id
        ? await updateFooterAddress(item.id, formData)
        : await createFooterAddress(formData);
      applySavedAddress(item, data.address);
    } catch (err) {
      updateItemState(item.key, (prev) => ({
        ...prev,
        saving: false,
        message: { type: "error", text: err.message },
      }));
    }
  };

  const handleDeleteAddress = async (item) => {
    if (!item.id) {
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      return;
    }
    if (!window.confirm("Delete this address card?")) return;

    try {
      await deleteFooterAddress(item.id);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    } catch (err) {
      updateItemState(item.key, (prev) => ({
        ...prev,
        message: { type: "error", text: err.message },
      }));
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Footer &rarr; Address Section
              </span>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
                Address
              </h1>
              <p className="mt-2 text-sm text-brand-800">
                Add, edit, and delete the address cards shown in the footer.
                Active addresses appear on the public footer in the order they
                were added, up to four per row.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <>
              <button
                type="button"
                onClick={handleAddAddress}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                Add Address
              </button>
              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              {items.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-500">
                  No address cards yet. Click &quot;Add Address&quot; to create
                  your first one.
                </p>
              )}

              {items.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) =>
                    item.editing ? (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5"
                      >
                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                          {item.id ? "Edit Address" : "New Address"}
                        </p>

                        <div className="mt-4 space-y-5">
                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Logo{" "}
                              {!item.id && <span className="text-red-500">*</span>}
                            </label>

                            {item.logo && (
                              <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                                <img
                                  src={resolveMediaUrl(item.logo)}
                                  alt="Current Logo"
                                  className="mb-3 h-20 w-auto rounded-lg border border-brand-200 bg-white object-contain p-2"
                                />
                                <a
                                  href={resolveMediaUrl(item.logo)}
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
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) =>
                                handleLogoChange(item.key, e.target.files[0] || null)
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
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                handleFieldChange(item.key, "title", e.target.value)
                              }
                              placeholder="e.g. Head Office"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Description
                            </label>
                            <textarea
                              rows="3"
                              value={item.description}
                              onChange={(e) =>
                                handleFieldChange(item.key, "description", e.target.value)
                              }
                              placeholder="e.g. 123 Main Street, Colombo"
                              className={inputClass}
                            />
                          </div>

                          <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Status
                              </label>
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleFieldChange(item.key, "status", e.target.value)
                                }
                                className={inputClass}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                              <p className="mt-1 text-xs text-ink-500">
                                Inactive addresses stay hidden on the public page.
                              </p>
                            </div>

                          {item.message.text && (
                            <p className={getMessageClass(item.message.type)}>
                              {item.message.text}
                            </p>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={item.saving}
                              onClick={() => handleSaveAddress(item)}
                              className="flex-1 cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                            >
                              {item.saving ? "Saving..." : "Save Address"}
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEditing(item.key)}
                              className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={item.key}
                        className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-md shadow-brand-400/10"
                      >
                        <div className="relative">
                          {item.logo ? (
                            <img
                              src={resolveMediaUrl(item.logo)}
                              alt={item.title}
                              className="aspect-[16/10] w-full bg-white p-3 object-contain"
                            />
                          ) : (
                            <div className="flex aspect-[16/10] w-full items-center justify-center bg-brand-50">
                              <span className="text-xs text-ink-400">
                                No logo
                              </span>
                            </div>
                          )}

                          {item.status !== "active" && (
                            <div className="absolute left-2 top-2 rounded-full bg-ink-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                              Inactive
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/70 to-transparent px-3 pb-2 pt-8">
                            <p className="truncate text-center text-sm font-semibold text-white">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {item.description && (
                          <p className="px-4 pt-3 text-xs leading-relaxed text-ink-600">
                            <span className="line-clamp-2">{item.description}</span>
                          </p>
                        )}

                        <div className="flex gap-2 p-3">
                          <button
                            type="button"
                            onClick={() => startEditing(item.key)}
                            className="flex-1 cursor-pointer rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-400/30 transition hover:from-brand-400 hover:to-brand-500"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(item)}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>

                        {item.message.text && (
                          <p className={getMessageClass(item.message.type)}>
                            {item.message.text}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="mt-8 w-full cursor-pointer rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  + Add Another Address
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFooterAddress;