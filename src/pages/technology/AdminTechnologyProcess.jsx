import { useEffect, useState } from "react";
import {
  getTechnologyProcess,
  createProcessSection,
  updateProcessSection,
  createProcessItem,
  updateProcessItem,
  reorderProcessItems,
  deleteProcessItem,
} from "../../services/technology/technologyProcessService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";
import RichTextEditor from "../../components/richText/RichTextEditor";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

// An empty rich-text editor still holds markup such as "<p></p>", so the tags
// are stripped before checking whether anything was actually typed
const stripRichText = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const BUTTON_CLASS =
  "rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60";
const DANGER_BUTTON_CLASS = `${BUTTON_CLASS} border border-red-200 bg-white text-red-600 hover:bg-red-50`;
const PRIMARY_BUTTON_CLASS =
  "rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60";

// A brand new item. `key` identifies the item in the form, `id` is null until
// the item has been saved by the API and `number` is assigned by the backend
// from the item order.
const EMPTY_ITEM = () => ({
  key: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  number: "",
  heading: "",
  description: "",
  logo_url: "",
  logoFile: null,
  images: [],
  display_order: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

// A brand new extra image row for an item. `id` is null until saved.
const EMPTY_IMAGE = () => ({
  key: `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  image_url: "",
  file: null,
});

// Items coming from the API are mapped to the same shape as a new item
const toItem = (item) => ({
  key: `item-${item.id}`,
  id: item.id,
  number: item.number || "",
  heading: item.heading || "",
  description: item.description || "",
  logo_url: item.logo || "",
  logoFile: null,
  images: (item.images || []).map((image) => ({
    key: `image-${image.id}`,
    id: image.id,
    image_url: image.image || "",
    file: null,
  })),
  display_order: item.display_order,
  editing: false,
  saving: false,
  message: { type: "", text: "" },
});

function AdminTechnologyProcess() {
  const [section, setSection] = useState({ text: "", heading: "" });
  const [items, setItems] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getTechnologyProcess()
      .then((data) => {
        const s = data.process || {};
        if (data.process) {
          setSectionRecordExists(true);
        }
        setSection({
          text: s.text || "",
          heading: s.heading || "",
        });
        setItems((data.process?.items || []).map(toItem));
      })
      .catch((err) => setSectionMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleSectionChange = (e) => {
    setSectionMessage({ type: "", text: "" });
    setSection({ ...section, [e.target.name]: e.target.value });
  };

  const validateSection = () => {
    if (!section.text.trim()) {
      return "Text is required.";
    }
    if (!isPlainText(section.text)) {
      return "Text can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!section.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(section.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setSectionMessage({ type: "", text: "" });

    const error = validateSection();
    if (error) {
      setSectionMessage({ type: "error", text: error });
      return;
    }

    setSavingSection(true);
    try {
      // Items can auto-create the section before it is ever saved, so a create
      // attempt is retried as an update when the row already exists.
      let data;
      if (sectionRecordExists) {
        data = await updateProcessSection(section);
      } else {
        try {
          data = await createProcessSection(section);
        } catch (err) {
          if (err.message === "Technology Process section already exists.") {
            data = await updateProcessSection(section);
          } else {
            throw err;
          }
        }
      }

      setSectionRecordExists(true);
      const saved = data.process || {};
      setSection({
        text: saved.text || "",
        heading: saved.heading || "",
      });
      setSectionMessage({
        type: "success",
        text: "Technology Process section saved successfully",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSavingSection(false);
    }
  };

  const addItem = () => setItems((prev) => [...prev, EMPTY_ITEM()]);

  const updateItemField = (key, field, value) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, [field]: value, message: { type: "", text: "" } }
          : item
      )
    );

  const updateItemLogo = (key, file) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, logoFile: file, message: { type: "", text: "" } }
          : item
      )
    );

  const addItemImage = (key) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, images: [...item.images, EMPTY_IMAGE()], message: { type: "", text: "" } }
          : item
      )
    );

  const updateItemImageFile = (itemKey, imageKey, file) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              images: item.images.map((image) =>
                image.key === imageKey ? { ...image, file } : image
              ),
              message: { type: "", text: "" },
            }
          : item
      )
    );

  const removeItemImage = (itemKey, imageKey) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === itemKey
          ? {
              ...item,
              images: item.images.filter((image) => image.key !== imageKey),
              message: { type: "", text: "" },
            }
          : item
      )
    );

  const startEditing = (key) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, editing: true, message: { type: "", text: "" } }
          : item
      )
    );

  const cancelEditing = (key) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              editing: false,
              logoFile: null,
              images: item.images.map((image) => ({ ...image, file: null })),
              message: { type: "", text: "" },
            }
          : item
      )
    );

  const validateItem = (item) => {
    if (!item.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(item.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!stripRichText(item.description)) {
      return "Description is required.";
    }
    return "";
  };

  const buildItemFormData = (item) => {
    const formData = new FormData();
    formData.append("heading", item.heading);
    formData.append("description", item.description);
    if (item.logoFile) {
      formData.append("logo", item.logoFile);
    }
    // The API needs the full image list in order: saved rows keep their id, new
    // rows send null, and removed rows are simply left out
    formData.append(
      "images",
      JSON.stringify(item.images.map(({ key, id }) => ({ key, id })))
    );
    item.images.forEach((image) => {
      if (image.file) {
        formData.append(`image_${image.key}`, image.file);
      }
    });
    return formData;
  };

  const handleItemSubmit = async (item) => {
    const formData = buildItemFormData(item);

    setItems((prev) =>
      prev.map((i) =>
        i.key === item.key
          ? { ...i, saving: true, message: { type: "", text: "" } }
          : i
      )
    );

    try {
      const data = item.id
        ? await updateProcessItem(item.id, formData)
        : await createProcessItem(formData);
      setSectionRecordExists(true);
      setItems((prev) =>
        prev.map((i) =>
          i.key === item.key
            ? {
                ...toItem(data.item),
                message: { type: "success", text: "Process item saved successfully" },
              }
            : i
        )
      );
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.key === item.key
            ? { ...i, saving: false, message: { type: "error", text: err.message } }
            : i
        )
      );
    }
  };

  const handleItemDelete = async (item) => {
    if (!item.id) {
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      return;
    }
    if (!window.confirm("Delete this process item?")) return;

    try {
      await deleteProcessItem(item.id);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.key === item.key
            ? { ...i, message: { type: "error", text: err.message } }
            : i
        )
      );
    }
  };

  const onItemSave = (item) => {
    const error = validateItem(item);
    if (error) {
      setItems((prev) =>
        prev.map((i) =>
          i.key === item.key
            ? { ...i, message: { type: "error", text: error } }
            : i
        )
      );
      return;
    }

    handleItemSubmit(item);
  };

  // Applies a fresh gapless number to every item after a reorder
  const applyOrder = (ordered) =>
    ordered.map((item, index) => ({
      ...item,
      display_order: index + 1,
      number: String(index + 1).padStart(2, "0"),
    }));

  const moveItem = (index, direction) => {
    const target = index + direction;
    const current = items[index];
    if (target < 0 || target >= items.length || !current?.id) return;

    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const next = applyOrder(reordered);
    setItems(next);

    reorderProcessItems(next.map((i) => i.id)).catch((err) =>
      setSectionMessage({ type: "error", text: err.message })
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Section-level information */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Technology &rarr; Process Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Technology Process Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Process section of the Technology page: text, heading,
            and the repeatable numbered process items with their logos and
            images.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSectionSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text <span className="text-red-500">*</span>
                </label>
                <input
                  id="text"
                  name="text"
                  type="text"
                  value={section.text}
                  onChange={handleSectionChange}
                  placeholder="e.g. Our Process"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading <span className="text-red-500">*</span>
                </label>
                <input
                  id="heading"
                  name="heading"
                  type="text"
                  value={section.heading}
                  onChange={handleSectionChange}
                  placeholder="e.g. From Scan to Smile in Three Simple Steps"
                  className={inputClass}
                />
              </div>

              {sectionMessage.text && (
                <p className={getMessageClass(sectionMessage.type)}>
                  {sectionMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={savingSection}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60 cursor-pointer"
              >
                {savingSection
                  ? "Saving..."
                  : sectionRecordExists
                  ? "Save Section"
                  : "Create Process Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Process items */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Process Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 cursor-pointer"
            >
              + Add Process Item
            </button>
          </div>
          <p className="mt-2 text-sm text-brand-800">
            Add, edit, reorder and remove the numbered process items. The step
            number (01, 02, ...) is generated automatically from the item order.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          {items.length === 0 && (
            <p className="text-sm text-ink-500">
              No process items yet. Click &quot;+ Add Process Item&quot; to create
              your first step.
            </p>
          )}

          {items.map((item, index) => (
            <div
              key={item.key}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Process Item {item.number || String(index + 1).padStart(2, "0")}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={!item.id || index === 0}
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
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={!item.id || index === items.length - 1}
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
                  <button
                    type="button"
                    onClick={() => handleItemDelete(item)}
                    title="Remove"
                    className="ml-2 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {!item.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Logo:
                      </span>
                      {item.logo_url ? (
                        <a
                          href={resolveMediaUrl(item.logo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Logo
                        </a>
                      ) : (
                        <span className="text-ink-400">No logo uploaded</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Images:
                      </span>
                      {item.images.length > 0 ? (
                        <span className="text-ink-700">
                          {item.images.length} image
                          {item.images.length > 1 ? "s" : ""} uploaded
                        </span>
                      ) : (
                        <span className="text-ink-400">No images uploaded</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Heading:
                      </span>
                      <span>{item.heading || "-"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Description:
                      </span>
                      {item.description ? (
                        <div
                          className="process-description-preview text-sm leading-relaxed text-ink-700 [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      ) : (
                        <span className="text-ink-400">-</span>
                      )}
                    </div>
                  </div>

                  {item.message.text && (
                    <p className={`mt-4 ${getMessageClass(item.message.type)}`}>
                      {item.message.text}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(item.key)}
                      className={`${PRIMARY_BUTTON_CLASS} flex-1`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemDelete(item)}
                      className={DANGER_BUTTON_CLASS}
                    >
                      Remove Item
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-5">
                  {/* Logo */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Logo / Icon
                    </label>

                    {item.logo_url && (
                      <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                        <a
                          href={resolveMediaUrl(item.logo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Current Logo
                        </a>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) =>
                        updateItemLogo(item.key, e.target.files[0] || null)
                      }
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!item.logoFile && item.logo_url && (
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

                  {/* Heading */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.heading}
                      onChange={(e) =>
                        updateItemField(item.key, "heading", e.target.value)
                      }
                      placeholder="e.g. Digital Scan"
                      className={inputClass}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      content={item.description}
                      onChange={(html) =>
                        updateItemField(item.key, "description", html)
                      }
                    />
                  </div>

                  {/* Extra images */}
                  <div className="rounded-2xl border border-brand-100 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                        Process Images
                      </p>
                      <button
                        type="button"
                        onClick={() => addItemImage(item.key)}
                        className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                      >
                        + Add Image
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-ink-500">
                      These images are displayed in circular shape below the
                      process item.
                    </p>

                    <div className="mt-4 space-y-4">
                      {item.images.length === 0 && (
                        <p className="text-sm text-ink-500">
                          No images yet. Click &quot;+ Add Image&quot; to upload one.
                        </p>
                      )}

                      {item.images.map((image, imageIndex) => (
                        <div
                          key={image.key}
                          className="rounded-xl border border-brand-100 bg-brand-50/40 p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                            Image {imageIndex + 1}
                          </p>

                          {image.image_url && (
                            <div className="mt-3 rounded-xl border border-brand-100 bg-white p-3">
                              <a
                                href={resolveMediaUrl(image.image_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-brand-600 underline hover:text-brand-700"
                              >
                                View Current Image
                              </a>
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) =>
                              updateItemImageFile(
                                item.key,
                                image.key,
                                e.target.files[0] || null
                              )
                            }
                            className="mt-3 block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                          />
                          {!image.file && image.image_url && (
                            <p className="mt-1.5 text-xs text-ink-500">
                              Current image will be kept unless you choose a new one.
                            </p>
                          )}
                          {image.file && (
                            <p className="mt-1.5 text-xs text-ink-500">
                              New image selected: {image.file.name}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => removeItemImage(item.key, image.key)}
                            className="mt-3 text-xs font-semibold text-red-600 transition hover:text-red-700"
                          >
                            Remove Image
                          </button>
                        </div>
                      ))}

                      {item.images.length > 0 && (
                        <button
                          type="button"
                          onClick={() => addItemImage(item.key)}
                          className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                        >
                          + Add Image
                        </button>
                      )}
                    </div>
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
                      onClick={() => onItemSave(item)}
                      className={`${PRIMARY_BUTTON_CLASS} flex-1`}
                    >
                      {item.saving ? "Saving..." : "Save Item"}
                    </button>
                    {item.id && (
                      <button
                        type="button"
                        onClick={() => cancelEditing(item.key)}
                        className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Process Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTechnologyProcess;