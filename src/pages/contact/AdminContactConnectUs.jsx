import { useEffect, useState } from "react";
import {
  getContactConnectUs,
  createConnectUs,
  updateConnectUs,
  createConnectUsCard,
  updateConnectUsCard,
  deleteConnectUsCard,
} from "../../services/contact/contactConnectUsService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

// These five labels are shown above the five inputs of the public Contact Us
// form, and that form is the enquiry form, so each one has a fixed role there
const TEXT_FIELDS = [
  { name: "text_1", label: "Text 1", role: "Name", example: "e.g. Your Name" },
  { name: "text_2", label: "Text 2", role: "Area", example: "e.g. Your Area" },
  { name: "text_3", label: "Text 3", role: "Number", example: "e.g. Your Number" },
  { name: "text_4", label: "Text 4", role: "Email", example: "e.g. Your Email" },
  { name: "text_5", label: "Text 5", role: "Message", example: "e.g. Your Message" },
];

const EMPTY_SECTION_FORM = {
  heading: "",
  description: "",
  text_1: "",
  text_2: "",
  text_3: "",
  text_4: "",
  text_5: "",
  button_name: "",
  button_title: "",
};

// A card that has never been saved has no id and gets a temporary key so React
// can keep track of it while the admin types
const toCard = (card) => ({
  key: card.id ? `card-${card.id}` : `new-${Date.now()}-${Math.random()}`,
  id: card.id ?? null,
  title: card.title || "",
  text: card.text || "",
  logoFile: null,
  currentLogo: card.logo || "",
  editing: false,
  saving: false,
  message: { type: "", text: "" },
});

function AdminContactConnectUs() {
  const [form, setForm] = useState(EMPTY_SECTION_FORM);
  const [recordExists, setRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [cardsMessage, setCardsMessage] = useState({ type: "", text: "" });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getContactConnectUs()
      .then((data) => {
        const section = data.section;
        if (section) {
          setRecordExists(true);
          setForm({
            heading: section.heading || "",
            description: section.description || "",
            text_1: section.text_1 || "",
            text_2: section.text_2 || "",
            text_3: section.text_3 || "",
            text_4: section.text_4 || "",
            text_5: section.text_5 || "",
            button_name: section.button_name || "",
            button_title: section.button_title || "",
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
    if (!form.heading.trim()) {
      return "Heading is required.";
    }

    const checks = [
      ["heading", "Heading"],
      ["description", "Description"],
      ["button_name", "Button Name"],
      ["button_title", "Button Title"],
      ...TEXT_FIELDS.map((field) => [field.name, field.label]),
    ];

    for (const [key, label] of checks) {
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
        ? await createConnectUs(form)
        : await updateConnectUs(form);

      // Read the record back, so the cards and the form always show what is
      // actually stored
      const section = data.section || {};
      setRecordExists(true);
      setForm({
        heading: section.heading || "",
        description: section.description || "",
        text_1: section.text_1 || "",
        text_2: section.text_2 || "",
        text_3: section.text_3 || "",
        text_4: section.text_4 || "",
        text_5: section.text_5 || "",
        button_name: section.button_name || "",
        button_title: section.button_title || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Connect Us section created successfully."
          : "Connect Us section updated successfully.",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ----- Cards -----

  const addCard = () => {
    // A card belongs to the section, so the section has to be saved first
    if (!recordExists) {
      setCardsMessage({
        type: "error",
        text: "Save the Connect Us section first, then you can add contact cards.",
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
              logoFile: null,
              message: { type: "", text: "" },
            }
          : card
      )
    );

  const validateCard = (card) => {
    if (!card.title.trim()) {
      return "Card Title is required.";
    }
    if (!isPlainText(card.title)) {
      return "Card Title can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(card.text)) {
      return "Card Text can only contain letters, numbers, spaces, and basic punctuation.";
    }

    return "";
  };

  const handleCardSubmit = async (card) => {
    const formData = new FormData();
    formData.append("title", card.title);
    formData.append("text", card.text);

    // The logo is optional: without a new file the current logo is kept
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
        ? await updateConnectUsCard(card.id, formData)
        : await createConnectUsCard(formData);

      // Saving a card flips it back to read mode
      setCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? {
                ...toCard(data.card),
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
    // A card that was never saved is only removed from the list
    if (!card.id) {
      setCards((prev) => prev.filter((c) => c.key !== card.key));
      return;
    }

    if (!window.confirm("Delete this contact card?")) {
      return;
    }

    try {
      await deleteConnectUsCard(card.id);
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
      {/* ----- Section ----- */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Contact &rarr; Connect Us Section
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Connect Us Section
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the Connect Us section of the Contact Us page: the heading,
            description, five text fields and the button.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="e.g. Connect With Us"
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
                  placeholder="e.g. Have a question about your treatment? Reach out to our team and we will get back to you."
                  className={inputClass}
                />
              </div>

              {TEXT_FIELDS.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                  >
                    {field.label}{" "}
                    <span className="normal-case tracking-normal text-ink-400">
                      ({field.role})
                    </span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.example}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="button_name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Button Name
                </label>
                <input
                  id="button_name"
                  name="button_name"
                  type="text"
                  value={form.button_name}
                  onChange={handleChange}
                  placeholder="e.g. Send a Message"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="button_title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Button Title
                </label>
                <input
                  id="button_title"
                  name="button_title"
                  type="text"
                  value={form.button_title}
                  onChange={handleChange}
                  placeholder="e.g. Book an appointment"
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
                  : "Create Connect Us Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ----- Cards ----- */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="flex justify-between bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Contact &rarr; Connect Us Cards
            </span>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-900">
              Contact Cards
            </h2>
            <p className="mt-2 text-sm text-brand-800">
              Add as many contact cards as you need. Each card has an optional
              logo, a title and a text.
            </p>
          </div>

          <button
            type="button"
            onClick={addCard}
            className="h-fit shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
          >
            + Add Card
          </button>
        </div>

        <div className="space-y-6 px-8 py-8">
          {!recordExists && (
            <p className="text-xs text-ink-500">
              Save the Connect Us section first, then you can add contact cards.
            </p>
          )}

          {cardsMessage.text && (
            <p className={getMessageClass(cardsMessage.type)}>
              {cardsMessage.text}
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
              </div>

              {!card.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Logo:
                      </span>
                      {card.currentLogo ? (
                        <a
                          href={resolveMediaUrl(card.currentLogo)}
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
                        Title:
                      </span>
                      <span>{card.title || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">
                        Text:
                      </span>
                      <span>{card.text || "-"}</span>
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
                      Remove Card
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4 space-y-5">
                    {/* Logo */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Logo
                      </label>
                      {card.currentLogo && (
                        <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                          <a
                            href={resolveMediaUrl(card.currentLogo)}
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
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) =>
                          updateCardLogo(card.key, e.target.files[0] || null)
                        }
                        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                      />
                      {!card.logoFile && card.currentLogo && (
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

                    {/* Title */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Title
                      </label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) =>
                          updateCardField(card.key, "title", e.target.value)
                        }
                        placeholder="e.g. Phone"
                        className={inputClass}
                      />
                    </div>

                    {/* Text */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                        Text
                      </label>
                      <textarea
                        rows="4"
                        value={card.text}
                        onChange={(e) =>
                          updateCardField(card.key, "text", e.target.value)
                        }
                        placeholder="e.g. +91 98765 43210"
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
                </>
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

export default AdminContactConnectUs;
