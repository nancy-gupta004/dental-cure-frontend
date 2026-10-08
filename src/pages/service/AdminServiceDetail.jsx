import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getServiceDetailHeader,
  createServiceDetailHeader,
  updateServiceDetailHeader,
} from "../../services/service/detailHeaderService";
import {
  getServiceDetailTreatment,
  createServiceDetailTreatment,
  updateServiceDetailTreatment,
} from "../../services/service/detailTreatmentService";
import {
  getServiceDetailTreatmentProcess,
  createServiceDetailTreatmentProcess,
  updateServiceDetailTreatmentProcess,
  createTreatmentProcessCard,
  updateTreatmentProcessCard,
  deleteTreatmentProcessCard,
} from "../../services/service/detailTreatmentProcessService";
import {
  getServiceDetailBenefit,
  createServiceDetailBenefit,
  updateServiceDetailBenefit,
} from "../../services/service/detailBenefitService";
import {
  getServiceDetailSmileResults,
  createServiceDetailSmileResults,
  updateServiceDetailSmileResults,
  createSmileResultItem,
  updateSmileResultItem,
  deleteSmileResultItem,
} from "../../services/service/detailSmileResultsService";
import {
  getServiceDetailLocation,
  createServiceDetailLocation,
  updateServiceDetailLocation,
  createLocationCard,
  updateLocationCard,
  deleteLocationCard,
} from "../../services/service/detailLocationService";
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

const READ_ONLY_INPUT_CLASS =
  "w-full cursor-not-allowed rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-500 outline-none transition";

const EMPTY_FORM = {
  title: "",
  heading: "",
  description: "",
  button_text: "",
};

// The treatment section is a second, independent block of the same detail page.
// It reuses the card id, so the form never carries a slug or a service id.
const EMPTY_TREATMENT_FORM = {
  text: "",
  heading: "",
  description_1: "",
  title: "",
  description_2: "",
};

// The treatment process section is a third block of the same detail page and
// also reuses the card id.
const EMPTY_PROCESS_FORM = {
  title: "",
  heading: "",
  description: "",
};

// Process cards carry no number field - the backend assigns the number from the
// card order, so a new card only needs its image, heading and text.
const EMPTY_PROCESS_CARD = () => ({
  key: `process-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  heading: "",
  text: "",
  image_url: "",
  imageFile: null,
  displayOrder: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

// The benefits section is a fourth, independent block of the same detail page
// and also reuses the card id.
const EMPTY_BENEFITS_FORM = {
  heading: "",
  description: "",
  button_text: "",
};

// The smile results section is a fifth, independent block of the same detail
// page and also reuses the card id.
const EMPTY_SMILE_RESULTS_FORM = {
  title: "",
  heading_1: "",
  heading_2: "",
};

// A before/after image pair carries no number field - the backend assigns the
// display order from the pair order, so a new pair only needs its two images.
const EMPTY_SMILE_RESULT_ITEM = () => ({
  key: `smile-result-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  before_url: "",
  beforeFile: null,
  after_url: "",
  afterFile: null,
  displayOrder: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

// The location section is a sixth, independent block of the same detail page and
// also reuses the card id. The map is a Google Maps embed url, never an uploaded
// map image.
const EMPTY_LOCATION_FORM = {
  title: "",
  heading: "",
  description: "",
  map_url: "",
};

// A location card carries no number field - the backend assigns the display order
// from the card order, so a new card only needs its heading, description and an
// optional image.
const EMPTY_LOCATION_CARD = () => ({
  key: `location-card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  heading: "",
  description: "",
  image_url: "",
  imageFile: null,
  displayOrder: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

// Mirrors the backend map check so the admin gets the same message before the
// request is sent. The backend still validates it - this is only a shortcut.
const GOOGLE_MAPS_HOST_PATTERN =
  /^(?:[a-z0-9-]+\.)*google\.[a-z]{2,3}(?:\.[a-z]{2})?$/;

function isGoogleMapsEmbedLink(value) {
  let parsed;

  try {
    parsed = new URL(value.trim());
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  if (!GOOGLE_MAPS_HOST_PATTERN.test(parsed.hostname.toLowerCase())) {
    return false;
  }

  const path = parsed.pathname.toLowerCase();

  if (path === "/maps" || path === "/maps/") {
    return parsed.searchParams.get("output") === "embed";
  }

  return path.startsWith("/maps/embed");
}

function AdminServiceDetail() {
  const { serviceCardId } = useParams();
  const navigate = useNavigate();
  const cardId = Number(serviceCardId);

  const [card, setCard] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [headerExists, setHeaderExists] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [currentBackground, setCurrentBackground] = useState("");
  const [currentLogo, setCurrentLogo] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [rawLoading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [treatmentForm, setTreatmentForm] = useState(EMPTY_TREATMENT_FORM);
  const [treatmentExists, setTreatmentExists] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [treatmentMessage, setTreatmentMessage] = useState({ type: "", text: "" });
  const [rawTreatmentLoading, setTreatmentLoading] = useState(true);
  const [savingTreatment, setSavingTreatment] = useState(false);

  // A malformed card id is shown as an error instead of being requested
  const invalidCardId = !Number.isInteger(cardId) || cardId <= 0;

  useEffect(() => {
    if (invalidCardId) return;

    getServiceDetailHeader(cardId)
      .then((data) => {
        setCard(data.serviceCard || null);
        const header = data.header;

        // No header yet: the form stays empty and the first save creates it
        if (header) {
          setHeaderExists(true);
          setForm({
            title: header.title || "",
            heading: header.heading || "",
            description: header.description || "",
            button_text: header.button_text || "",
          });
          setCurrentBackground(header.background_image || "");
          setCurrentLogo(header.logo || "");
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, [cardId, invalidCardId]);

  const loading = invalidCardId ? false : rawLoading;

  // The treatment section is loaded from its own endpoint, so a card without a
  // treatment still shows the header form and the other way around
  useEffect(() => {
    if (invalidCardId) return;

    getServiceDetailTreatment(cardId)
      .then((data) => {
        if (data.serviceCard) {
          setCard(data.serviceCard);
        }
        const treatment = data.treatment;

        // No treatment yet: the form stays empty and the first save creates it
        if (treatment) {
          setTreatmentExists(true);
          setTreatmentForm({
            text: treatment.text || "",
            heading: treatment.heading || "",
            description_1: treatment.description1 || "",
            title: treatment.title || "",
            description_2: treatment.description2 || "",
          });
          setCurrentImage(treatment.image || "");
        }
      })
      .catch((err) => setTreatmentMessage({ type: "error", text: err.message }))
      .finally(() => setTreatmentLoading(false));
  }, [cardId, invalidCardId]);

  const treatmentLoading = invalidCardId ? false : rawTreatmentLoading;

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBackgroundChange = (e) => {
    setMessage({ type: "", text: "" });
    setBackgroundFile(e.target.files[0] || null);
  };

  const handleLogoChange = (e) => {
    setMessage({ type: "", text: "" });
    setLogoFile(e.target.files[0] || null);
  };

  const handleTreatmentChange = (e) => {
    setTreatmentMessage({ type: "", text: "" });
    setTreatmentForm({ ...treatmentForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setTreatmentMessage({ type: "", text: "" });
    setImageFile(e.target.files[0] || null);
  };

  const validate = () => {
    if (!form.title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(form.title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!form.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(form.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(form.button_text)) {
      return "Button Text can only contain letters, numbers, spaces, and basic punctuation.";
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
    formData.append("title", form.title);
    formData.append("heading", form.heading);
    formData.append("description", form.description);
    formData.append("button_text", form.button_text);
    if (backgroundFile) {
      formData.append("background_image", backgroundFile);
    }
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    setSaving(true);
    try {
      // A header that already exists is always updated, so saving twice can
      // never create a second record for the same card
      const isCreate = !headerExists;
      const data = isCreate
        ? await createServiceDetailHeader(cardId, formData)
        : await updateServiceDetailHeader(cardId, formData);

      const saved = data.header || {};

      setHeaderExists(true);
      setCard(data.serviceCard || card);
      setForm({
        title: saved.title || "",
        heading: saved.heading || "",
        description: saved.description || "",
        button_text: saved.button_text || "",
      });
      setCurrentBackground(saved.background_image || "");
      setCurrentLogo(saved.logo || "");
      setBackgroundFile(null);
      setLogoFile(null);
      setMessage({
        type: "success",
        text: isCreate
          ? "Service Detail Header created successfully"
          : "Service Detail Header saved successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const validateTreatment = () => {
    if (!treatmentForm.text.trim()) {
      return "Text is required.";
    }
    if (!isPlainText(treatmentForm.text)) {
      return "Text can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!treatmentForm.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(treatmentForm.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!stripRichText(treatmentForm.description_1)) {
      return "Description 1 is required.";
    }
    if (!treatmentForm.title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(treatmentForm.title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!stripRichText(treatmentForm.description_2)) {
      return "Description 2 is required.";
    }
    return "";
  };

  const handleTreatmentSubmit = async (e) => {
    e.preventDefault();
    setTreatmentMessage({ type: "", text: "" });

    const error = validateTreatment();
    if (error) {
      setTreatmentMessage({ type: "error", text: error });
      return;
    }

    const formData = new FormData();
    formData.append("text", treatmentForm.text);
    formData.append("heading", treatmentForm.heading);
    formData.append("description_1", treatmentForm.description_1);
    formData.append("title", treatmentForm.title);
    formData.append("description_2", treatmentForm.description_2);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSavingTreatment(true);
    try {
      // A treatment that already exists is always updated, so saving twice can
      // never create a second record for the same card
      const isCreate = !treatmentExists;
      const data = isCreate
        ? await createServiceDetailTreatment(cardId, formData)
        : await updateServiceDetailTreatment(cardId, formData);

      const saved = data.treatment || {};

      setTreatmentExists(true);
      setCard(data.serviceCard || card);
      setTreatmentForm({
        text: saved.text || "",
        heading: saved.heading || "",
        description_1: saved.description1 || "",
        title: saved.title || "",
        description_2: saved.description2 || "",
      });
      setCurrentImage(saved.image || "");
      setImageFile(null);
      setTreatmentMessage({
        type: "success",
        text: isCreate
          ? "Service Detail Treatment created successfully"
          : "Service Detail Treatment saved successfully",
      });
    } catch (err) {
      setTreatmentMessage({ type: "error", text: err.message });
    } finally {
      setSavingTreatment(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Service identity - the card owns the heading and the slug */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            Service &rarr; Detail
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
            Service Detail
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the content of the detail page of this service card.
          </p>
        </div>

        <div className="space-y-5 px-8 py-8">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
              Service
            </label>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              value={card ? card.heading : "Loading..."}
              className={READ_ONLY_INPUT_CLASS}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
              Slug
            </label>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              value={card ? card.slug : "Loading..."}
              className={READ_ONLY_INPUT_CLASS}
            />
            <p className="mt-1.5 text-xs text-ink-500">
              {invalidCardId
                ? "This service card id is not valid."
                : "The slug belongs to the service card and builds the public URL"}
              {card ? (
                <>
                  {" "}
                  <span className="font-semibold text-brand-700">
                    /services/{card.slug}
                  </span>
                </>
              ) : null}
              . It cannot be changed here.
            </p>
          </div>
        </div>
      </div>

      {/* SERVICE DETAIL HEADER */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
            Service Detail Header
          </h2>
          <p className="mt-2 text-sm text-brand-800">
            Background image, logo, title, heading, description and button of the
            detail page.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Background Image */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="background_image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Background Image
                </label>

                {currentBackground && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-ink-500">
                      Uploaded Background Image:
                    </p>
                    <a
                      href={resolveMediaUrl(currentBackground)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Image
                    </a>
                  </div>
                )}

                <input
                  id="background_image"
                  name="background_image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleBackgroundChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!backgroundFile && currentBackground && (
                  <p className="text-xs text-ink-500">
                    Current image will be kept unless you choose a new one.
                  </p>
                )}
                {backgroundFile && (
                  <p className="text-xs text-ink-500">
                    New image selected: {backgroundFile.name}
                  </p>
                )}
              </div>

              {/* Title */}
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
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Implantology"
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
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Restore Your Smile"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Description
                </label>
                <RichTextEditor
                  content={form.description}
                  onChange={(html) => {
                    setMessage({ type: "", text: "" });
                    setForm({ ...form, description: html });
                  }}
                />
              </div>

              {/* Button Text */}
              <div>
                <label
                  htmlFor="button_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Button Text
                </label>
                <input
                  id="button_text"
                  name="button_text"
                  type="text"
                  value={form.button_text}
                  onChange={handleChange}
                  placeholder="e.g. Book Appointment"
                  className={inputClass}
                />
              </div>

              {/* Logo */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="logo"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Logo
                </label>

                {currentLogo && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-ink-500">
                      Uploaded Logo:
                    </p>
                    <a
                      href={resolveMediaUrl(currentLogo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Logo
                    </a>
                  </div>
                )}

                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!logoFile && currentLogo && (
                  <p className="text-xs text-ink-500">
                    Current logo will be kept unless you choose a new one.
                  </p>
                )}
                {logoFile && (
                  <p className="text-xs text-ink-500">
                    New logo selected: {logoFile.name}
                  </p>
                )}
              </div>

              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : headerExists
                    ? "Save Header"
                    : "Create Header"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/service/dental")}
                  className="rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* SERVICE DETAIL TREATMENT */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
            Service Detail Treatment
          </h2>
          <p className="mt-2 text-sm text-brand-800">
            Image, text, heading, descriptions and title of the treatment block
            shown below the header on the detail page.
          </p>
        </div>

        <div className="px-8 py-8">
          {treatmentLoading && (
            <p className="text-sm text-ink-500">Loading...</p>
          )}

          {!treatmentLoading && (
            <form onSubmit={handleTreatmentSubmit} className="space-y-6">
              {/* Image */}
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
                <label
                  htmlFor="treatment_image"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Image
                </label>

                {currentImage && (
                  <div className="rounded-xl border border-brand-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-ink-500">
                      Uploaded Image:
                    </p>
                    <img
                      src={resolveMediaUrl(currentImage)}
                      alt="Uploaded treatment"
                      className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                    />
                    <a
                      href={resolveMediaUrl(currentImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Image
                    </a>
                  </div>
                )}

                <input
                  id="treatment_image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!imageFile && currentImage && (
                  <p className="text-xs text-ink-500">
                    Current image will be kept unless you choose a new one.
                  </p>
                )}
                {imageFile && (
                  <p className="text-xs text-ink-500">
                    New image selected: {imageFile.name}
                  </p>
                )}
              </div>

              {/* Text */}
              <div>
                <label
                  htmlFor="treatment_text"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text
                </label>
                <input
                  id="treatment_text"
                  name="text"
                  type="text"
                  value={treatmentForm.text}
                  onChange={handleTreatmentChange}
                  placeholder="e.g. Treatment"
                  className={inputClass}
                />
              </div>

              {/* Heading */}
              <div>
                <label
                  htmlFor="treatment_heading"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Heading
                </label>
                <input
                  id="treatment_heading"
                  name="heading"
                  type="text"
                  value={treatmentForm.heading}
                  onChange={handleTreatmentChange}
                  placeholder="e.g. Advanced Dental Treatment"
                  className={inputClass}
                />
              </div>

              {/* Description 1 */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Description 1
                </label>
                <RichTextEditor
                  content={treatmentForm.description_1}
                  onChange={(html) => {
                    setTreatmentMessage({ type: "", text: "" });
                    setTreatmentForm({ ...treatmentForm, description_1: html });
                  }}
                />
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="treatment_title"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Title
                </label>
                <input
                  id="treatment_title"
                  name="title"
                  type="text"
                  value={treatmentForm.title}
                  onChange={handleTreatmentChange}
                  placeholder="e.g. Comfortable and Personalized Care"
                  className={inputClass}
                />
              </div>

              {/* Description 2 */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Description 2
                </label>
                <RichTextEditor
                  content={treatmentForm.description_2}
                  onChange={(html) => {
                    setTreatmentMessage({ type: "", text: "" });
                    setTreatmentForm({ ...treatmentForm, description_2: html });
                  }}
                />
              </div>

              {treatmentMessage.text && (
                <p className={getMessageClass(treatmentMessage.type)}>
                  {treatmentMessage.text}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={savingTreatment}
                  className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                >
                  {savingTreatment
                    ? "Saving..."
                    : treatmentExists
                    ? "Save Treatment"
                    : "Create Treatment"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/service/dental")}
                  className="rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* SERVICE DETAIL TREATMENT PROCESS */}
      <AdminTreatmentProcessBlock cardId={cardId} onCardResolved={setCard} />

      {/* SERVICE DETAIL BENEFITS */}
      <AdminBenefitsBlock cardId={cardId} onCardResolved={setCard} />

      {/* SERVICE DETAIL SMILE RESULTS */}
      <AdminSmileResultsBlock cardId={cardId} onCardResolved={setCard} />

      {/* SERVICE DETAIL LOCATION */}
      <AdminLocationBlock cardId={cardId} onCardResolved={setCard} />
    </div>
  );
}

// Treatment Process block of a service detail page. It is loaded from its own
// endpoint, so a card can have a header and a treatment without having a
// treatment process yet. The section itself is saved first; its process cards can
// only be added once the section exists, because a card is always attached to a
// section of the same card.
function AdminTreatmentProcessBlock({ cardId, onCardResolved }) {
  const [processForm, setProcessForm] = useState(EMPTY_PROCESS_FORM);
  const [processExists, setProcessExists] = useState(false);
  const [processId, setProcessId] = useState(null);
  const [processCards, setProcessCards] = useState([]);
  const [processMessage, setProcessMessage] = useState({ type: "", text: "" });
  const [rawProcessLoading, setProcessLoading] = useState(true);
  const [savingProcess, setSavingProcess] = useState(false);

  const invalidCardId = !Number.isInteger(cardId) || cardId <= 0;
  const processLoading = invalidCardId ? false : rawProcessLoading;

  // Re-reads the section so the card numbers always come from the backend
  // instead of being guessed locally after an add or a delete
  const reloadProcessCards = async () => {
    try {
      const data = await getServiceDetailTreatmentProcess(cardId);
      if (data.serviceCard) {
        onCardResolved(data.serviceCard);
      }
      setProcessCards(
        (data.cards || []).map((card) => ({
          key: `process-card-${card.id}`,
          id: card.id,
          heading: card.heading || "",
          text: card.text || "",
          image_url: card.image || "",
          imageFile: null,
          displayOrder: card.displayOrder,
          editing: false,
          saving: false,
          message: { type: "", text: "" },
        }))
      );
    } catch {
      // A failed refresh must not wipe the section, so it is left untouched
    }
  };

  useEffect(() => {
    if (invalidCardId) return;

    getServiceDetailTreatmentProcess(cardId)
      .then((data) => {
        if (data.serviceCard) {
          onCardResolved(data.serviceCard);
        }
        const process = data.treatmentProcess;

        // No section yet: the form stays empty and the first save creates it
        if (process) {
          setProcessExists(true);
          setProcessId(process.id);
          setProcessForm({
            title: process.title || "",
            heading: process.heading || "",
            description: process.description || "",
          });
        }

        setProcessCards(
          (data.cards || []).map((card) => ({
            key: `process-card-${card.id}`,
            id: card.id,
            heading: card.heading || "",
            text: card.text || "",
            image_url: card.image || "",
            imageFile: null,
            displayOrder: card.displayOrder,
            editing: false,
            saving: false,
            message: { type: "", text: "" },
          }))
        );
      })
      .catch((err) => setProcessMessage({ type: "error", text: err.message }))
      .finally(() => setProcessLoading(false));
    // onCardResolved is the parent's state setter and never changes identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, invalidCardId]);

  const handleProcessChange = (e) => {
    setProcessMessage({ type: "", text: "" });
    setProcessForm({ ...processForm, [e.target.name]: e.target.value });
  };

  const validateProcess = () => {
    if (!processForm.title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(processForm.title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!processForm.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(processForm.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!processForm.description.trim()) {
      return "Description is required.";
    }
    if (!isPlainText(processForm.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    setProcessMessage({ type: "", text: "" });

    const error = validateProcess();
    if (error) {
      setProcessMessage({ type: "error", text: error });
      return;
    }

    setSavingProcess(true);
    try {
      // A section that already exists is always updated, so saving twice can
      // never create a second section for the same card
      const isCreate = !processExists;
      const data = isCreate
        ? await createServiceDetailTreatmentProcess(cardId, processForm)
        : await updateServiceDetailTreatmentProcess(cardId, processForm);

      const saved = data.treatmentProcess || {};

      setProcessExists(true);
      setProcessId(saved.id ?? processId);
      setProcessForm({
        title: saved.title || "",
        heading: saved.heading || "",
        description: saved.description || "",
      });
      setProcessCards(
        (data.cards || []).map((card) => ({
          key: `process-card-${card.id}`,
          id: card.id,
          heading: card.heading || "",
          text: card.text || "",
          image_url: card.image || "",
          imageFile: null,
          displayOrder: card.displayOrder,
          editing: false,
          saving: false,
          message: { type: "", text: "" },
        }))
      );
      setProcessMessage({
        type: "success",
        text: isCreate
          ? "Service Detail Treatment Process created successfully"
          : "Service Detail Treatment Process saved successfully",
      });
    } catch (err) {
      setProcessMessage({ type: "error", text: err.message });
    } finally {
      setSavingProcess(false);
    }
  };

  // Cards need a section to belong to, so they can only be added after it exists
  const addProcessCard = () => {
    setProcessCards((prev) => [...prev, EMPTY_PROCESS_CARD()]);
  };

  const updateProcessCardField = (key, field, value) =>
    setProcessCards((prev) =>
      prev.map((card) => (card.key === key ? { ...card, [field]: value } : card))
    );

  const updateProcessCardImage = (key, file) =>
    setProcessCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, imageFile: file, message: { type: "", text: "" } }
          : card
      )
    );

  const startEditingProcessCard = (key) =>
    setProcessCards((prev) =>
      prev.map((card) =>
        card.key === key ? { ...card, editing: true, message: { type: "", text: "" } } : card
      )
    );

  const cancelEditingProcessCard = (key) =>
    setProcessCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, editing: false, imageFile: null, message: { type: "", text: "" } }
          : card
      )
    );

  const validateProcessCard = (card) => {
    if (!card.heading.trim()) {
      return "Card Heading is required.";
    }
    if (!isPlainText(card.heading)) {
      return "Card Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!card.text.trim()) {
      return "Card Text is required.";
    }
    if (!isPlainText(card.text)) {
      return "Card Text can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const handleProcessCardSubmit = async (card) => {
    const error = validateProcessCard(card);
    if (error) {
      setProcessCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, message: { type: "error", text: error } } : c
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append("heading", card.heading);
    formData.append("text", card.text);
    if (card.imageFile) {
      formData.append("image", card.imageFile);
    }

    setProcessCards((prev) =>
      prev.map((c) =>
        c.key === card.key ? { ...c, saving: true, message: { type: "", text: "" } } : c
      )
    );

    try {
      const data = card.id
        ? await updateTreatmentProcessCard(card.id, formData)
        : await createTreatmentProcessCard(processId, formData);

      const saved = data.card || {};

      // The server assigns the process number, so the saved card replaces the
      // draft and shows the number that was actually stored
      setProcessCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? {
                key: `process-card-${saved.id}`,
                id: saved.id,
                heading: saved.heading || "",
                text: saved.text || "",
                image_url: saved.image || "",
                imageFile: null,
                displayOrder: saved.displayOrder,
                editing: false,
                saving: false,
                message: { type: "success", text: "Card saved successfully" },
              }
            : c
        )
      );
    } catch (err) {
      setProcessCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, saving: false, message: { type: "error", text: err.message } } : c
        )
      );
    }
  };

  const handleProcessCardDelete = async (card) => {
    if (!card.id) {
      setProcessCards((prev) => prev.filter((c) => c.key !== card.key));
      return;
    }
    if (!window.confirm("Delete this card?")) return;

    try {
      await deleteTreatmentProcessCard(card.id);
      setProcessCards((prev) => prev.filter((c) => c.key !== card.key));
      // The server renumbers the remaining cards, so reload to pick up the new
      // sequential process numbers.
      await reloadProcessCards();
    } catch (err) {
      setProcessCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, message: { type: "error", text: err.message } } : c
        )
      );
    }
  };

  const addCardButtonClass =
    "rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
      <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
          Service Detail Treatment Process
        </h2>
        <p className="mt-2 text-sm text-brand-800">
          Title, heading and description of the process block shown below the
          treatment on the detail page, plus its numbered process cards.
        </p>
      </div>

      <div className="space-y-8 px-8 py-8">
        {processLoading && <p className="text-sm text-ink-500">Loading...</p>}

        {!processLoading && (
          <form onSubmit={handleProcessSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="process_title"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Title
              </label>
              <input
                id="process_title"
                name="title"
                type="text"
                value={processForm.title}
                onChange={handleProcessChange}
                placeholder="e.g. Saving Your Smile, One Step at a Time."
                className={inputClass}
              />
            </div>

            {/* Heading */}
            <div>
              <label
                htmlFor="process_heading"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Heading
              </label>
              <input
                id="process_heading"
                name="heading"
                type="text"
                value={processForm.heading}
                onChange={handleProcessChange}
                placeholder="e.g. Root Canal Treatment Process"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="process_description"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Description
              </label>
              <textarea
                id="process_description"
                name="description"
                rows={4}
                value={processForm.description}
                onChange={handleProcessChange}
                placeholder="e.g. Root canal treatment is a straightforward procedure..."
                className={inputClass}
              />
            </div>

            {processMessage.text && (
              <p className={getMessageClass(processMessage.type)}>
                {processMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProcess}
              className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
            >
              {savingProcess
                ? "Saving..."
                : processExists
                ? "Save Treatment Process"
                : "Create Treatment Process"}
            </button>
          </form>
        )}

        {/* Process cards */}
        {!processLoading && (
          <div className="space-y-6 border-t border-brand-100 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-brand-900">
                Process Cards
              </h3>
              <button
                type="button"
                onClick={addProcessCard}
                disabled={!processExists}
                className={addCardButtonClass}
              >
                + Add Card
              </button>
            </div>

            {!processExists && (
              <p className="text-sm text-ink-500">
                Save the Treatment Process section first, then you can add its
                process cards.
              </p>
            )}

            {processExists && processCards.length === 0 && (
              <p className="text-sm text-ink-500">
                No process cards yet. Click "+ Add Card" to create the first step.
              </p>
            )}

            {processCards.map((card, index) => {
              // The number is assigned by the backend. For a card that has not
              // been saved yet it is simply the next position in the list.
              const step = card.displayOrder || index + 1;

              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                      Process Card #{step}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                      <span>Number:</span>
                      <span className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-brand-700">
                        {step}
                      </span>
                    </div>
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
                            Heading:
                          </span>
                          <span>{card.heading || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-ink-700">
                          <span className="w-24 shrink-0 font-semibold text-ink-500">
                            Text:
                          </span>
                          <span>{card.text || "-"}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditingProcessCard(card.key)}
                          className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProcessCardDelete(card)}
                          className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>

                      {card.message.text && (
                        <p className={`mt-3 ${getMessageClass(card.message.type)}`}>
                          {card.message.text}
                        </p>
                      )}
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
                            <p className="mb-2 text-xs font-medium text-ink-500">
                              Uploaded Image:
                            </p>
                            <img
                              src={resolveMediaUrl(card.image_url)}
                              alt={card.heading || "Process card"}
                              className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                            />
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
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) =>
                            updateProcessCardImage(card.key, e.target.files[0] || null)
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

                      {/* Heading */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Heading
                        </label>
                        <input
                          type="text"
                          value={card.heading}
                          onChange={(e) =>
                            updateProcessCardField(card.key, "heading", e.target.value)
                          }
                          placeholder="e.g. Meticulous Dental Check up"
                          className={inputClass}
                        />
                      </div>

                      {/* Text */}
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                          Text
                        </label>
                        <textarea
                          rows={4}
                          value={card.text}
                          onChange={(e) =>
                            updateProcessCardField(card.key, "text", e.target.value)
                          }
                          placeholder="e.g. It's Begin with a meticulous dental check-up"
                          className={inputClass}
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
                          onClick={() => handleProcessCardSubmit(card)}
                          className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                        >
                          {card.saving
                            ? "Saving..."
                            : card.id
                            ? "Update Card"
                            : "Save Card"}
                        </button>
                        {card.id && (
                          <button
                            type="button"
                            onClick={() => cancelEditingProcessCard(card.key)}
                            className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {processExists && (
              <button
                type="button"
                onClick={addProcessCard}
                className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                + Add Card
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServiceDetail;

// Benefits block of a service detail page. It is loaded from its own endpoint, so
// a card can have a header, a treatment and a treatment process without having
// benefits yet. The section is saved in place, so saving twice can never create a
// second record for the same card.
function AdminBenefitsBlock({ cardId, onCardResolved }) {
  const [benefitsForm, setBenefitsForm] = useState(EMPTY_BENEFITS_FORM);
  const [benefitsExists, setBenefitsExists] = useState(false);
  const [benefitsImageFile, setBenefitsImageFile] = useState(null);
  const [currentBenefitsImage, setCurrentBenefitsImage] = useState("");
  const [benefitsMessage, setBenefitsMessage] = useState({ type: "", text: "" });
  const [rawBenefitsLoading, setBenefitsLoading] = useState(true);
  const [savingBenefits, setSavingBenefits] = useState(false);

  const invalidCardId = !Number.isInteger(cardId) || cardId <= 0;
  const benefitsLoading = invalidCardId ? false : rawBenefitsLoading;

  useEffect(() => {
    if (invalidCardId) return;

    getServiceDetailBenefit(cardId)
      .then((data) => {
        if (data.serviceCard) {
          onCardResolved(data.serviceCard);
        }
        const benefits = data.benefits;

        // No benefits yet: the form stays empty and the first save creates it
        if (benefits) {
          setBenefitsExists(true);
          setBenefitsForm({
            heading: benefits.heading || "",
            description: benefits.description || "",
            button_text: benefits.buttonText || "",
          });
          setCurrentBenefitsImage(benefits.image || "");
        }
      })
      .catch((err) => setBenefitsMessage({ type: "error", text: err.message }))
      .finally(() => setBenefitsLoading(false));
    // onCardResolved is the parent's state setter and never changes identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, invalidCardId]);

  const handleBenefitsChange = (e) => {
    setBenefitsMessage({ type: "", text: "" });
    setBenefitsForm({ ...benefitsForm, [e.target.name]: e.target.value });
  };

  const handleBenefitsImageChange = (e) => {
    setBenefitsMessage({ type: "", text: "" });
    setBenefitsImageFile(e.target.files[0] || null);
  };

  const validateBenefits = () => {
    if (!benefitsForm.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(benefitsForm.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!benefitsForm.description.trim()) {
      return "Description is required.";
    }
    if (!isPlainText(benefitsForm.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!benefitsForm.button_text.trim()) {
      return "Button Text is required.";
    }
    if (!isPlainText(benefitsForm.button_text)) {
      return "Button Text can only contain letters, numbers, spaces, and basic punctuation.";
    }
    return "";
  };

  const handleBenefitsSubmit = async (e) => {
    e.preventDefault();
    setBenefitsMessage({ type: "", text: "" });

    const error = validateBenefits();
    if (error) {
      setBenefitsMessage({ type: "error", text: error });
      return;
    }

    const formData = new FormData();
    formData.append("heading", benefitsForm.heading);
    formData.append("description", benefitsForm.description);
    formData.append("button_text", benefitsForm.button_text);
    if (benefitsImageFile) {
      formData.append("image", benefitsImageFile);
    }

    setSavingBenefits(true);
    try {
      // A section that already exists is always updated, so saving twice can
      // never create a second section for the same card
      const isCreate = !benefitsExists;
      const data = isCreate
        ? await createServiceDetailBenefit(cardId, formData)
        : await updateServiceDetailBenefit(cardId, formData);

      const saved = data.benefits || {};

      setBenefitsExists(true);
      setBenefitsForm({
        heading: saved.heading || "",
        description: saved.description || "",
        button_text: saved.buttonText || "",
      });
      setCurrentBenefitsImage(saved.image || "");
      setBenefitsImageFile(null);
      setBenefitsMessage({
        type: "success",
        text: isCreate
          ? "Service Detail Benefits created successfully"
          : "Service Detail Benefits saved successfully",
      });
    } catch (err) {
      setBenefitsMessage({ type: "error", text: err.message });
    } finally {
      setSavingBenefits(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
      <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
          Service Detail Benefits
        </h2>
        <p className="mt-2 text-sm text-brand-800">
          Image, heading, description and button text of the benefits block shown
          at the bottom of the detail page.
        </p>
      </div>

      <div className="px-8 py-8">
        {benefitsLoading && <p className="text-sm text-ink-500">Loading...</p>}

        {!benefitsLoading && (
          <form onSubmit={handleBenefitsSubmit} className="space-y-6">
            {/* Image */}
            <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
              <label
                htmlFor="benefits_image"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Image
              </label>

              {currentBenefitsImage && (
                <div className="rounded-xl border border-brand-100 bg-white p-4">
                  <p className="mb-2 text-xs font-medium text-ink-500">
                    Uploaded Image:
                  </p>
                  <img
                    src={resolveMediaUrl(currentBenefitsImage)}
                    alt="Uploaded benefits"
                    className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                  />
                  <a
                    href={resolveMediaUrl(currentBenefitsImage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                  >
                    View Image
                  </a>
                </div>
              )}

              <input
                id="benefits_image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleBenefitsImageChange}
                className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
              />
              {!benefitsImageFile && currentBenefitsImage && (
                <p className="text-xs text-ink-500">
                  Current image will be kept unless you choose a new one.
                </p>
              )}
              {benefitsImageFile && (
                <p className="text-xs text-ink-500">
                  New image selected: {benefitsImageFile.name}
                </p>
              )}
            </div>

            {/* Heading */}
            <div>
              <label
                htmlFor="benefits_heading"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Heading
              </label>
              <textarea
                id="benefits_heading"
                name="heading"
                rows={2}
                value={benefitsForm.heading}
                onChange={handleBenefitsChange}
                placeholder={"e.g. A Healthier Smile\nBegin with us"}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-ink-500">
                Press Enter for a new line, so the heading breaks like the design.
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="benefits_description"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Description
              </label>
              <textarea
                id="benefits_description"
                name="description"
                rows={4}
                value={benefitsForm.description}
                onChange={handleBenefitsChange}
                placeholder="e.g. Take the first step toward healthier teeth and a confident smile..."
                className={inputClass}
              />
            </div>

            {/* Button Text */}
            <div>
              <label
                htmlFor="benefits_button_text"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Button Text
              </label>
              <input
                id="benefits_button_text"
                name="button_text"
                type="text"
                value={benefitsForm.button_text}
                onChange={handleBenefitsChange}
                placeholder="e.g. Schedule Visit"
                className={inputClass}
              />
            </div>

            {benefitsMessage.text && (
              <p className={getMessageClass(benefitsMessage.type)}>
                {benefitsMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingBenefits}
              className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
            >
              {savingBenefits
                ? "Saving..."
                : benefitsExists
                ? "Save Benefits"
                : "Create Benefits"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Smile Results block of a service detail page: the before/after teeth
// transformation pairs shown at the bottom of the public page. It is loaded from
// its own endpoint, so a card can have every other section without having smile
// results yet. The section is saved first; its image pairs can only be added once
// the section exists, because a pair is always attached to a section of the same
// card.
function AdminSmileResultsBlock({ cardId, onCardResolved }) {
  const [smileForm, setSmileForm] = useState(EMPTY_SMILE_RESULTS_FORM);
  const [smileExists, setSmileExists] = useState(false);
  const [smileId, setSmileId] = useState(null);
  const [smileItems, setSmileItems] = useState([]);
  const [smileMessage, setSmileMessage] = useState({ type: "", text: "" });
  const [rawSmileLoading, setSmileLoading] = useState(true);
  const [savingSmile, setSavingSmile] = useState(false);

  const invalidCardId = !Number.isInteger(cardId) || cardId <= 0;
  const smileLoading = invalidCardId ? false : rawSmileLoading;

  // The pairs are always rebuilt from the backend, so the display order is never
  // guessed locally after an add or a delete
  const mapItemsToDrafts = (items) =>
    (items || []).map((item) => ({
      key: `smile-result-item-${item.id}`,
      id: item.id,
      before_url: item.beforeImage || "",
      beforeFile: null,
      after_url: item.afterImage || "",
      afterFile: null,
      displayOrder: item.displayOrder,
      editing: false,
      saving: false,
      message: { type: "", text: "" },
    }));

  // Re-reads the section so the pair order always comes from the backend
  // instead of being guessed locally after an add or a delete
  const reloadSmileItems = async () => {
    try {
      const data = await getServiceDetailSmileResults(cardId);
      if (data.serviceCard) {
        onCardResolved(data.serviceCard);
      }
      setSmileItems(mapItemsToDrafts(data.smileResults ? data.smileResults.items : []));
    } catch {
      // A failed refresh must not wipe the section, so it is left untouched
    }
  };

  useEffect(() => {
    if (invalidCardId) return;

    getServiceDetailSmileResults(cardId)
      .then((data) => {
        if (data.serviceCard) {
          onCardResolved(data.serviceCard);
        }
        const smileResults = data.smileResults;

        // No section yet: the form stays empty and the first save creates it
        if (smileResults) {
          setSmileExists(true);
          setSmileId(smileResults.id);
          setSmileForm({
            title: smileResults.title || "",
            heading_1: smileResults.heading1 || "",
            heading_2: smileResults.heading2 || "",
          });
          setSmileItems(mapItemsToDrafts(smileResults.items));
        }
      })
      .catch((err) => setSmileMessage({ type: "error", text: err.message }))
      .finally(() => setSmileLoading(false));
    // onCardResolved is the parent's state setter and never changes identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, invalidCardId]);

  const handleSmileChange = (e) => {
    setSmileMessage({ type: "", text: "" });
    setSmileForm({ ...smileForm, [e.target.name]: e.target.value });
  };

  const validateSmile = () => {
    const fields = [
      { key: "title", label: "Title" },
      { key: "heading_1", label: "Heading 1" },
      { key: "heading_2", label: "Heading 2" },
    ];

    for (const field of fields) {
      if (!smileForm[field.key].trim()) {
        return `${field.label} is required.`;
      }
      if (!isPlainText(smileForm[field.key])) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation.`;
      }
    }
    return "";
  };

  const handleSmileSubmit = async (e) => {
    e.preventDefault();
    setSmileMessage({ type: "", text: "" });

    const error = validateSmile();
    if (error) {
      setSmileMessage({ type: "error", text: error });
      return;
    }

    setSavingSmile(true);
    try {
      // A section that already exists is always updated, so saving twice can
      // never create a second section for the same card
      const isCreate = !smileExists;
      const data = isCreate
        ? await createServiceDetailSmileResults(cardId, smileForm)
        : await updateServiceDetailSmileResults(cardId, smileForm);

      const saved = data.smileResults || {};

      setSmileExists(true);
      setSmileId(saved.id ?? smileId);
      setSmileForm({
        title: saved.title || "",
        heading_1: saved.heading1 || "",
        heading_2: saved.heading2 || "",
      });
      setSmileMessage({
        type: "success",
        text: isCreate
          ? "Service Detail Smile Results created successfully"
          : "Service Detail Smile Results saved successfully",
      });
    } catch (err) {
      setSmileMessage({ type: "error", text: err.message });
    } finally {
      setSavingSmile(false);
    }
  };

  // Pairs need a section to belong to, so they can only be added after it exists
  const addSmileItem = () => {
    setSmileItems((prev) => [...prev, EMPTY_SMILE_RESULT_ITEM()]);
  };

  const updateSmileItemImage = (key, field, file) =>
    setSmileItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: file, message: { type: "", text: "" } } : item
      )
    );

  const startEditingSmileItem = (key) =>
    setSmileItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, editing: true, message: { type: "", text: "" } } : item
      )
    );

  const cancelEditingSmileItem = (key) =>
    setSmileItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              editing: false,
              beforeFile: null,
              afterFile: null,
              message: { type: "", text: "" },
            }
          : item
      )
    );

  const handleSmileItemSubmit = async (item) => {
    // A new pair needs both images, an existing pair only needs the ones that
    // are being replaced because the rest is kept
    if (!item.beforeFile && !item.before_url) {
      const text = "Before Image is required.";
      setSmileItems((prev) =>
        prev.map((i) => (i.key === item.key ? { ...i, message: { type: "error", text } } : i))
      );
      return;
    }
    if (!item.afterFile && !item.after_url) {
      const text = "After Image is required.";
      setSmileItems((prev) =>
        prev.map((i) => (i.key === item.key ? { ...i, message: { type: "error", text } } : i))
      );
      return;
    }

    const formData = new FormData();
    if (item.beforeFile) {
      formData.append("before_image", item.beforeFile);
    }
    if (item.afterFile) {
      formData.append("after_image", item.afterFile);
    }

    setSmileItems((prev) =>
      prev.map((i) =>
        i.key === item.key ? { ...i, saving: true, message: { type: "", text: "" } } : i
      )
    );

    try {
      // The display order is assigned by the backend, so it is never sent here
      const data = item.id
        ? await updateSmileResultItem(item.id, formData)
        : await createSmileResultItem(smileId, formData);

      const saved = data.item || {};

      // The server assigns the display order, so the saved pair replaces the
      // draft and shows the order that was actually stored
      setSmileItems((prev) =>
        prev.map((i) =>
          i.key === item.key
            ? {
                key: `smile-result-item-${saved.id}`,
                id: saved.id,
                before_url: saved.beforeImage || "",
                beforeFile: null,
                after_url: saved.afterImage || "",
                afterFile: null,
                displayOrder: saved.displayOrder,
                editing: false,
                saving: false,
                message: { type: "success", text: "Image pair saved successfully" },
              }
            : i
        )
      );
    } catch (err) {
      setSmileItems((prev) =>
        prev.map((i) =>
          i.key === item.key ? { ...i, saving: false, message: { type: "error", text: err.message } } : i
        )
      );
    }
  };

  const handleSmileItemDelete = async (item) => {
    if (!item.id) {
      setSmileItems((prev) => prev.filter((i) => i.key !== item.key));
      return;
    }
    if (!window.confirm("Delete this image pair?")) return;

    try {
      await deleteSmileResultItem(item.id);
      setSmileItems((prev) => prev.filter((i) => i.key !== item.key));
      // The server renumbers the remaining pairs, so reload to pick up the new
      // sequential display order.
      await reloadSmileItems();
    } catch (err) {
      setSmileItems((prev) =>
        prev.map((i) =>
          i.key === item.key ? { ...i, message: { type: "error", text: err.message } } : i
        )
      );
    }
  };

  const addPairButtonClass =
    "rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-50";

  // The preview of one uploaded image. The raw Cloudinary url stays behind the
  // "View Image" link instead of being shown as the main admin UI.
  const renderImageUpload = (item, { field, urlKey, label }) => (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
        {label}
      </label>

      {item[urlKey] && (
        <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
          <p className="mb-2 text-xs font-medium text-ink-500">Uploaded Image:</p>
          <img
            src={resolveMediaUrl(item[urlKey])}
            alt={`${label} preview`}
            className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
          />
          <a
            href={resolveMediaUrl(item[urlKey])}
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
        accept="image/jpeg,image/png,image/jpg"
        onChange={(e) => updateSmileItemImage(item.key, field, e.target.files[0] || null)}
        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
      />
      {!item[field] && item[urlKey] && (
        <p className="mt-1.5 text-xs text-ink-500">
          Current image will be kept unless you choose a new one.
        </p>
      )}
      {item[field] && (
        <p className="mt-1.5 text-xs text-ink-500">New image selected: {item[field].name}</p>
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
      <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
          Service Detail Smile Results
        </h2>
        <p className="mt-2 text-sm text-brand-800">
          Title, headings and the before/after image pairs shown at the bottom of
          the detail page. Hovering a picture on the public page reveals its
          after image.
        </p>
      </div>

      <div className="space-y-8 px-8 py-8">
        {smileLoading && <p className="text-sm text-ink-500">Loading...</p>}

        {!smileLoading && (
          <form onSubmit={handleSmileSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="smile_title"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Title
              </label>
              <input
                id="smile_title"
                name="title"
                type="text"
                value={smileForm.title}
                onChange={handleSmileChange}
                placeholder="e.g. Before & After"
                className={inputClass}
              />
            </div>

            {/* Heading 1 */}
            <div>
              <label
                htmlFor="smile_heading_1"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Heading 1
              </label>
              <input
                id="smile_heading_1"
                name="heading_1"
                type="text"
                value={smileForm.heading_1}
                onChange={handleSmileChange}
                placeholder="e.g. Real People. Real Results."
                className={inputClass}
              />
            </div>

            {/* Heading 2 */}
            <div>
              <label
                htmlFor="smile_heading_2"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Heading 2
              </label>
              <input
                id="smile_heading_2"
                name="heading_2"
                type="text"
                value={smileForm.heading_2}
                onChange={handleSmileChange}
                placeholder="e.g. Before and After"
                className={inputClass}
              />
            </div>

            {smileMessage.text && (
              <p className={getMessageClass(smileMessage.type)}>{smileMessage.text}</p>
            )}

            <button
              type="submit"
              disabled={savingSmile}
              className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
            >
              {savingSmile
                ? "Saving..."
                : smileExists
                ? "Save Smile Results"
                : "Create Smile Results"}
            </button>
          </form>
        )}

        {/* Before/After image pairs */}
        {!smileLoading && (
          <div className="space-y-6 border-t border-brand-100 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-brand-900">
                Before &amp; After Images
              </h3>
              <button
                type="button"
                onClick={addSmileItem}
                disabled={!smileExists}
                className={addPairButtonClass}
              >
                + Add Image
              </button>
            </div>

            {!smileExists && (
              <p className="text-sm text-ink-500">
                Save the Smile Results section first, then you can add its
                before/after image pairs.
              </p>
            )}

            {smileExists && smileItems.length === 0 && (
              <p className="text-sm text-ink-500">
                No image pairs yet. Click "+ Add Image" to create the first one.
              </p>
            )}

            {smileItems.map((item, index) => {
              // The order is assigned by the backend. For a pair that has not
              // been saved yet it is simply the next position in the list.
              const pairNumber = item.displayOrder || index + 1;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                      Image Pair #{pairNumber}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                      <span>Order:</span>
                      <span className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-brand-700">
                        {pairNumber}
                      </span>
                    </div>
                  </div>

                  {!item.editing ? (
                    <>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {[
                          { urlKey: "before_url", label: "Before Image" },
                          { urlKey: "after_url", label: "After Image" },
                        ].map(({ urlKey, label }) => (
                          <div key={urlKey}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
                              {label}
                            </p>
                            {item[urlKey] ? (
                              <>
                                <img
                                  src={resolveMediaUrl(item[urlKey])}
                                  alt={`${label} preview`}
                                  className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                                />
                                <a
                                  href={resolveMediaUrl(item[urlKey])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                                >
                                  View Image
                                </a>
                              </>
                            ) : (
                              <p className="text-sm text-ink-400">No image uploaded</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditingSmileItem(item.key)}
                          className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSmileItemDelete(item)}
                          className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>

                      {item.message.text && (
                        <p className={`mt-3 ${getMessageClass(item.message.type)}`}>
                          {item.message.text}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      {renderImageUpload(item, {
                        field: "beforeFile",
                        urlKey: "before_url",
                        label: "Before Image",
                      })}

                      {renderImageUpload(item, {
                        field: "afterFile",
                        urlKey: "after_url",
                        label: "After Image",
                      })}

                      {item.message.text && (
                        <p className={`sm:col-span-2 ${getMessageClass(item.message.type)}`}>
                          {item.message.text}
                        </p>
                      )}

                      <div className="flex gap-3 sm:col-span-2">
                        <button
                          type="button"
                          disabled={item.saving}
                          onClick={() => handleSmileItemSubmit(item)}
                          className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                        >
                          {item.saving ? "Saving..." : item.id ? "Save Pair" : "Save"}
                        </button>
                        {item.id && (
                          <button
                            type="button"
                            onClick={() => cancelEditingSmileItem(item.key)}
                            className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {smileExists && (
              <button
                type="button"
                onClick={addSmileItem}
                className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                + Add Image
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Location block of a service detail page. It is loaded from its own endpoint, so
// a card can have a header, a treatment and a smile results section without
// having a location yet. The section itself is saved first; its location cards can
// only be added once the section exists, because a card is always attached to a
// section of the same card.
function AdminLocationBlock({ cardId, onCardResolved }) {
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION_FORM);
  const [locationExists, setLocationExists] = useState(false);
  const [locationId, setLocationId] = useState(null);
  const [locationCards, setLocationCards] = useState([]);
  const [locationMessage, setLocationMessage] = useState({ type: "", text: "" });
  const [rawLocationLoading, setLocationLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);

  const invalidCardId = !Number.isInteger(cardId) || cardId <= 0;
  const locationLoading = invalidCardId ? false : rawLocationLoading;

  // The cards are always rebuilt from the backend, so the display order is never
  // guessed locally after an add or a delete
  const mapCardsToDrafts = (cards) =>
    (cards || []).map((card) => ({
      key: `location-card-${card.id}`,
      id: card.id,
      heading: card.heading || "",
      description: card.description || "",
      image_url: card.image || "",
      imageFile: null,
      displayOrder: card.displayOrder,
      editing: false,
      saving: false,
      message: { type: "", text: "" },
    }));

  // Re-reads the section so the card order always comes from the backend
  // instead of being guessed locally after an add or a delete
  const reloadLocationCards = async () => {
    try {
      const data = await getServiceDetailLocation(cardId);
      if (data.serviceCard) {
        onCardResolved(data.serviceCard);
      }
      setLocationCards(mapCardsToDrafts(data.location ? data.location.cards : []));
    } catch {
      // A failed refresh must not wipe the section, so it is left untouched
    }
  };

  useEffect(() => {
    if (invalidCardId) return;

    getServiceDetailLocation(cardId)
      .then((data) => {
        if (data.serviceCard) {
          onCardResolved(data.serviceCard);
        }
        const location = data.location;

        // No section yet: the form stays empty and the first save creates it
        if (location) {
          setLocationExists(true);
          setLocationId(location.id);
          setLocationForm({
            title: location.title || "",
            heading: location.heading || "",
            description: location.description || "",
            map_url: location.mapUrl || "",
          });
          setLocationCards(mapCardsToDrafts(location.cards));
        }
      })
      .catch((err) => setLocationMessage({ type: "error", text: err.message }))
      .finally(() => setLocationLoading(false));
    // onCardResolved is the parent's state setter and never changes identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, invalidCardId]);

  const handleLocationChange = (e) => {
    setLocationMessage({ type: "", text: "" });
    setLocationForm({ ...locationForm, [e.target.name]: e.target.value });
  };

  const handleLocationDescriptionChange = (html) => {
    setLocationMessage({ type: "", text: "" });
    setLocationForm({ ...locationForm, description: html });
  };

  const validateLocation = () => {
    const fields = [
      { key: "title", label: "Title" },
      { key: "heading", label: "Heading" },
    ];

    for (const field of fields) {
      if (!locationForm[field.key].trim()) {
        return `${field.label} is required.`;
      }
      if (!isPlainText(locationForm[field.key])) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation.`;
      }
    }

    if (!stripRichText(locationForm.description)) {
      return "Description is required.";
    }

    // The map is optional, but when one is given it has to be a real Google Maps
    // embed link
    if (
      locationForm.map_url.trim() &&
      !isGoogleMapsEmbedLink(locationForm.map_url)
    ) {
      return "Google Maps Embed URL must be a Google Maps embed link, for example https://www.google.com/maps/embed?pb=...";
    }

    return "";
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setLocationMessage({ type: "", text: "" });

    const error = validateLocation();
    if (error) {
      setLocationMessage({ type: "error", text: error });
      return;
    }

    setSavingLocation(true);
    try {
      // A section that already exists is always updated, so saving twice can
      // never create a second section for the same card
      const isCreate = !locationExists;
      const data = isCreate
        ? await createServiceDetailLocation(cardId, locationForm)
        : await updateServiceDetailLocation(cardId, locationForm);

      const saved = data.location || {};

      setLocationExists(true);
      setLocationId(saved.id ?? locationId);
      setLocationForm({
        title: saved.title || "",
        heading: saved.heading || "",
        description: saved.description || "",
        map_url: saved.mapUrl || "",
      });
      setLocationMessage({
        type: "success",
        text: isCreate
          ? "Service Detail Location created successfully"
          : "Service Detail Location saved successfully",
      });
    } catch (err) {
      setLocationMessage({ type: "error", text: err.message });
    } finally {
      setSavingLocation(false);
    }
  };

  // Cards need a section to belong to, so they can only be added after it exists
  const addLocationCard = () => {
    setLocationCards((prev) => [...prev, EMPTY_LOCATION_CARD()]);
  };

  const updateLocationCardField = (key, changes) =>
    setLocationCards((prev) =>
      prev.map((card) =>
        card.key === key
          ? { ...card, ...changes, message: { type: "", text: "" } }
          : card
      )
    );

  const startEditingLocationCard = (key) =>
    updateLocationCardField(key, { editing: true });

  const cancelEditingLocationCard = (key) =>
    updateLocationCardField(key, {
      editing: false,
      imageFile: null,
      message: { type: "", text: "" },
    });

  const validateLocationCard = (card) => {
    if (!card.heading.trim()) {
      return "Heading is required.";
    }
    if (!isPlainText(card.heading)) {
      return "Heading can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!stripRichText(card.description)) {
      return "Description is required.";
    }
    return "";
  };

  const handleLocationCardSubmit = async (card) => {
    const error = validateLocationCard(card);
    if (error) {
      setLocationCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, message: { type: "error", text: error } } : c
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append("heading", card.heading);
    formData.append("description", card.description);
    if (card.imageFile) {
      formData.append("image", card.imageFile);
    }

    setLocationCards((prev) =>
      prev.map((c) =>
        c.key === card.key ? { ...c, saving: true, message: { type: "", text: "" } } : c
      )
    );

    try {
      // The display order is assigned by the backend, so it is never sent here
      const data = card.id
        ? await updateLocationCard(card.id, formData)
        : await createLocationCard(locationId, formData);

      const saved = data.card || {};

      // The server assigns the display order, so the saved card replaces the
      // draft and shows the order that was actually stored
      setLocationCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? {
                key: `location-card-${saved.id}`,
                id: saved.id,
                heading: saved.heading || "",
                description: saved.description || "",
                image_url: saved.image || "",
                imageFile: null,
                displayOrder: saved.displayOrder,
                editing: false,
                saving: false,
                message: { type: "success", text: "Location card saved successfully" },
              }
            : c
        )
      );
    } catch (err) {
      setLocationCards((prev) =>
        prev.map((c) =>
          c.key === card.key
            ? { ...c, saving: false, message: { type: "error", text: err.message } }
            : c
        )
      );
    }
  };

  const handleLocationCardDelete = async (card) => {
    if (!card.id) {
      setLocationCards((prev) => prev.filter((c) => c.key !== card.key));
      return;
    }
    if (!window.confirm("Delete this location card?")) return;

    try {
      await deleteLocationCard(card.id);
      setLocationCards((prev) => prev.filter((c) => c.key !== card.key));
      // The server renumbers the remaining cards, so reload to pick up the new
      // sequential display order.
      await reloadLocationCards();
    } catch (err) {
      setLocationCards((prev) =>
        prev.map((c) =>
          c.key === card.key ? { ...c, message: { type: "error", text: err.message } } : c
        )
      );
    }
  };

  const addCardButtonClass =
    "rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
      <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
          Service Detail Location
        </h2>
        <p className="mt-2 text-sm text-brand-800">
          Where this service is offered: a short introduction, a Google Maps embed
          and the location cards shown as an accordion next to the map. Paste the
          embed link from Google Maps (Share &gt; Embed a map) - no map image and
          no API key is needed.
        </p>
      </div>

      <div className="space-y-8 px-8 py-8">
        {locationLoading && <p className="text-sm text-ink-500">Loading...</p>}

        {!locationLoading && (
          <form onSubmit={handleLocationSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="location_title"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Title
              </label>
              <input
                id="location_title"
                name="title"
                type="text"
                value={locationForm.title}
                onChange={handleLocationChange}
                placeholder="e.g. We Are Offering in Gurgaon"
                className={inputClass}
              />
            </div>

            {/* Heading */}
            <div>
              <label
                htmlFor="location_heading"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Heading
              </label>
              <input
                id="location_heading"
                name="heading"
                type="text"
                value={locationForm.heading}
                onChange={handleLocationChange}
                placeholder="e.g. Types of Root Canal Treatments We Are Offering in Gurgaon"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                Description
              </label>
              <RichTextEditor
                content={locationForm.description}
                onChange={handleLocationDescriptionChange}
              />
            </div>

            {/* Google Maps embed url */}
            <div>
              <label
                htmlFor="location_map_url"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
              >
                Google Maps Embed URL
              </label>
              <input
                id="location_map_url"
                name="map_url"
                type="url"
                value={locationForm.map_url}
                onChange={handleLocationChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-ink-500">
                Optional. Paste only the embed link from Google Maps. The map is
                shown in an iframe on the public page.
              </p>
            </div>

            {locationMessage.text && (
              <p className={getMessageClass(locationMessage.type)}>
                {locationMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingLocation}
              className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
            >
              {savingLocation
                ? "Saving..."
                : locationExists
                ? "Save Location"
                : "Create Location"}
            </button>
          </form>
        )}

        {/* Location cards */}
        {!locationLoading && (
          <div className="space-y-6 border-t border-brand-100 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-brand-900">
                Location Cards
              </h3>
              <button
                type="button"
                onClick={addLocationCard}
                disabled={!locationExists}
                className={addCardButtonClass}
              >
                + Add Card
              </button>
            </div>

            {!locationExists && (
              <p className="text-sm text-ink-500">
                Save the Location section first, then you can add its location
                cards.
              </p>
            )}

            {locationExists && locationCards.length === 0 && (
              <p className="text-sm text-ink-500">
                No location cards yet. Click &quot;+ Add Card&quot; to create the
                first one.
              </p>
            )}

            {locationCards.map((card, index) => {
              // The order is assigned by the backend. For a card that has not
              // been saved yet it is simply the next position in the list.
              const cardNumber = card.displayOrder || index + 1;

              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                      Card #{cardNumber}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                      <span>Order:</span>
                      <span className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 text-brand-700">
                        {cardNumber}
                      </span>
                    </div>
                  </div>

                  {!card.editing ? (
                    <>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
                            Image
                          </p>
                          {card.image_url ? (
                            <>
                              <img
                                src={resolveMediaUrl(card.image_url)}
                                alt={card.heading || "Location card preview"}
                                className="mb-2 h-32 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                              />
                              <a
                                href={resolveMediaUrl(card.image_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                              >
                                View Image
                              </a>
                            </>
                          ) : (
                            <p className="text-sm text-ink-400">No image uploaded</p>
                          )}
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
                            Heading
                          </p>
                          <p className="font-marcellus text-lg tracking-tight text-brand-900">
                            {card.heading || "-"}
                          </p>

                          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink-700">
                            Description
                          </p>
                          <div
                            className="text-sm leading-relaxed text-ink-500 [&_p]:mb-2 [&_p]:last:mb-0"
                            dangerouslySetInnerHTML={{ __html: card.description }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditingLocationCard(card.key)}
                          className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLocationCardDelete(card)}
                          className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>

                      {card.message.text && (
                        <p className={`mt-3 ${getMessageClass(card.message.type)}`}>
                          {card.message.text}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 space-y-5">
                      <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                            Image
                          </label>

                          {card.image_url && (
                            <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                              <p className="mb-2 text-xs font-medium text-ink-500">
                                Uploaded Image:
                              </p>
                              <img
                                src={resolveMediaUrl(card.image_url)}
                                alt={card.heading || "Location card"}
                                className="mb-2 h-40 w-full rounded-xl border border-brand-200 object-cover shadow-sm"
                              />
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
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) =>
                              updateLocationCardField(card.key, {
                                imageFile: e.target.files[0] || null,
                              })
                            }
                            className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                          />
                          {!card.imageFile && card.image_url && (
                            <p className="mt-1.5 text-xs text-ink-500">
                              Current image will be kept unless you choose a new
                              one.
                            </p>
                          )}
                          {card.imageFile && (
                            <p className="mt-1.5 text-xs text-ink-500">
                              New image selected: {card.imageFile.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label
                              htmlFor={`location_card_heading_${card.key}`}
                              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                            >
                              Heading
                            </label>
                            <input
                              id={`location_card_heading_${card.key}`}
                              type="text"
                              value={card.heading}
                              onChange={(e) =>
                                updateLocationCardField(card.key, {
                                  heading: e.target.value,
                                })
                              }
                              placeholder="e.g. Single - Visit Root Canal"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Description
                            </label>
                            <RichTextEditor
                              content={card.description}
                              onChange={(html) =>
                                updateLocationCardField(card.key, {
                                  description: html,
                                })
                              }
                            />
                          </div>
                        </div>
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
                          onClick={() => handleLocationCardSubmit(card)}
                          className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                        >
                          {card.saving ? "Saving..." : card.id ? "Save Card" : "Save"}
                        </button>
                        {card.id && (
                          <button
                            type="button"
                            onClick={() => cancelEditingLocationCard(card.key)}
                            className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {locationExists && (
              <button
                type="button"
                onClick={addLocationCard}
                className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                + Add Card
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
