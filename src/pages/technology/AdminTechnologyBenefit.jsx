import { useEffect, useState } from "react";
import {
  getTechnologyBenefit,
  createBenefitSection,
  updateBenefitSection,
  createBenefitCard,
  updateBenefitCard,
  reorderBenefitCards,
  deleteBenefitCard,
} from "../../services/technology/technologyBenefitService";
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

// A brand new card. `key` identifies the card in the form, `id` is null until
// the card has been saved by the API.
const EMPTY_CARD = () => ({
  key: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  heading: "",
  description: "",
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

// Cards coming from the API are mapped to the same shape as a new card
const toCard = (card) => ({
  key: `card-${card.id}`,
  id: card.id,
  heading: card.heading || "",
  description: card.description || "",
  editing: false,
  saving: false,
  message: { type: "", text: "" },
});

function AdminTechnologyBenefit() {
  const [form, setForm] = useState({ heading: "" });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [cards, setCards] = useState([]);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTechnologyBenefit()
      .then((data) => {
        const b = data.benefit || {};
        if (data.benefit) {
          setRecordExists(true);
        }
        setForm({ heading: b.heading || "" });
        setCurrentImage(b.image || "");
        setCards((data.benefit?.cards || []).map(toCard));
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

  const validateSection = () => {
    if (!recordExists && !imageFile) {
      return "Image is required.";
    }
    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const applySection = (benefit) => {
    setRecordExists(true);
    setForm({ heading: benefit.heading || "" });
    setCurrentImage(benefit.image || "");
    setImageFile(null);
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const error = validateSection();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    const formData = new FormData();
    formData.append("heading", form.heading);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      // Cards can auto-create the section before it is ever saved, so a create
      // attempt is retried as an update when the row already exists.
      let data;
      if (recordExists) {
        data = await updateBenefitSection(formData);
      } else {
        try {
          data = await createBenefitSection(formData);
        } catch (err) {
          if (err.message === "Technology Benefit section already exists.") {
            data = await updateBenefitSection(formData);
          } else {
            throw err;
          }
        }
      }

      applySection(data.benefit || {});
      setCards((data.benefit?.cards || []).map(toCard));
      setMessage({
        type: "success",
        text: "Technology Benefit section saved successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addCard = () => setCards((prev) => [...prev, EMPTY_CARD()]);

  const updateCardField = (key, field, value) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, [field]: value, message: { type: "", text: "" } }
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
          ? { ...card, editing: false, message: { type: "", text: "" } }
          : card
      )
    );

  const validateCard = (card) => {
    if (!card.heading.trim()) {
      return "Card Heading is required.";
    }
    if (!isPlainText(card.heading)) {
      return "Card Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!stripRichText(card.description)) {
      return "Card Description is required.";
    }
    return "";
  };

  const handleCardSubmit = async (card) => {
    const payload = { heading: card.heading, description: card.description };

    setCards((prev) =>
      prev.map((c) =>
        c.key === card.key
          ? { ...c, saving: true, message: { type: "", text: "" } }
          : c
      )
    );

    try {
      const data = card.id
        ? await updateBenefitCard(card.id, payload)
        : await createBenefitCard(payload);
      setRecordExists(true);
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? {
                ...toCard(data.card),
                message: { type: "success", text: "Benefit card saved successfully" },
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
    if (!card.id) {
      setCards((prev) => prev.filter((c) => c.key !== card.key));
      return;
    }
    if (!window.confirm("Delete this benefit card?")) return;

    try {
      await deleteBenefitCard(card.id);
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

  const moveCard = (index, direction) => {
    const target = index + direction;
    const current = cards[index];
    if (target < 0 || target >= cards.length || !current?.id) return;

    const reordered = [...cards];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setCards(reordered);

    reorderBenefitCards(reordered.map((c) => c.id)).catch((err) =>
      setMessage({ type: "error", text: err.message })
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Section-level information */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Technology &rarr; Benefit Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Technology Benefit Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Benefit section of the Technology page:
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSectionSubmit} className="space-y-5">
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
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Why Choose Our Technology"
                  className={inputClass}
                />
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Image
                  {!recordExists && <span className="ml-1 text-red-500">*</span>}
                </label>

                {currentImage && (
                  <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                    <a
                      href={resolveMediaUrl(currentImage)}
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
                  onChange={handleImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!imageFile && currentImage && (
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

              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60 cursor-pointer"
              >
                {saving
                  ? "Saving..."
                  : recordExists
                  ? "Save Section"
                  : "Create Benefit Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Benefit cards */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Benefit Cards
            </h2>
            <button
              type="button"
              onClick={addCard}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 cursor-pointer"
            >
              + Add Card
            </button>
          </div>
          <p className="mt-2 text-sm text-brand-800">
            Add, edit, reorder and remove the benefit cards displayed.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          {cards.length === 0 && (
            <p className="text-sm text-ink-500">
              No benefit cards yet. Click &quot;+ Add Card&quot; to create your
              first card.
            </p>
          )}

          {cards.map((card, index) => (
            <div
              key={card.key}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Card {index + 1}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveCard(index, -1)}
                    disabled={!card.id || index === 0}
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
                    onClick={() => moveCard(index, 1)}
                    disabled={!card.id || index === cards.length - 1}
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
                    onClick={() => handleCardDelete(card)}
                    title="Remove"
                    className="ml-2 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {!card.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Heading:
                      </span>
                      <span>{card.heading || "-"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Description:
                      </span>
                      {card.description ? (
                        <div
                          className="benefit-description-preview text-sm leading-relaxed text-ink-700 [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5"
                          dangerouslySetInnerHTML={{ __html: card.description }}
                        />
                      ) : (
                        <span className="text-ink-400">-</span>
                      )}
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
                      className={`${PRIMARY_BUTTON_CLASS} flex-1`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCardDelete(card)}
                      className={DANGER_BUTTON_CLASS}
                    >
                      Remove Card
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-5">
                  {/* Heading */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Card Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={card.heading}
                      onChange={(e) =>
                        updateCardField(card.key, "heading", e.target.value)
                      }
                      placeholder="e.g. Faster Treatment Time"
                      className={inputClass}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Card Description <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      content={card.description}
                      onChange={(html) =>
                        updateCardField(card.key, "description", html)
                      }
                    />
                  </div>

                  {card.message.text && (
                    <p className={getMessageClass(card.message.type)}>
                      {card.message.text}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={card.saving}
                      onClick={() => onCardSave(card)}
                      className={`${PRIMARY_BUTTON_CLASS} flex-1`}
                    >
                      {card.saving ? "Saving..." : "Save Card"}
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
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCard}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Card
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTechnologyBenefit;