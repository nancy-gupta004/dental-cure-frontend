import { useEffect, useState } from "react";
import {
  getImage,
  createImage,
  updateImage,
  IMAGE_FIELDS,
} from "../../services/internationalPatients/imageService";
import { getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// One slot starts empty and then holds the url that was stored for it
const emptySlot = () => ({ file: null, url: "" });

const EMPTY_SLOTS = IMAGE_FIELDS.reduce(
  (slots, field) => ({ ...slots, [field]: emptySlot() }),
  {}
);

// The API returns the four slots as image1 to image4, so the stored url of a
// slot is read by its position instead of rebuilding the key everywhere
const slotsFromSection = (image) =>
  IMAGE_FIELDS.reduce(
    (slots, field, index) => ({
      ...slots,
      [field]: { file: null, url: image[`image${index + 1}`] || "" },
    }),
    {}
  );

function Image() {
  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getImage()
      .then((data) => {
        const section = data.image;
        if (section) {
          setRecordExists(true);
          setSlots(slotsFromSection(section));
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (field, file) => {
    setMessage({ type: "", text: "" });
    setSlots((prev) => ({ ...prev, [field]: { file, url: prev[field].url } }));
  };

  const applyImage = (image) => {
    setRecordExists(true);
    setSlots(slotsFromSection(image));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    for (const field of IMAGE_FIELDS) {
      if (slots[field].file) {
        formData.append(field, slots[field].file);
      }
    }

    setSaving(true);
    try {
      // A section that already exists is always updated, so saving twice can
      // never create a second record
      const isCreate = !recordExists;
      const data = isCreate ? await createImage(formData) : await updateImage(formData);

      applyImage(data.image || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Image section created successfully."
          : "Image section updated successfully.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const imageField = (field, number) => {
    const slot = slots[field];

    return (
      <div
        key={field}
        className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
      >
        <label
          htmlFor={field}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
        >
          Image {number}
        </label>

        {slot.url && (
          <div className="rounded-xl border border-brand-100 bg-white p-4">
            <p className="mb-1.5 text-xs font-medium text-ink-500">Uploaded Image:</p>

            <img
              src={resolveMediaUrl(slot.url)}
              alt={`Image ${number}`}
              className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
            />

            <a
              href={resolveMediaUrl(slot.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
            >
              View Image
            </a>
          </div>
        )}

        <input
          id={field}
          name={field}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={(e) => handleImageChange(field, e.target.files[0] || null)}
          className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
        />

        {!slot.file && slot.url && (
          <p className="text-xs text-ink-500">
            Current image will be kept unless you choose a new one.
          </p>
        )}

        {slot.file && (
          <p className="text-xs text-ink-500">New image selected: {slot.file.name}</p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            International Patients &rarr; Image Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Image Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the four images of the International Patients page. Leave a slot
            empty to keep the image that is already stored.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {IMAGE_FIELDS.map((field, index) => imageField(field, index + 1))}

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
                  : "Create Image Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Image;