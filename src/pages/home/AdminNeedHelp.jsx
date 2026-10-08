import { useEffect, useState } from "react";
import {
  getNeedHelp,
  createNeedHelp,
  updateNeedHelp,
} from "../../services/home/needHelpService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

const CARD_COUNT = 4;

// Stat headings/descriptions and text values allow characters like % + @ _
const STAT_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:%:@._-]+$/;
const isStatText = (value) => !value.trim() || STAT_TEXT_PATTERN.test(value);

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&:/-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_CARDS = Array.from({ length: CARD_COUNT }, (_, index) => ({
  id: null,
  display_order: index + 1,
  logo: "",
  logoFile: null,
  heading: "",
  description: "",
}));

const EMPTY_BANNER = {
  banner_description: "",
  text_1_name: "",
  text_1_value: "",
  text_2_name: "",
  text_2_value: "",
  button_text: "",
  button_link: "",
};

function AdminNeedHelp() {
  const [cards, setCards] = useState(EMPTY_CARDS);
  const [banner, setBanner] = useState(EMPTY_BANNER);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [currentBannerImage, setCurrentBannerImage] = useState("");
  const [recordExists, setRecordExists] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNeedHelp()
      .then((data) => {
        if (data.section) {
          setRecordExists(true);
        }

        const cardsData = data.data?.cards || [];
        setCards(
          EMPTY_CARDS.map((emptyCard, index) => {
            const existing = cardsData.find(
              (card) => card.display_order === index + 1
            );
            return existing
              ? {
                  id: existing.id,
                  display_order: existing.display_order,
                  logo: existing.logo || "",
                  logoFile: null,
                  heading: existing.heading || "",
                  description: existing.description || "",
                }
              : emptyCard;
          })
        );

        const bannerData = data.data?.banner || {};
        setBanner({
          banner_description: bannerData.description || "",
          text_1_name: bannerData.text_1_name || "",
          text_1_value: bannerData.text_1_value || "",
          text_2_name: bannerData.text_2_name || "",
          text_2_value: bannerData.text_2_value || "",
          button_text: bannerData.button_text || "",
          button_link: bannerData.button_link || "",
        });
        setCurrentBannerImage(bannerData.image || "");
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleBannerChange = (e) => {
    setMessage({ type: "", text: "" });
    setBanner({ ...banner, [e.target.name]: e.target.value });
  };

  const handleCardChange = (index, name, value) => {
    setMessage({ type: "", text: "" });
    setCards(
      cards.map((card, i) => (i === index ? { ...card, [name]: value } : card))
    );
  };

  const handleCardLogoChange = (index, file) => {
    setMessage({ type: "", text: "" });
    setCards(
      cards.map((card, i) =>
        i === index ? { ...card, logoFile: file } : card
      )
    );
  };

  const handleBannerImageChange = (file) => {
    setMessage({ type: "", text: "" });
    setBannerImageFile(file);
  };

  const validate = () => {
    for (let i = 0; i < CARD_COUNT; i++) {
      const card = cards[i];
      if (!isStatText(card.heading)) {
        return `Card ${i + 1} Heading can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ). HTML or other special characters are not allowed.`;
      }
      if (!isStatText(card.description)) {
        return `Card ${i + 1} Description can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ). HTML or other special characters are not allowed.`;
      }
    }

    const textFields = [
      { key: "banner_description", label: "Banner Description" },
      { key: "text_1_name", label: "Text 1 Name" },
      { key: "text_1_value", label: "Text 1 Value" },
      { key: "text_2_name", label: "Text 2 Name" },
      { key: "text_2_value", label: "Text 2 Value" },
      { key: "button_text", label: "Button Text" },
    ];

    for (const field of textFields) {
      if (field.key.endsWith("_value")) {
        if (!isStatText(banner[field.key])) {
          return `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : % @ _ / ). HTML or other special characters are not allowed.`;
        }
      } else if (!isPlainText(banner[field.key])) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : ). HTML or other special characters are not allowed.`;
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
    cards.forEach((card, index) => {
      formData.append(`card_${index + 1}_heading`, card.heading);
      formData.append(`card_${index + 1}_description`, card.description);
      if (card.logoFile) {
        formData.append(`logo_${index + 1}`, card.logoFile);
      }
    });
    Object.entries(banner).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (bannerImageFile) {
      formData.append("banner_image", bannerImageFile);
    }

    setSaving(true);
    try {
      const isCreate = !recordExists;
      const data = isCreate
        ? await createNeedHelp(formData)
        : await updateNeedHelp(formData);
      setRecordExists(true);
      const cardsData = data.data?.cards || [];
      setCards(
        cards.map((card, index) => {
          const saved = cardsData.find(
            (savedCard) => savedCard.display_order === index + 1
          );
          return {
            ...card,
            id: saved ? saved.id : card.id,
            logo: saved ? saved.logo || "" : card.logo,
            logoFile: null,
          };
        })
      );

      const bannerData = data.data?.banner || {};
      setBanner({
        banner_description: bannerData.description || "",
        text_1_name: bannerData.text_1_name || "",
        text_1_value: bannerData.text_1_value || "",
        text_2_name: bannerData.text_2_name || "",
        text_2_value: bannerData.text_2_value || "",
        button_text: bannerData.button_text || "",
        button_link: bannerData.button_link || "",
      });
      setCurrentBannerImage(bannerData.image || "");
      setBannerImageFile(null);
      setMessage({
        type: "success",
        text: isCreate
          ? "Need Help section created successfully"
          : "Need Help section updated successfully",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const renderCardBlock = (card, index) => (
    <div
      key={card.display_order}
      className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
        Card {card.display_order}
      </h3>

      <div>
        <label
          htmlFor={`logo_${card.display_order}`}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
        >
          Logo/Icon
        </label>

        {card.logo && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
            <img
              src={resolveMediaUrl(card.logo)}
              alt={`Card ${card.display_order} Logo`}
              className="h-12 w-14 rounded object-cover"
            />
            <a
              href={resolveMediaUrl(card.logo)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-600 underline hover:text-brand-700"
            >
              View Current Logo
            </a>
          </div>
        )}

        <input
          id={`logo_${card.display_order}`}
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleCardLogoChange(index, e.target.files[0] || null)
          }
          className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
        />
        {!card.logoFile && card.logo && (
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

      <div>
        <label
          htmlFor={`card_${card.display_order}_heading`}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
        >
          Heading
        </label>
        <input
          id={`card_${card.display_order}_heading`}
          name={`card_${card.display_order}_heading`}
          type="text"
          value={card.heading}
          onChange={(e) => handleCardChange(index, "heading", e.target.value)}
          placeholder="e.g. 10,000+"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={`card_${card.display_order}_description`}
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
        >
          Description
        </label>
        <input
          id={`card_${card.display_order}_description`}
          name={`card_${card.display_order}_description`}
          type="text"
          value={card.description}
          onChange={(e) =>
            handleCardChange(index, "description", e.target.value)
          }
          placeholder="e.g. Happy Patients Treated"
          className={inputClass}
        />
      </div>
    </div>
  );

  const renderBannerField = (key, label, placeholder, type = "text") => (
    <div>
      <label
        htmlFor={key}
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
      >
        {label}
      </label>
      <input
        id={key}
        name={key}
        type={type}
        value={banner[key]}
        onChange={handleBannerChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Need Help
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Manage the four statistic cards and the bottom banner of the
            website Need Help section.
          </p>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Statistic Cards
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {cards.map((card, index) => renderCardBlock(card, index))}
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-base font-semibold uppercase tracking-wider text-ink-800">
                  Bottom Banner
                </h2>

                <div className="mt-4 space-y-5">
                  <div>
                    <label
                      htmlFor="banner_image"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                    >
                      Image
                    </label>

                    {currentBannerImage && (
                      <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
                        <img
                          src={resolveMediaUrl(currentBannerImage)}
                          alt="Current Banner"
                          className="h-12 w-14 rounded object-cover"
                        />
                        <a
                          href={resolveMediaUrl(currentBannerImage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-600 underline hover:text-brand-700"
                        >
                          View Current Image
                        </a>
                      </div>
                    )}

                    <input
                      id="banner_image"
                      name="banner_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleBannerImageChange(e.target.files[0] || null)
                      }
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!bannerImageFile && currentBannerImage && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current image will be kept unless you choose a new one.
                      </p>
                    )}
                    {bannerImageFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New image selected: {bannerImageFile.name}
                      </p>
                    )}
                  </div>

                  {renderBannerField(
                    "banner_description",
                    "Description",
                    "e.g. Need Help? Call us / Email Today"
                  )}
                  {renderBannerField(
                    "text_1_name",
                    "Text 1 Name",
                    "e.g. Phone Number"
                  )}
                  {renderBannerField(
                    "text_1_value",
                    "Text 1 Value",
                    "e.g. 91-9870303656"
                  )}
                  {renderBannerField(
                    "text_2_name",
                    "Text 2 Name",
                    "e.g. Email Address"
                  )}
                  {renderBannerField(
                    "text_2_value",
                    "Text 2 Value",
                    "e.g. thedentalcure@gmail.com"
                  )}
                  {renderBannerField(
                    "button_text",
                    "Button Text",
                    "e.g. Book an Appointment"
                  )}
                  {renderBannerField(
                    "button_link",
                    "Button Link",
                    "e.g. /appointment"
                  )}
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
                  ? "Save Need Help"
                  : "Create Need Help Section"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNeedHelp;