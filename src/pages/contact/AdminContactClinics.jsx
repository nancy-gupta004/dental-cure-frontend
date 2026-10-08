import { useEffect, useState } from "react";
import {
  getClinics,
  createClinics,
  updateClinics,
  createClinicCard,
  updateClinicCard,
  deleteClinicCard,
} from "../../services/contact/contactClinicsService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_SECTION_FORM = {
  title: "",
  heading: "",
  description: "",
};

// A card that has never been saved has no id and gets a temporary key so React
// can keep track of it while the admin types
const toCard = (card) => ({
  key: card.id ? `card-${card.id}` : `new-${Date.now()}-${Math.random()}`,
  id: card.id ?? null,
  heading: card.heading || "",
  address: card.address || "",
  phone: card.phone || "",
  timing: card.timing || "",
  button_text: card.button_text || "",
  imageFile: null,
  currentImage: card.image || "",
  editing: false,
  saving: false,
  message: { type: "", text: "" },
});

function AdminContactClinics() {
  const [form, setForm] = useState(EMPTY_SECTION_FORM);
  const [recordExists, setRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [cardsMessage, setCardsMessage] = useState({ type: "", text: "" });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClinics()
      .then((data) => {
        const section = data.section;
        if (section) {
          setRecordExists(true);
          setForm({
            title: section.title || "",
            heading: section.heading || "",
            description: section.description || "",
          });
        }
        setCards((data.cards || []).map(toCard));
      })
      .catch((err) => setSectionMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setSectionMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const checks = [
      ["title", "Title"],
      ["heading", "Heading"],
      ["description", "Description"],
    ];

    for (const [key, label] of checks) {
      if (!form[key].trim()) {
        return `${label} is required.`;
      }
      if (!isPlainText(form[key])) {
        return `${label} can only contain letters, numbers, spaces, and basic punctuation.`;
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSectionMessage({ type: "", text: "" });

    const error = validate();
    if (error) {
      setSectionMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    try {
      // The section is a singleton: POST only for the very first save, every
      // later save is an update of the same record
      const isCreate = !recordExists;
      const data = isCreate
        ? await createClinics(form)
        : await updateClinics(form);

      // Read the record back, so the form always shows what is actually stored
      const section = data.section || {};
      setRecordExists(true);
      setForm({
        title: section.title || "",
        heading: section.heading || "",
        description: section.description || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Clinics section created successfully."
          : "Clinics section updated successfully.",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ----- Clinic cards -----

  const addCard = () => {
    // A card belongs to the section, so the section has to be saved first
    if (!recordExists) {
      setCardsMessage({
        type: "error",
        text: "Save the Clinics section first, then you can add clinic cards.",
      });
      return;
    }

    setCardsMessage({ type: "", text: "" });
    setCards((prev) => [...prev, { ...toCard({}), editing: true }]);
  };

  const updateCardField = (key, field, value) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, [field]: value, message: { type: "", text: "" } }
          : card
      )
    );

  const updateCardImage = (key, file) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, imageFile: file, message: { type: "", text: "" } }
          : card
      )
    );

  const startEditing = (key) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, editing: true, message: { type: "", text: "" } }
          : card
      )
    );

  const cancelEditing = (key) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? {
              ...card,
              editing: false,
              imageFile: null,
              message: { type: "", text: "" },
            }
          : card
      )
    );

  const validateCard = (card) => {
    const checks = [
      ["heading", "Clinic Heading"],
      ["address", "Clinic Address"],
      ["phone", "Phone Number"],
      ["timing", "Timing"],
      ["button_text", "Button Text"],
    ];

    for (const [key, label] of checks) {
      if (!card[key].trim()) {
        return `${label} is required.`;
      }
      if (!isPlainText(card[key])) {
        return `${label} can only contain letters, numbers, spaces, and basic punctuation.`;
      }
    }

    // A brand new card cannot be stored without an image, while an existing card
    // keeps the image that is already uploaded
    if (!card.id && !card.imageFile) {
      return "Image is required.";
    }

    return "";
  };

  const handleCardSubmit = async (card) => {
    const formData = new FormData();
    formData.append("heading", card.heading);
    formData.append("address", card.address);
    formData.append("phone", card.phone);
    formData.append("timing", card.timing);
    formData.append("button_text", card.button_text);

    // The image is optional on a later save: without a new file the current
    // image is kept
    if (card.imageFile) {
      formData.append("image", card.imageFile);
    }

    setCards((prev) =>
      prev.map((c) =>
        c.key === card.key
          ? { ...c, saving: true, message: { type: "", text: "" } }
          : c
      )
    );

    try {
      const data = card.id
        ? await updateClinicCard(card.id, formData)
        : await createClinicCard(formData);

      // Saving a card flips it back to read mode
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? {
                ...toCard(data.card),
                message: { type: "success", text: "Clinic card saved successfully" },
              }
            : c
        )
      );
    } catch (err) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? { ...c, saving: false, message: { type: "error", text: err.message } }
            : c
        )
      );
    }
  };

  const handleCardDelete = async (card) => {
    // A card that was never saved is only removed from the list
    if (!card.id) {
      setCards((prev) => prev.filter((c) => c.key !== card.key));
      return;
    }

    if (!window.confirm("Delete this clinic card?")) {
      return;
    }

    try {
      await deleteClinicCard(card.id);
      setCards((prev) => prev.filter((c) => c.key !== card.key));
    } catch (err) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? { ...c, message: { type: "error", text: err.message } }
            : c
        )
      );
    }
  };

  const onCardSave = (card) => {
    const error = validateCard(card);
    if (error) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? { ...c, message: { type: "error", text: error } }
            : c
        )
      );
      return;
    }

    handleCardSubmit(card);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* ----- Main Clinics section ----- */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Contact &rarr; Clinics Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Clinics Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Clinics section of the Contact Us page: the title,
            heading and description shown above the clinic cards.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Clinics"
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
                  placeholder="e.g. Our Two Clinics"
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
                  placeholder="e.g. Visit either of our clinics for world class dental care."
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
                disabled={saving}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save / Update"
                  : "Create Clinics Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ----- Clinic cards ----- */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="flex justify-between bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Contact &rarr; Clinic Cards
            </span>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-900">
              Clinic Cards
            </h2>
            <p className="mt-2 text-sm text-brand-800">
              Add as many clinic cards as you need. Each card has an image, a
              heading, address, phone number, timing and a button.
            </p>
          </div>

          <button
            type="button"
            onClick={addCard}
            className="h-fit shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
          >
            + Add Clinic
          </button>
        </div>

        <div className="space-y-6 px-8 py-8">
          {!recordExists && (
            <p className="text-xs text-ink-500">
              Save the Clinics section first, then you can add clinic cards.
            </p>
          )}

          {cardsMessage.text && (
            <p className={getMessageClass(cardsMessage.type)}>
              {cardsMessage.text}
            </p>
          )}

          {cards.length === 0 && (
            <p className="text-sm text-ink-500">No clinic cards added yet.</p>
          )}

          {cards.map((card, index) => (
            <div
              key={card.key}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Clinic {index + 1}
                </p>
              </div>

              {!card.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Image:
                      </span>
                      {card.currentImage ? (
                        <a
                          href={resolveMediaUrl(card.currentImage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Image
                        </a>
                      ) : (
                        <span className="text-ink-400">No image uploaded</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Heading:
                      </span>
                      <span>{card.heading || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Address:
                      </span>
                      <span>{card.address || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Phone:
                      </span>
                      <span>{card.phone || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Timing:
                      </span>
                      <span>{card.timing || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Button Text:
                      </span>
                      <span>{card.button_text || "-"}</span>
                    </div>
                  </div>

                  {card.message.text && (
                    <p className={`mt-4 ${getMessageClass(card.message.type)}`}>
                      {card.message.text}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(card.key)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCardDelete(card)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4 space-y-5">
                    {/* Image */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Image
                      </label>
                      {card.currentImage && (
                        <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                          <a
                            href={resolveMediaUrl(card.currentImage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                          >
                            View Current Image
                          </a>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) =>
                          updateCardImage(card.key, e.target.files[0] || null)
                        }
                        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                      />
                      {!card.imageFile && card.currentImage && (
                        <p className="mt-1.5 text-xs text-ink-500">
                          Current image will be kept unless you choose a new one.
                        </p>
                      )}
                      {card.imageFile && (
                        <p className="mt-1.5 text-xs text-ink-500">
                          New image selected: {card.imageFile.name}
                        </p>
                      )}
                    </div>

                    {/* Heading */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Heading
                      </label>
                      <input
                        type="text"
                        value={card.heading}
                        onChange={(e) =>
                          updateCardField(card.key, "heading", e.target.value)
                        }
                        placeholder="e.g. Dental Cure - Gurgaon"
                        className={inputClass}
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Address
                      </label>
                      <textarea
                        rows="3"
                        value={card.address}
                        onChange={(e) =>
                          updateCardField(card.key, "address", e.target.value)
                        }
                        placeholder="e.g. 1287 Xp, Near Artemis hospital, Sec 57, Gurgaon"
                        className={inputClass}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={card.phone}
                        onChange={(e) =>
                          updateCardField(card.key, "phone", e.target.value)
                        }
                        placeholder="e.g. 91-9870303656"
                        className={inputClass}
                      />
                    </div>

                    {/* Timing */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Timing
                      </label>
                      <input
                        type="text"
                        value={card.timing}
                        onChange={(e) =>
                          updateCardField(card.key, "timing", e.target.value)
                        }
                        placeholder="e.g. Mon - Sunday : 10:00 AM to 8:00 PM"
                        className={inputClass}
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={card.button_text}
                        onChange={(e) =>
                          updateCardField(card.key, "button_text", e.target.value)
                        }
                        placeholder="e.g. Get Directions"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {card.message.text && (
                    <p className={`mt-4 ${getMessageClass(card.message.type)}`}>
                      {card.message.text}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onCardSave(card)}
                      disabled={card.saving}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                    >
                      {card.saving ? "Saving..." : "Save Clinic"}
                    </button>
                    {card.id && (
                      <button
                        type="button"
                        onClick={() => cancelEditing(card.key)}
                        className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCard}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Clinic
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminContactClinics;
