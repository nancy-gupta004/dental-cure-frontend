import { useEffect, useState } from "react";
import {
  getTestimonial,
  createSection,
  updateSection,
  createCard,
  updateCard,
  deleteCard,
} from "../../services/about/testimonialService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";
import StarRating from "../../components/StarRating";

// Ratings are whole numbers only, matching the API validation
const RATINGS = [1, 2, 3, 4, 5];

const EMPTY_CARD = () => ({
  key: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  description: "",
  name: "",
  rating: 5,
  image_url: "",
  imageFile: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

// Cards coming from the API are mapped to the same shape as a brand new card
const toCard = (card) => ({
  key: `card-${card.id}`,
  id: card.id,
  description: card.description || "",
  name: card.name || "",
  rating: Number(card.rating) || 1,
  image_url: card.image || "",
  imageFile: null,
  editing: false,
  saving: false,
  message: { type: "", text: "" },
});

function AdminTestimonialSection() {
  const [section, setSection] = useState({ title: "", heading1: "", heading2: "" });
  const [cards, setCards] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getTestimonial()
      .then((data) => {
        if (data.section) {
          setSectionRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          title: s.title || "",
          heading1: s.heading1 || "",
          heading2: s.heading2 || "",
        });
        setCards((data.cards || []).map(toCard));
      })
      .catch((err) => setSectionMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleSectionChange = (e) => {
    setSectionMessage({ type: "", text: "" });
    setSection({ ...section, [e.target.name]: e.target.value });
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setSectionMessage({ type: "", text: "" });
    setSavingSection(true);
    try {
      const isCreate = !sectionRecordExists;
      const data = isCreate ? await createSection(section) : await updateSection(section);
      setSectionRecordExists(true);
      const saved = data.section || {};
      setSection({
        title: saved.title || "",
        heading1: saved.heading1 || "",
        heading2: saved.heading2 || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Testimonial section created successfully"
          : "Testimonial section updated successfully",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSavingSection(false);
    }
  };

  const addCard = () => setCards((prev) => [...prev, EMPTY_CARD()]);

  const updateCardField = (key, field, value) =>
    setCards((prev) =>
      prev.map((card) => (card.key === key ? { ...card, [field]: value } : card))
    );

  const updateCardImage = (key, file) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key ? { ...card, imageFile: file, message: { type: "", text: "" } } : card
      )
    );

  const startEditing = (key) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key ? { ...card, editing: true, message: { type: "", text: "" } } : card
      )
    );

  const cancelEditing = (key) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, editing: false, imageFile: null, message: { type: "", text: "" } }
          : card
      )
    );

  const handleCardSubmit = async (card) => {
    const rating = Number(card.rating);
    if (!RATINGS.includes(rating)) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? { ...c, message: { type: "error", text: "Rating must be between 1 and 5." } }
            : c
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append("description", card.description);
    formData.append("name", card.name);
    formData.append("rating", rating);
    if (card.imageFile) {
      formData.append("image", card.imageFile);
    }

    setCards((prev) =>
      prev.map((c) =>
        c.key === card.key ? { ...c, saving: true, message: { type: "", text: "" } } : c
      )
    );

    try {
      const data = card.id ? await updateCard(card.id, formData) : await createCard(formData);
      setCards((prev) =>
        prev.map((c) => (c.key === card.key ? { ...toCard(data.card), message: { type: "success", text: "Card saved successfully" } } : c))
      );
    } catch (err) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, saving: false, message: { type: "error", text: err.message } } : c
        )
      );
    }
  };

  const handleCardDelete = async (card) => {
    if (!card.id) {
      setCards((prev) => prev.filter((c) => c.key !== card.key));
      return;
    }
    if (!window.confirm("Delete this card?")) return;

    try {
      await deleteCard(card.id);
      setCards((prev) => prev.filter((c) => c.key !== card.key));
    } catch (err) {
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, message: { type: "error", text: err.message } } : c
        )
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Section-level information */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Testimonial
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title and the two heading lines of the Testimonial section.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSectionSubmit} className="space-y-5">
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
                  value={section.title}
                  onChange={handleSectionChange}
                  placeholder="e.g. Testimonial"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="heading1"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading 1
                </label>
                <input
                  id="heading1"
                  name="heading1"
                  type="text"
                  value={section.heading1}
                  onChange={handleSectionChange}
                  placeholder="e.g. Trusted by Patients, Recommended"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="heading2"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading 2
                </label>
                <input
                  id="heading2"
                  name="heading2"
                  type="text"
                  value={section.heading2}
                  onChange={handleSectionChange}
                  placeholder="e.g. by Families"
                  className={inputClass}
                />
              </div>

              {sectionMessage.text && (
                <p className={getMessageClass(sectionMessage.type)}>{sectionMessage.text}</p>
              )}

              <button
                type="submit"
                disabled={savingSection}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {savingSection
                  ? "Saving..."
                  : sectionRecordExists
                  ? "Save Section"
                  : "Create Testimonial Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Testimonial cards */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Testimonials</h2>
            <button
              type="button"
              onClick={addCard}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
            >
              + Add Card
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8">
          {cards.length === 0 && (
            <p className="text-sm text-ink-500">
              No cards yet. Click "+ Add Card" to create your first testimonial.
            </p>
          )}

          {cards.map((card, index) => (
            <div key={card.key} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Card {index + 1}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                  <span>Rating:</span>
                  <span className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-brand-700">
                    {card.rating} / 5
                  </span>
                </div>
              </div>

              {!card.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Image:</span>
                      {card.image_url ? (
                        <a
                          href={resolveMediaUrl(card.image_url)}
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
                    <div className="flex items-start gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Description:</span>
                      <span>{card.description || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Name:</span>
                      <span>{card.name || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Rating:</span>
                      <StarRating rating={card.rating} />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
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
                      Remove Card
                    </button>
                  </div>

                  {card.message.text && (
                    <p className={getMessageClass(card.message.type)}>{card.message.text}</p>
                  )}
                </>
              ) : (
                <div className="mt-4 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Image
                    </label>

                    {card.image_url && (
                      <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                        <a
                          href={resolveMediaUrl(card.image_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Image
                        </a>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => updateCardImage(card.key, e.target.files[0] || null)}
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!card.imageFile && card.image_url && (
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

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={card.description}
                      onChange={(e) => updateCardField(card.key, "description", e.target.value)}
                      placeholder="e.g. My whole family got their implants here and the care was excellent."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) => updateCardField(card.key, "name", e.target.value)}
                      placeholder="e.g. Neha Sharma"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`rating-${card.key}`}
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                    >
                      Rating
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        id={`rating-${card.key}`}
                        value={card.rating}
                        onChange={(e) =>
                          updateCardField(card.key, "rating", Number(e.target.value))
                        }
                        className={inputClass}
                      >
                        {RATINGS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm font-semibold text-ink-700">/ 5</span>
                    </div>
                    <StarRating rating={card.rating} />
                  </div>

                  {card.message.text && (
                    <p className={getMessageClass(card.message.type)}>{card.message.text}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={card.saving}
                      onClick={() => handleCardSubmit(card)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                    >
                      {card.saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEditing(card.key)}
                      className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Cancel
                    </button>
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

export default AdminTestimonialSection;
