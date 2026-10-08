import { useEffect, useState } from "react";
import {
  getTreatments,
  createSection,
  updateSection,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} from "../../services/home/treatmentService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

const EMPTY_TREATMENT = () => ({
  key: `treatment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  title: "",
  description: "",
  button_link: "",
  image: "",
  imageFile: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

function AdminDentalTreatments() {
  const [section, setSection] = useState({ title: "", heading: "" });
  const [treatments, setTreatments] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  // Fetch initial data from database on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getTreatments();
      if (data.section || data.data) {
        setSectionRecordExists(true);
      }

      const s = data.section || data.data || {};
      setSection({
        title: s.title || "",
        heading: s.heading || "",
      });
      const items = data.treatments || s.treatments || [];
      setTreatments(
        items.map((t) => ({
          key: `treatment-${t.id}`,
          id: t.id,
          title: t.title || "",
          description: t.description || "",
          button_link: t.button_link || "",
          image: t.image || "",
          imageFile: null,
          editing: false,
          saving: false,
          message: { type: "", text: "" },
        }))
      );
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

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
      const savedSection = data.section || data.data || {};
      setSection({
        title: savedSection.title || "",
        heading: savedSection.heading || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Dental Treatment section created successfully"
          : "Dental Treatment section updated successfully",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSavingSection(false);
    }
  };

  const addTreatment = () => {
    setTreatments((prev) => [...prev, EMPTY_TREATMENT()]);
  };

  const updateTreatmentField = (key, field, value) => {
    setTreatments((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );
  };

  const updateTreatmentImage = (key, file) => {
    setTreatments((prev) =>
      prev.map((t) =>
        t.key === key
          ? { ...t, imageFile: file, message: { type: "", text: "" } }
          : t
      )
    );
  };

  const startEditing = (key) => {
    setTreatments((prev) =>
      prev.map((t) =>
        t.key === key
          ? { ...t, editing: true, message: { type: "", text: "" } }
          : t
      )
    );
  };

  const cancelEditing = (key) => {
    setTreatments((prev) =>
      prev.map((t) =>
        t.key === key
          ? {
              ...t,
              editing: false,
              imageFile: null,
              message: { type: "", text: "" },
            }
          : t
      )
    );
  };

  const handleTreatmentSubmit = async (treatment) => {
    const formData = new FormData();
    formData.append("title", treatment.title);
    formData.append("title_1", treatment.title);
    formData.append("description", treatment.description);
    formData.append("button_link", treatment.button_link || "");
    if (treatment.imageFile) {
      formData.append("image", treatment.imageFile);
    }

    setTreatments((prev) =>
      prev.map((t) =>
        t.key === treatment.key
          ? { ...t, saving: true, message: { type: "", text: "" } }
          : t
      )
    );

    try {
      const data = treatment.id
        ? await updateTreatment(treatment.id, formData)
        : await createTreatment(formData);
      const saved = data.treatment || data.card || {};
      setTreatments((prev) =>
        prev.map((t) =>
          t.key === treatment.key
            ? {
                key: `treatment-${saved.id}`,
                id: saved.id,
                title: saved.title || "",
                description: saved.description || "",
                button_link: saved.button_link || "",
                image: saved.image || "",
                imageFile: null,
                editing: false,
                saving: false,
                message: {
                  type: "success",
                  text: "Treatment saved successfully",
                },
              }
            : t
        )
      );
    } catch (err) {
      setTreatments((prev) =>
        prev.map((t) =>
          t.key === treatment.key
            ? {
                ...t,
                saving: false,
                message: { type: "error", text: err.message },
              }
            : t
        )
      );
    }
  };

  const handleTreatmentDelete = async (treatment) => {
    if (!treatment.id) {
      setTreatments((prev) => prev.filter((t) => t.key !== treatment.key));
      return;
    }
    if (!window.confirm("Delete this treatment item?")) return;

    try {
      await deleteTreatment(treatment.id);
      setTreatments((prev) => prev.filter((t) => t.key !== treatment.key));
    } catch (err) {
      setTreatments((prev) =>
        prev.map((t) =>
          t.key === treatment.key
            ? { ...t, message: { type: "error", text: err.message } }
            : t
        )
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-12">
      {/* SECTION SETTINGS */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Dental Treatment
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title and heading of the Dental Treatment section.
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
                  placeholder="e.g. Our Top Dental Treatment"
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
                <textarea
                  id="heading"
                  name="heading"
                  rows="3"
                  value={section.heading}
                  onChange={handleSectionChange}
                  placeholder="e.g. Comprehensive smile solutions tailored in India"
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
                  ? "Save"
                  : "Create Treatment Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* TREATMENTS LIST */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Treatments
            </h2>
            <button
              type="button"
              onClick={addTreatment}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
            >
              + Add Treatment
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8">
          {treatments.length === 0 && (
            <p className="text-sm text-ink-500">
              No treatments yet. Click "+ Add Treatment" to create your first item.
            </p>
          )}

          {treatments.map((treatment, index) => (
            <div
              key={treatment.key}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                Treatment {index + 1}
              </p>

              {!treatment.editing ? (
                /* VIEW MODE */
                <>
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Image:
                      </span>
                      {treatment.image ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveMediaUrl(treatment.image)}
                            alt={treatment.title || "Treatment"}
                            className="h-10 w-12 rounded object-cover border border-brand-200"
                          />
                          <a
                            href={resolveMediaUrl(treatment.image)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand-600 underline hover:text-brand-700"
                          >
                            View Image
                          </a>
                        </div>
                      ) : (
                        <span className="text-ink-400">No image uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Title 1:
                      </span>
                      <span className="font-medium">
                        {treatment.title || "-"}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Description:
                      </span>
                      <span className="flex-1 text-ink-600">
                        {treatment.description || "-"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Button Link:
                      </span>
                      <span className="text-brand-600 underline">
                        {treatment.button_link || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(treatment.key)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTreatmentDelete(treatment)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>

                  {treatment.message.text && (
                    <p
                      className={`mt-3 ${getMessageClass(
                        treatment.message.type
                      )}`}
                    >
                      {treatment.message.text}
                    </p>
                  )}
                </>
              ) : (
                /* EDIT MODE */
                <div className="mt-4 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Image
                    </label>

                    {treatment.image && (
                      <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
                        <img
                          src={resolveMediaUrl(treatment.image)}
                          alt="Current"
                          className="h-12 w-14 rounded object-cover"
                        />
                        <a
                          href={resolveMediaUrl(treatment.image)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Current Image
                        </a>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        updateTreatmentImage(
                          treatment.key,
                          e.target.files[0] || null
                        )
                      }
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!treatment.imageFile && treatment.image && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current image will be kept unless you choose a new one.
                      </p>
                    )}
                    {treatment.imageFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New image selected: {treatment.imageFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Title 1
                    </label>
                    <input
                      type="text"
                      value={treatment.title}
                      onChange={(e) =>
                        updateTreatmentField(
                          treatment.key,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Hollywood Smile"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={treatment.description}
                      onChange={(e) =>
                        updateTreatmentField(
                          treatment.key,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Personalized smile makeover and design treatments..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={treatment.button_link}
                      onChange={(e) =>
                        updateTreatmentField(
                          treatment.key,
                          "button_link",
                          e.target.value
                        )
                      }
                      placeholder="e.g. https://example.com/hollywood-smile or /hollywood-smile"
                      className={inputClass}
                    />
                  </div>

                  {treatment.message.text && (
                    <p className={getMessageClass(treatment.message.type)}>
                      {treatment.message.text}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      disabled={treatment.saving}
                      onClick={() => handleTreatmentSubmit(treatment)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                    >
                      {treatment.saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEditing(treatment.key)}
                      className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTreatmentDelete(treatment)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTreatment}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Treatment
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDentalTreatments;
