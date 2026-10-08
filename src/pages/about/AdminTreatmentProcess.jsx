import { useEffect, useState } from "react";
import {
  getTreatmentProcess,
  createSection,
  updateSection,
  createCard,
  updateCard,
  deleteCard,
} from "../../services/about/treatmentProcessService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

const EMPTY_CARD = () => ({
  key: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  title_1: "",
  description: "",
  logo_url: "",
  logoFile: null,
  display_order: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

function AdminTreatmentProcess() {
  const [section, setSection] = useState({ text: "", heading: "" });
  const [cards, setCards] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getTreatmentProcess()
      .then((data) => {
        if (data.section) {
          setSectionRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          text: s.text || "",
          heading: s.heading || "",
        });
        setCards(
          (data.cards || []).map((card) => ({
            key: `card-${card.id}`,
            id: card.id,
            title_1: card.title_1 || "",
            description: card.description || "",
            logo_url: card.logo || "",
            logoFile: null,
            display_order: card.display_order,
            editing: false,
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
      const data = isCreate ? await createSection(section) : await updateSection(section);
      setSectionRecordExists(true);
      const saved = data.section || {};
      setSection({
        text: saved.text || "",
        heading: saved.heading || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Treatment Process section created successfully"
          : "Treatment Process section updated successfully",
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

  const updateCardLogo = (key, file) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key ? { ...card, logoFile: file, message: { type: "", text: "" } } : card
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
          ? { ...card, editing: false, logoFile: null, message: { type: "", text: "" } }
          : card
      )
    );

  const handleCardSubmit = async (card) => {
    const formData = new FormData();
    formData.append("title_1", card.title_1);
    formData.append("description", card.description);
    if (card.logoFile) {
      formData.append("logo", card.logoFile);
    }

    setCards((prev) =>
      prev.map((c) =>
        c.key === card.key ? { ...c, saving: true, message: { type: "", text: "" } } : c
      )
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
                description: saved.description || "",
                logo_url: saved.logo || "",
                logoFile: null,
                display_order: saved.display_order,
                editing: false,
                saving: false,
                message: { type: "success", text: "Card saved successfully" },
              }
            : c
        )
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
      // The server renumbers the remaining cards, so reload to pick up the
      // new sequential step numbers.
      getTreatmentProcess()
        .then((data) => {
          setCards(
            (data.cards || []).map((c) => ({
              key: `card-${c.id}`,
              id: c.id,
              title_1: c.title_1 || "",
              description: c.description || "",
              logo_url: c.logo || "",
              logoFile: null,
              display_order: c.display_order,
              editing: false,
              saving: false,
              message: { type: "", text: "" },
            }))
          );
        })
        .catch(() => {});
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
            Treatment Process
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the text and heading of the Treatment Process section.
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
                  Text
                </label>
                <input
                  id="text"
                  name="text"
                  type="text"
                  value={section.text}
                  onChange={handleSectionChange}
                  placeholder="e.g. 5-Steps"
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
                  placeholder="e.g. Our Treatment Process"
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
                  : "Create Treatment Process Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Treatment Process cards */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Cards</h2>
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
              No cards yet. Click "+ Add Card" to create your first step.
            </p>
          )}

          {cards.map((card, index) => (
            <div key={card.key} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Card {card.display_order || index + 1}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                  <span>Number:</span>
                  <span className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-brand-700">
                    {card.display_order || index + 1}
                  </span>
                </div>
              </div>

              {!card.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Logo:</span>
                      {card.logo_url ? (
                        <a
                          href={resolveMediaUrl(card.logo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Image
                        </a>
                      ) : (
                        <span className="text-ink-400">No logo uploaded</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Title 1:</span>
                      <span>{card.title_1 || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Description:</span>
                      <span>{card.description || "-"}</span>
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
                      Logo/Icon
                    </label>

                    {card.logo_url && (
                      <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                        <a
                          href={resolveMediaUrl(card.logo_url)}
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
                      onChange={(e) => updateCardLogo(card.key, e.target.files[0] || null)}
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!card.logoFile && card.logo_url && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current image will be kept unless you choose a new one.
                      </p>
                    )}
                    {card.logoFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New image selected: {card.logoFile.name}
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
                      placeholder="e.g. Initial Consultation"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={card.description}
                      onChange={(e) => updateCardField(card.key, "description", e.target.value)}
                      placeholder="e.g. We examine your teeth and discuss your smile goals."
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

export default AdminTreatmentProcess;
