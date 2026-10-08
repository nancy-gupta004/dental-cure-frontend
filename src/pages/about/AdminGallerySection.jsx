import { useEffect, useState } from "react";
import {
  getGallery,
  createSection,
  updateSection,
} from "../../services/about/galleryService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// A brand new row. `key` identifies the row in the form, `id` is null until the
// image has been saved by the API.
const EMPTY_IMAGE = () => ({
  key: `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  image_url: "",
  file: null,
});

// Images coming from the API are mapped to the same shape as a new row
const toImage = (image) => ({
  key: `image-${image.id}`,
  id: image.id,
  image_url: image.image || "",
  file: null,
});

const BUTTON_CLASS =
  "rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60";
const DANGER_BUTTON_CLASS = `${BUTTON_CLASS} border border-red-200 bg-white text-red-600 hover:bg-red-50`;

function AdminGallerySection() {
  const [section, setSection] = useState({ text: "", heading: "" });
  const [images, setImages] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGallery()
      .then((data) => {
        if (data.section) {
          setSectionRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          text: s.text || "",
          heading: s.heading || "",
        });
        setImages((data.images || []).map(toImage));
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleSectionChange = (e) => {
    setMessage({ type: "", text: "" });
    setSection({ ...section, [e.target.name]: e.target.value });
  };

  const addImage = () => setImages((prev) => [...prev, EMPTY_IMAGE()]);

  const updateImageFile = (key, file) => {
    setMessage({ type: "", text: "" });
    setImages((prev) =>
      prev.map((image) => (image.key === key ? { ...image, file } : image))
    );
  };

  // The row is dropped from the list, so the API removes the saved image on the
  // next save. A row that was never saved disappears straight away.
  const removeImage = (key) => {
    setMessage({ type: "", text: "" });
    setImages((prev) => prev.filter((image) => image.key !== key));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    const formData = new FormData();
    formData.append("text", section.text);
    formData.append("heading", section.heading);
    // The API needs the full list in order: saved rows keep their id, new rows
    // send null, and removed rows are simply left out
    formData.append(
      "items",
      JSON.stringify(images.map(({ key, id }) => ({ key, id })))
    );
    images.forEach((image) => {
      if (image.file) {
        formData.append(`image_${image.key}`, image.file);
      }
    });

    try {
      const isCreate = !sectionRecordExists;
      const data = isCreate ? await createSection(formData) : await updateSection(formData);
      const saved = data.section || {};

      setSectionRecordExists(true);
      setSection({
        text: saved.text || "",
        heading: saved.heading || "",
      });
      setImages((data.images || []).map(toImage));
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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Gallery
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the text and heading of the Gallery section, and manage the
            images shown in it.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={section.text}
                  onChange={handleSectionChange}
                  placeholder="e.g. Gallery"
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
                  value={section.heading}
                  onChange={handleSectionChange}
                  placeholder="e.g. A Modern Dental Environment Designed Around Your Comfort"
                  className={inputClass}
                />
              </div>

              {/* Gallery images */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                    Gallery Images
                  </p>
                  <button
                    type="button"
                    onClick={addImage}
                    className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                  >
                    + Add Image
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  {images.length === 0 && (
                    <p className="text-sm text-ink-500">
                      No images yet. Click &quot;+ Add Image&quot; to upload the
                      first one.
                    </p>
                  )}

                  {images.map((image, index) => (
                    <div
                      key={image.key}
                      className="rounded-2xl border border-brand-100 bg-white p-5"
                    >
                      <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                        Image {index + 1}
                      </p>

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Upload Image
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={(e) =>
                            updateImageFile(image.key, e.target.files[0] || null)
                          }
                          className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                        />
                        {!image.file && image.image_url && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            Current image will be kept unless you choose a new
                            one.
                          </p>
                        )}
                        {image.file && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            New image selected: {image.file.name}
                          </p>
                        )}
                        {!image.file && !image.image_url && (
                          <p className="mt-1.5 text-xs text-ink-500">
                            No image uploaded yet.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex gap-3">
                        {image.image_url ? (
                          <a
                            href={resolveMediaUrl(image.image_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${BUTTON_CLASS} border border-brand-200 bg-white text-brand-700 hover:bg-brand-50`}
                          >
                            View Image
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className={`${BUTTON_CLASS} border border-brand-200 bg-white text-ink-400`}
                          >
                            View Image
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.key)}
                          className={DANGER_BUTTON_CLASS}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addImage}
                    className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    + Add Image
                  </button>
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
                  : sectionRecordExists
                  ? "Save Gallery"
                  : "Create Gallery Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminGallerySection;
