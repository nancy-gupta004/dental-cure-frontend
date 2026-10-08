import { useEffect, useState } from "react";
import {
  getDental,
  createSection,
  updateSection,
  createCard,
  updateCard,
  deleteCard,
} from "../../services/home/dentalService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

const EMPTY_CARD = () => ({
  key: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  title_1: "",
  title_2: "",
  icon_image: "",
  iconFile: null,
  saving: false,
  message: { type: "", text: "" },
});

function AdminDentalServices() {
  const [section, setSection] = useState({ title_1: "", heading: "", description: "" });
  const [cards, setCards] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getDental()
      .then((data) => {
        if (data.section) {
          setSectionRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          title_1: s.title_1 || "",
          heading: s.heading || "",
          description: s.description || "",
        });
        setCards(
          (data.cards || []).map((card) => ({
            key: `card-${card.id}`,
            id: card.id,
            title_1: card.title_1 || "",
            title_2: card.title_2 || "",
            icon_image: card.icon_image || "",
            iconFile: null,
            saving: false,
            message: { type: "", text: "" },
          }))
        );
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
      const data = isCreate
        ? await createSection(section)
        : await updateSection(section);
      setSectionRecordExists(true);
      const saved = data.section || {};
      setSection({
        title_1: saved.title_1 || "",
        heading: saved.heading || "",
        description: saved.description || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Dental Services section created successfully"
          : "Dental Services section updated successfully",
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
        card.key === key ? { ...card, iconFile: file, message: { type: "", text: "" } } : card
      )
    );

  const handleCardSubmit = async (card) => {
    const formData = new FormData();
    formData.append("title_1", card.title_1);
    formData.append("title_2", card.title_2);
    if (card.iconFile) {
      formData.append("icon_image", card.iconFile);
    }

    setCards((prev) =>
      prev.map((c) => (c.key === card.key ? { ...c, saving: true, message: { type: "", text: "" } } : c))
    );

    try {
      const data = card.id ? await updateCard(card.id, formData) : await createCard(formData);
      const saved = data.card;
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? {
                key: `card-${saved.id}`,
                id: saved.id,
                title_1: saved.title_1 || "",
                title_2: saved.title_2 || "",
                icon_image: saved.icon_image || "",
                iconFile: null,
                saving: false,
                message: { type: "success", text: "Card saved successfully" },
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
    if (!window.confirm("Delete this service card?")) return;

    try {
      await deleteCard(card.id);
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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Section-level information */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Dental Services
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title, heading and description of the Dental Services section.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSectionSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="title_1"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Title 1
                </label>
                <input
                  id="title_1"
                  name="title_1"
                  type="text"
                  value={section.title_1}
                  onChange={handleSectionChange}
                  placeholder="e.g. Care We Provide"
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
                  placeholder="e.g. Our Specialized Dental Services"
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
                  value={section.description}
                  onChange={handleSectionChange}
                  placeholder="Short description shown under the heading"
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
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {savingSection
                  ? "Saving..."
                  : sectionRecordExists
                  ? "Save Section"
                  : "Create Services Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Service cards */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Dental Service Cards
            </h2>
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
              No cards yet. Click "+ Add Card" to create your first Dental Service.
            </p>
          )}

          {cards.map((card, index) => (
            <div key={card.key} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                Card {index + 1}
              </p>

              <div className="mt-4 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Icon/Image
                  </label>

                  {card.icon_image && (
                    <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                      <a
                        href={resolveMediaUrl(card.icon_image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                      >
                        View Icon
                      </a>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateCardImage(card.key, e.target.files[0] || null)}
                    className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                  />
                  {!card.iconFile && card.icon_image && (
                    <p className="mt-1.5 text-xs text-ink-500">
                      Current icon will be kept unless you choose a new one.
                    </p>
                  )}
                  {card.iconFile && (
                    <p className="mt-1.5 text-xs text-ink-500">
                      New icon selected: {card.iconFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Title 1
                  </label>
                  <input
                    type="text"
                    value={card.title_1}
                    onChange={(e) => updateCardField(card.key, "title_1", e.target.value)}
                    placeholder="e.g. Dental Smile Design"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                    Title 2
                  </label>
                  <input
                    type="text"
                    value={card.title_2}
                    onChange={(e) => updateCardField(card.key, "title_2", e.target.value)}
                    placeholder="e.g. Fast, Reliable Diagnostics At Your Time"
                    className={inputClass}
                  />
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
                    onClick={() => handleCardDelete(card)}
                    className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
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
    </div>
  );
}

export default AdminDentalServices;