import { useEffect, useState } from "react";
import {
  getPromise,
  createPromise,
  updatePromise,
} from "../../services/about/promiseService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
// Description text allows standard punctuation, quotes, and parentheses
const DESCRIPTION_PATTERN = /^[A-Za-z0-9\s.,!?'"()+&/:%:@._-]+$/;

const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);
const isDescriptionText = (value) =>
  !value.trim() || DESCRIPTION_PATTERN.test(value);

function createEmptyCard() {
  return {
    tempId: Date.now() + Math.random(),
    id: null,
    title_1: "",
    description: "",
    logo: "",
    file: null,
  };
}

function AdminPromiseSection() {
  const [title, setTitle] = useState("");
  const [heading, setHeading] = useState("");
  const [cards, setCards] = useState([]);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPromise()
      .then((data) => {
        const promise = data.promise;
        if (promise) {
          setRecordExists(true);
          setTitle(promise.title || "");
          setHeading(promise.heading || "");
          const loadedCards = (promise.cards || []).map((card) => ({
            tempId: Date.now() + Math.random() + card.id,
            id: card.id,
            title_1: card.title_1 || "",
            description: card.description || "",
            logo: card.logo || "",
            file: null,
          }));
          setCards(loadedCards.length > 0 ? loadedCards : [createEmptyCard()]);
        } else {
          setCards([createEmptyCard()]);
        }
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

  const handleCardFileChange = (index, file) => {
    setMessage({ type: "", text: "" });
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], file };
      return next;
    });
  };

  const handleAddCard = () => {
    setMessage({ type: "", text: "" });
    setCards((prev) => [...prev, createEmptyCard()]);
  };

  const handleRemoveCard = (index) => {
    setMessage({ type: "", text: "" });
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }

    if (!heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardNum = i + 1;

      if (!card.title_1.trim()) {
        return `Card ${cardNum}: Title 1 is required.`;
      }
      if (!isPlainText(card.title_1)) {
        return `Card ${cardNum}: Title 1 can only contain letters, numbers, spaces, and basic punctuation.`;
      }

      if (!card.description.trim()) {
        return `Card ${cardNum}: Description is required.`;
      }
      if (!isDescriptionText(card.description)) {
        return `Card ${cardNum}: Description can only contain letters, numbers, spaces, and basic punctuation.`;
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
    formData.append("title", title);
    formData.append("heading", heading);

    const cardsPayload = cards.map((card, index) => {
      const fileKey = `card_logo_${card.id || card.tempId || index}`;
      if (card.file) {
        formData.append(fileKey, card.file);
      }
      return {
        id: card.id || null,
        title_1: card.title_1,
        description: card.description,
        logo: card.logo,
        fileKey,
      };
    });

    formData.append("cards", JSON.stringify(cardsPayload));

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createPromise(formData)
        : await updatePromise(formData);
      const promise = data.promise || {};
      setRecordExists(true);
      setTitle(promise.title || "");
      setHeading(promise.heading || "");

      const updatedCards = (promise.cards || []).map((card) => ({
        tempId: Date.now() + Math.random() + card.id,
        id: card.id,
        title_1: card.title_1 || "",
        description: card.description || "",
        logo: card.logo || "",
        file: null,
      }));
      setCards(updatedCards.length > 0 ? updatedCards : [createEmptyCard()]);

      setMessage({
        type: "success",
        text: isCreate
          ? "Promise section created successfully."
          : "Promise section updated successfully.",
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
            About Us &rarr; Promise Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Promise Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Promise section of the About Us page, including section
            title, heading, and commitment cards with logos, titles, and
            descriptions.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Title */}
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
                  value={title}
                  onChange={(e) => {
                    setMessage({ type: "", text: "" });
                    setTitle(e.target.value);
                  }}
                  placeholder="e.g. OUR PROMISE"
                  className={inputClass}
                />
              </div>

              {/* Section Heading */}
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
                  placeholder="e.g. Committed to Your Dental Health"
                  className={inputClass}
                />
              </div>

              {/* Promise Cards Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <div>
                    <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                      Promise Cards
                    </h2>
                    <p className="text-xs text-ink-500">
                      Add, edit, or remove cards showcasing your promises and
                      commitments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-800 cursor-pointer shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    Add Card
                  </button>
                </div>

                {cards.length === 0 && (
                  <p className="py-4 text-center text-sm text-ink-500">
                    No cards added yet. Click &quot;+ Add Card&quot; to create one.
                  </p>
                )}
                {cards.map((card, index) => (
                  <div
                    key={card.tempId}
                    className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                        Card {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(index)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        [Remove Card]
                      </button>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Logo
                      </label>

                      {card.logo && (
                        <div className="mb-3 rounded-xl border border-brand-100 bg-white p-3.5">
                          <p className="mb-2 text-xs font-medium text-ink-500">
                            Uploaded Logo:
                          </p>

                          <img
                            src={resolveMediaUrl(card.logo)}
                            alt="Uploaded logo"
                            className="h-20 w-20 rounded-lg object-contain border border-gray-200"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) =>
                          handleCardFileChange(index, e.target.files[0] || null)
                        }
                        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                      />
                      {!card.file && card.logo && (
                        <p className="mt-1 text-xs text-ink-500">
                          Current logo will be kept unless you choose a new one.
                        </p>
                      )}
                      {card.file && (
                        <p className="mt-1 text-xs text-ink-500">
                          New logo selected: {card.file.name}
                        </p>
                      )}
                    </div>

                    {/* Title 1 */}
                    <div>
                      <label
                        htmlFor={`card_title_${card.tempId}`}
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                      >
                        Title 1
                      </label>
                      <input
                        id={`card_title_${card.tempId}`}
                        type="text"
                        value={card.title_1}
                        onChange={(e) =>
                          handleCardChange(index, "title_1", e.target.value)
                        }
                        placeholder="e.g. Transparent Pricing"
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
                        placeholder="e.g. Clear, upfront costs with no hidden fees or unexpected charges."
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                {cards.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="w-full rounded-xl border border-dashed border-brand-300 py-3 text-xs font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer"
                  >
                    + Add Another Card
                  </button>
                )}
              </div>

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
                    : "Create Promise Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPromiseSection;
