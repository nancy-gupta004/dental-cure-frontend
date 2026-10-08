import { useEffect, useState } from "react";
import {
  getQuestion,
  createQuestion,
  updateQuestion,
} from "../../services/about/questionService";
import { inputClass, getMessageClass } from "../../utils/classes";

// A brand new card. `key` identifies the card in the form, `id` is null until
// the card has been saved by the API.
const EMPTY_CARD = () => ({
  key: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  title: "",
  description: "",
});

// Cards coming from the API are mapped to the same shape as a new card
const toCard = (card) => ({
  key: `card-${card.id}`,
  id: card.id,
  title: card.title || "",
  description: card.description || "",
});

function AdminQuestionSection() {
  const [section, setSection] = useState({ text: "", heading: "" });
  const [cards, setCards] = useState([]);
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getQuestion()
      .then((data) => {
        if (data.section) {
          setRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          text: s.text || "",
          heading: s.heading || "",
        });
        setCards((data.cards || []).map(toCard));
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleSectionChange = (e) => {
    setMessage({ type: "", text: "" });
    setSection({ ...section, [e.target.name]: e.target.value });
  };

  const addCard = () => setCards((prev) => [...prev, EMPTY_CARD()]);

  const updateCardField = (key, field, value) => {
    setMessage({ type: "", text: "" });
    setCards((prev) =>
      prev.map((card) => (card.key === key ? { ...card, [field]: value } : card))
    );
  };

  // The card is dropped from the list, so the API deletes it on the next save.
  // A card that was never saved disappears straight away.
  const removeCard = (key) => {
    setMessage({ type: "", text: "" });
    setCards((prev) => prev.filter((card) => card.key !== key));
  };

  // A card without a question or an answer would render as an empty FAQ entry
  const validate = () => {
    for (let i = 0; i < cards.length; i += 1) {
      if (!cards[i].title.trim()) {
        return `Card ${i + 1}: Title (question) is required.`;
      }
      if (!cards[i].description.trim()) {
        return `Card ${i + 1}: Description (answer) is required.`;
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

    const payload = {
      text: section.text,
      heading: section.heading,
      // Saved cards keep their id, new cards send null, and removed cards are
      // simply left out
      cards: cards.map(({ id, title, description }) => ({ id, title, description })),
    };

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createQuestion(payload)
        : await updateQuestion(payload);
      const saved = data.section || {};

      setRecordExists(true);
      setSection({
        text: saved.text || "",
        heading: saved.heading || "",
      });
      setCards((data.cards || []).map(toCard));
      setMessage({
        type: "success",
        text: isCreate
          ? "Question section created successfully"
          : "Question section updated successfully",
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
            Question Asked
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the text and heading of the Question Asked (FAQ) section, and
            manage the questions and answers shown in it.
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
                  placeholder="e.g. FAQ"
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
                  placeholder="e.g. Frequently Asked Questions"
                  className={inputClass}
                />
              </div>

              {/* FAQ cards */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                    FAQ Cards
                  </p>
                  <button
                    type="button"
                    onClick={addCard}
                    className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                  >
                    + Add Card
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  {cards.length === 0 && (
                    <p className="text-sm text-ink-500">
                      No cards yet. Click &quot;+ Add Card&quot; to add your first
                      question.
                    </p>
                  )}

                  {cards.map((card, index) => (
                    <div
                      key={card.key}
                      className="rounded-2xl border border-brand-100 bg-white p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                          Card {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeCard(card.key)}
                          className="rounded-2xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Remove Card
                        </button>
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`card-title-${card.key}`}
                          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                        >
                          Title / Question
                        </label>
                        <input
                          id={`card-title-${card.key}`}
                          type="text"
                          value={card.title}
                          onChange={(e) =>
                            updateCardField(card.key, "title", e.target.value)
                          }
                          placeholder="e.g. How do I book an appointment?"
                          className={inputClass}
                        />
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor={`card-description-${card.key}`}
                          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                        >
                          Description / Answer
                        </label>
                        <textarea
                          id={`card-description-${card.key}`}
                          rows={4}
                          value={card.description}
                          onChange={(e) =>
                            updateCardField(
                              card.key,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="e.g. You can easily book an appointment online, by phone, or during your visit."
                          className={inputClass}
                        />
                      </div>
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
                  : recordExists
                  ? "Save Section"
                  : "Create Question Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminQuestionSection;
