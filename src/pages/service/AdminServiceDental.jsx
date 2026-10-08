import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getServiceDental,
  createSection,
  updateSection,
  createCard,
  updateCard,
  deleteCard,
} from "../../services/service/dentalService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const READ_ONLY_INPUT_CLASS =
  "w-full cursor-not-allowed rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-500 outline-none transition";

// A brand new card. `key` identifies the card in the form, `id` is null until
// the card has been saved by the API and `slug` stays empty because the
// backend generates it from the heading.
const EMPTY_CARD = () => ({
  key: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  heading: "",
  description: "",
  image_url: "",
  logo_url: "",
  imageFile: null,
  logoFile: null,
  slug: "",
  display_order: null,
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
  image_url: card.image || "",
  logo_url: card.logo || "",
  imageFile: null,
  logoFile: null,
  slug: card.slug || "",
  display_order: card.display_order,
  editing: false,
  saving: false,
  message: { type: "", text: "" },
});

function AdminServiceDental() {
  const navigate = useNavigate();
  const [section, setSection] = useState({
    section_text: "",
    section_heading: "",
    section_description: "",
  });
  const [cards, setCards] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getServiceDental()
      .then((data) => {
        const s = data.section || {};
        if (data.section) {
          setSectionRecordExists(true);
        }
        setSection({
          section_text: s.section_text || "",
          section_heading: s.section_heading || "",
          section_description: s.section_description || "",
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

  const validateSection = () => {
    if (!isPlainText(section.section_text)) {
      return "Text can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(section.section_heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(section.section_description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setSectionMessage({ type: "", text: "" });

    const error = validateSection();
    if (error) {
      setSectionMessage({ type: "error", text: error });
      return;
    }

    setSavingSection(true);
    try {
      const isCreate = !sectionRecordExists;
      const data = isCreate
        ? await createSection(section)
        : await updateSection(section);
      setSectionRecordExists(true);
      const saved = data.section || {};
      setSection({
        section_text: saved.section_text || "",
        section_heading: saved.section_heading || "",
        section_description: saved.section_description || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Service Dental section created successfully"
          : "Service Dental section saved successfully",
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

  const updateCardLogo = (key, file) =>
    setCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, logoFile: file, message: { type: "", text: "" } }
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
              logoFile: null,
              message: { type: "", text: "" },
            }
          : card
      )
    );

  // The heading is required because the backend turns it into the card slug
  const validateCard = (card) => {
    if (!card.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(card.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(card.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const handleCardSubmit = async (card) => {
    const formData = new FormData();
    formData.append("heading", card.heading);
    formData.append("description", card.description);
    if (card.imageFile) {
      formData.append("image", card.imageFile);
    }
    if (card.logoFile) {
      formData.append("logo", card.logoFile);
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
        ? await updateCard(card.id, formData)
        : await createCard(formData);
      setCards((prev) =>
        prev.map((c) => (c.key === card.key ? { ...toCard(data.card), message: { type: "success", text: "Card saved successfully" } } : c))
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
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Section-level information */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Service &rarr; Dental Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Service Dental
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the text, heading and description of the Service Dental section
            shown on the Services page.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSectionSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="section_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text
                </label>
                <input
                  id="section_text"
                  name="section_text"
                  type="text"
                  value={section.section_text}
                  onChange={handleSectionChange}
                  placeholder="e.g. Services"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="section_heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading
                </label>
                <input
                  id="section_heading"
                  name="section_heading"
                  type="text"
                  value={section.section_heading}
                  onChange={handleSectionChange}
                  placeholder="e.g. Our Dental Services"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="section_description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Description
                </label>
                <textarea
                  id="section_description"
                  name="section_description"
                  rows="4"
                  value={section.section_description}
                  onChange={handleSectionChange}
                  placeholder="e.g. Personalized dental treatments designed for healthy, confident, and beautiful smiles."
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
                  : "Create Service Dental Section"}
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
              Service Cards
            </h2>
            <button
              type="button"
              onClick={addCard}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
            >
              + Add Card
            </button>
          </div>
          <p className="mt-2 text-sm text-brand-800">
            Add, edit and remove the dental services listed in this section. The
            URL slug of every card is generated from its heading.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          {cards.length === 0 && (
            <p className="text-sm text-ink-500">
              No cards yet. Click &quot;+ Add Card&quot; to create your first dental
              service.
            </p>
          )}

          {cards.map((card, index) => (
            <div
              key={card.key}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                  Card {card.display_order || index + 1}
                </p>
                {card.slug && (
                  <p className="truncate text-xs text-ink-500">
                    Generated URL slug:{" "}
                    <span className="font-semibold text-brand-700">{card.slug}</span>
                  </p>
                )}
              </div>

              {!card.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Image:
                      </span>
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
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Logo:
                      </span>
                      {card.logo_url ? (
                        <a
                          href={resolveMediaUrl(card.logo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Logo
                        </a>
                      ) : (
                        <span className="text-ink-400">No logo uploaded</span>
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
                        Description:
                      </span>
                      <span>{card.description || "-"}</span>
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
                    {card.id && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/service/dental/${card.id}/details`)
                        }
                        className="flex-1 rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                      >
                        Edit Details
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCardDelete(card)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove Card
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-5">
                  {/* Image */}
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

                  {/* Logo */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Logo
                    </label>

                    {card.logo_url && (
                      <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                        <a
                          href={resolveMediaUrl(card.logo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Current Logo
                        </a>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) =>
                        updateCardLogo(card.key, e.target.files[0] || null)
                      }
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!card.logoFile && card.logo_url && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current logo will be kept unless you choose a new one.
                      </p>
                    )}
                    {card.logoFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New logo selected: {card.logoFile.name}
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
                      placeholder="e.g. Dental Implants"
                      className={inputClass}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description
                    </label>
                    <textarea
                      rows="4"
                      value={card.description}
                      onChange={(e) =>
                        updateCardField(card.key, "description", e.target.value)
                      }
                      placeholder="e.g. A permanent solution used to replace missing teeth with natural-looking artificial teeth."
                      className={inputClass}
                    />
                  </div>

                  {/* Generated slug - read only, generated by the backend */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Generated URL Slug
                    </label>
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      value={card.slug || "Generated from the heading when you save"}
                      className={READ_ONLY_INPUT_CLASS}
                    />
                    <p className="mt-1.5 text-xs text-ink-500">
                      The slug is generated automatically from the heading and
                      cannot be edited here.
                    </p>
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
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
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

export default AdminServiceDental;
