import { useEffect, useState } from "react";
import { getContact, updateContact } from "../../services/contact/contactService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&:/-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

function AdminContactUs() {
  const [form, setForm] = useState({
    text: "",
    heading: "",
    description: "",
    text_1: "",
    text_2: "",
    text_3: "",
    text_4: "",
    text_5: "",
    button_text: "",
    button_link: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getContact()
      .then((data) => {
        const contact = data.contact || {};
        setForm({
          text: contact.text || "",
          heading: contact.heading || "",
          description: contact.description || "",
          text_1: contact.text_1 || "",
          text_2: contact.text_2 || "",
          text_3: contact.text_3 || "",
          text_4: contact.text_4 || "",
          text_5: contact.text_5 || "",
          button_text: contact.button_text || "",
          button_link: contact.button_link || "",
        });
        setCurrentImage(contact.image || "");
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setMessage({ type: "", text: "" });
    setImageFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const textFields = [
      { key: "text", label: "Text" },
      { key: "heading", label: "Heading" },
      { key: "description", label: "Description" },
      { key: "text_1", label: "Text 1" },
      { key: "text_2", label: "Text 2" },
      { key: "text_3", label: "Text 3" },
      { key: "text_4", label: "Text 4" },
      { key: "text_5", label: "Text 5" },
      { key: "button_text", label: "Button Text" },
    ];

    for (const field of textFields) {
      if (!isPlainText(form[field.key])) {
        setMessage({
          type: "error",
          text: `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : ). HTML or other special characters are not allowed.`,
        });
        return;
      }
    }

    const formData = new FormData();
    textFields.forEach((field) => formData.append(field.key, form[field.key]));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      const data = await updateContact(formData);
      const contact = data.contact || {};
      setForm({
        text: contact.text || "",
        heading: contact.heading || "",
        description: contact.description || "",
        text_1: contact.text_1 || "",
        text_2: contact.text_2 || "",
        text_3: contact.text_3 || "",
        text_4: contact.text_4 || "",
        text_5: contact.text_5 || "",
        button_text: contact.button_text || "",
        button_link: contact.button_link || "",
      });
      setCurrentImage(contact.image || "");
      setImageFile(null);
      setMessage({ type: "success", text: "Contact Us saved successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Contact Us
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the text, heading, description, image, form labels and button
            of the website Contact Us section.
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
                  value={form.text}
                  onChange={handleChange}
                  placeholder="e.g. Get Appointment"
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
                  value={form.heading}
                  onChange={handleChange}
                  placeholder="e.g. Contact With us!"
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
                  placeholder="e.g. Have questions or need dental care? Our friendly team is here to help you..."
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Image
                </label>

                {currentImage && (
                  <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
                    <img
                      src={resolveMediaUrl(currentImage)}
                      alt="Current"
                      className="h-12 w-14 rounded object-cover"
                    />
                    <a
                      href={resolveMediaUrl(currentImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 underline hover:text-brand-700"
                    >
                      View Current Image
                    </a>
                  </div>
                )}

                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                />
                {!imageFile && currentImage && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    Current image will be kept unless you choose a new one.
                  </p>
                )}
                {imageFile && (
                  <p className="mt-1.5 text-xs text-ink-500">
                    New image selected: {imageFile.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="text_1"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text 1
                </label>
                <input
                  id="text_1"
                  name="text_1"
                  type="text"
                  value={form.text_1}
                  onChange={handleChange}
                  placeholder="e.g. Your Name"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="text_2"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text 2
                </label>
                <input
                  id="text_2"
                  name="text_2"
                  type="text"
                  value={form.text_2}
                  onChange={handleChange}
                  placeholder="e.g. Your Email"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="text_3"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text 3
                </label>
                <input
                  id="text_3"
                  name="text_3"
                  type="text"
                  value={form.text_3}
                  onChange={handleChange}
                  placeholder="e.g. Your Number"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="text_4"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text 4
                </label>
                <input
                  id="text_4"
                  name="text_4"
                  type="text"
                  value={form.text_4}
                  onChange={handleChange}
                  placeholder="e.g. Your Area"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="text_5"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Text 5
                </label>
                <input
                  id="text_5"
                  name="text_5"
                  type="text"
                  value={form.text_5}
                  onChange={handleChange}
                  placeholder="e.g. Message"
                  className={inputClass}
                />
              </div>

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
                  placeholder="e.g. Get Appointment Now"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="button_link"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700"
                >
                  Button Link
                </label>
                <input
                  id="button_link"
                  name="button_link"
                  type="text"
                  value={form.button_link}
                  onChange={handleChange}
                  placeholder="e.g. #appointment"
                  className={inputClass}
                />
              </div>

              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Contact Us"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminContactUs;