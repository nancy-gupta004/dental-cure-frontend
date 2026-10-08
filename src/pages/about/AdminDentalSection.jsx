import { useEffect, useState } from "react";
import {
  getDental,
  createDental,
  updateDental,
  MAX_DENTAL_CARDS,
} from "../../services/about/dentalService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const createEmptyCard = () => ({
  tempId: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  title: "",
  description: "",
});

function AdminDentalSection() {
  const [text, setText] = useState("");
  const [heading, setHeading] = useState("");
  const [image1, setImage1] = useState({ file: null, url: "" });
  const [image2, setImage2] = useState({ file: null, url: "" });
  const [cards, setCards] = useState([]);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cardsFull = cards.length >= MAX_DENTAL_CARDS;

  useEffect(() => {
    getDental()
      .then((data) => {
        const section = data.section;
        if (section) {
          setRecordExists(true);
          setText(section.text || "");
          setHeading(section.heading || "");
          setImage1({ file: null, url: section.image1 || "" });
          setImage2({ file: null, url: section.image2 || "" });
        }
        setCards(
          (data.cards || []).map((card) => ({
            tempId: `card-${card.id}`,
            id: card.id,
            title: card.title || "",
            description: card.description || "",
          }))
        );
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleCardChange = (index, field, value) => {
    setMessage({ type: "", text: "" });
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddCard = () => {
    if (cards.length >= MAX_DENTAL_CARDS) return;
    setMessage({ type: "", text: "" });
    setCards((prev) => [...prev, createEmptyCard()]);
  };

  const handleRemoveCard = (index) => {
    setMessage({ type: "", text: "" });
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (which, file) => {
    setMessage({ type: "", text: "" });
    if (which === 1) {
      setImage1((prev) => ({ ...prev, file }));
    } else {
      setImage2((prev) => ({ ...prev, file }));
    }
  };

  const validate = () => {
    if (!text.trim()) {
      return "Text is required.";
    }
    if (!isPlainText(text)) {
      return "Text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (cards.length > MAX_DENTAL_CARDS) {
      return `Maximum ${MAX_DENTAL_CARDS} cards allowed.`;
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardNum = i + 1;

      if (!card.title.trim()) {
        return `Card ${cardNum}: Title is required.`;
      }
      if (!isPlainText(card.title)) {
        return `Card ${cardNum}: Title can only contain letters, numbers, spaces, and basic punctuation.`;
      }

      if (!card.description.trim()) {
        return `Card ${cardNum}: Description is required.`;
      }
      if (!isPlainText(card.description)) {
        return `Card ${cardNum}: Description can only contain letters, numbers, spaces, and basic punctuation.`;
      }
    }

    return "";
  };

  const applySection = (section) => {
    setRecordExists(true);
    setText(section.text || "");
    setHeading(section.heading || "");
    setImage1({ file: null, url: section.image1 || "" });
    setImage2({ file: null, url: section.image2 || "" });
    setCards(
      (section.cards || []).map((card) => ({
        tempId: `card-${card.id}`,
        id: card.id,
        title: card.title || "",
        description: card.description || "",
      }))
    );
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
    formData.append("text", text);
    formData.append("heading", heading);
    formData.append(
      "cards",
      JSON.stringify(cards.map((card) => ({ id: card.id, title: card.title, description: card.description })))
    );

    if (image1.file) {
      formData.append("image1", image1.file);
    }
    if (image2.file) {
      formData.append("image2", image2.file);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createDental(formData)
        : await updateDental(formData);
      applySection(data.section || {});
      setMessage({
        type: "success",
        text: isCreate
          ? "Dental section created successfully."
          : "Dental section updated successfully.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const imageField = (number, label, image) => (
    <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
      <label
        htmlFor={`image${number}`}
        className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
      >
        {label}
      </label>

      {image.url && (
        <div className="rounded-xl border border-brand-100 bg-white p-4">
          <p className="mb-1.5 text-xs font-medium text-ink-500">Uploaded Image:</p>
          <a
            href={resolveMediaUrl(image.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
          >
            View Image
          </a>
        </div>
      )}

      <input
        id={`image${number}`}
        name={`image${number}`}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={(e) => handleImageChange(number, e.target.files[0] || null)}
        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
      />
      {!image.file && image.url && (
        <p className="text-xs text-ink-500">
          Current image will be kept unless you choose a new one.
        </p>
      )}
      {image.file && (
        <p className="text-xs text-ink-500">New image selected: {image.file.name}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            About Us &rarr; Dental Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Dental Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Dental section of the About Us page, including text, heading,
            two images, and up to {MAX_DENTAL_CARDS} cards.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text */}
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
                  placeholder="e.g. OUR DENTAL"
                  className={inputClass}
                />
              </div>

              {/* Heading */}
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
                  value={heading}
                  onChange={(e) => {
                    setMessage({ type: "", text: "" });
                    setHeading(e.target.value);
                  }}
                  placeholder="e.g. Dentistry That Feels Like Home"
                  className={inputClass}
                />
              </div>

              {/* Image 1 */}
              {imageField(1, "Image 1", image1)}

              {/* Image 2 */}
              {imageField(2, "Image 2", image2)}

              {/* Dental Cards */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <div>
                    <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                      Cards
                    </h2>
                    <p className="text-xs text-ink-500">
                      Add, edit, or remove the cards shown in this section.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCard}
                    disabled={cardsFull}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-brand-700 shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    + Add Card
                  </button>
                </div>

                {cardsFull && (
                  <p className="text-xs font-medium text-ink-500">
                    Maximum {MAX_DENTAL_CARDS} cards allowed.
                  </p>
                )}

                {cards.length === 0 && (
                  <p className="py-4 text-center text-sm text-ink-500">
                    No cards added yet. Click &quot;+ Add Card&quot; to create one.
                  </p>
                )}

                {cards.map((card, index) => (
                  <div
                    key={card.tempId}
                    className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                        Card {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(index)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        [ Remove Card ]
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <label
                        htmlFor={`card_title_${card.tempId}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                      >
                        Title
                      </label>
                      <input
                        id={`card_title_${card.tempId}`}
                        type="text"
                        value={card.title}
                        onChange={(e) => handleCardChange(index, "title", e.target.value)}
                        placeholder="e.g. Dental Implants"
                        className={inputClass}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor={`card_desc_${card.tempId}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                      >
                        Description
                      </label>
                      <textarea
                        id={`card_desc_${card.tempId}`}
                        rows="3"
                        value={card.description}
                        onChange={(e) =>
                          handleCardChange(index, "description", e.target.value)
                        }
                        placeholder="e.g. Long lasting tooth replacement that looks and feels natural."
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Toast */}
              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              {/* Save / Update Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save / Update"
                  : "Create Dental Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDentalSection;
