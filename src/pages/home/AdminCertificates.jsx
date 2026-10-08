import { useEffect, useState } from "react";
import {
  getCertificates,
  createSection,
  updateSection,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "../../services/home/certificateService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_CERTIFICATE = () => ({
  key: `certificate-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  title: "",
  country: "",
  level_certificate: "",
  description: "",
  image: "",
  imageFile: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

function AdminCertificates() {
  const [section, setSection] = useState({
    title: "",
    heading: "",
    appointment_heading: "",
    appointment_description: "",
    appointment_button_text: "",
    open_days_label: "",
    open_days_value: "",
    office_hours_label: "",
    office_hours_value: "",
  });
  const [certificates, setCertificates] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [appointmentImageFile, setAppointmentImageFile] = useState(null);
  const [currentAppointmentImage, setCurrentAppointmentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getCertificates()
      .then((data) => {
        if (data.section) {
          setSectionRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          title: s.title || "",
          heading: s.heading || "",
          appointment_heading: s.appointment_heading || "",
          appointment_description: s.appointment_description || "",
          appointment_button_text: s.appointment_button_text || "",
          open_days_label: s.open_days_label || "",
          open_days_value: s.open_days_value || "",
          office_hours_label: s.office_hours_label || "",
          office_hours_value: s.office_hours_value || "",
        });
        setCurrentAppointmentImage(s.appointment_image || "");
        setCertificates(
          (data.certificates || []).map((certificate) => ({
            key: `certificate-${certificate.id}`,
            id: certificate.id,
            title: certificate.title || "",
            country: certificate.country || "",
            level_certificate: certificate.level_certificate || "",
            description: certificate.description || "",
            image: certificate.image || "",
            imageFile: null,
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

  const handleAppointmentImageChange = (e) => {
    setSectionMessage({ type: "", text: "" });
    setAppointmentImageFile(e.target.files[0] || null);
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setSectionMessage({ type: "", text: "" });

    const textFields = [
      { key: "title", label: "Title" },
      { key: "heading", label: "Heading" },
      { key: "appointment_heading", label: "Appointment heading" },
      { key: "appointment_description", label: "Appointment description" },
      { key: "appointment_button_text", label: "Appointment button text" },
      { key: "open_days_label", label: "All Days Open label" },
      { key: "open_days_value", label: "All Days Open value" },
      { key: "office_hours_label", label: "Office Hours label" },
      { key: "office_hours_value", label: "Office Hours value" },
    ];

    for (const field of textFields) {
      if (!isPlainText(section[field.key])) {
        setSectionMessage({
          type: "error",
          text: `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : ). HTML or other special characters are not allowed.`,
        });
        return;
      }
    }

    const formData = new FormData();
    for (const field of textFields) {
      formData.append(field.key, section[field.key]);
    }
    if (appointmentImageFile) {
      formData.append("appointment_image", appointmentImageFile);
    }

    setSavingSection(true);
    try {
      const isCreate = !sectionRecordExists;
      const data = isCreate
        ? await createSection(formData)
        : await updateSection(formData);
      setSectionRecordExists(true);
      const s = data.section || {};
      setSection({
        title: s.title || "",
        heading: s.heading || "",
        appointment_heading: s.appointment_heading || "",
        appointment_description: s.appointment_description || "",
        appointment_button_text: s.appointment_button_text || "",
        open_days_label: s.open_days_label || "",
        open_days_value: s.open_days_value || "",
        office_hours_label: s.office_hours_label || "",
        office_hours_value: s.office_hours_value || "",
      });
      setCurrentAppointmentImage(s.appointment_image || "");
      setAppointmentImageFile(null);
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Certificate section created successfully"
          : "Certificate section updated successfully",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSavingSection(false);
    }
  };

  const addCertificate = () => setCertificates((prev) => [...prev, EMPTY_CERTIFICATE()]);

  const updateCertificateField = (key, field, value) =>
    setCertificates((prev) =>
      prev.map((certificate) =>
        certificate.key === key ? { ...certificate, [field]: value } : certificate
      )
    );

  const updateCertificateImage = (key, file) =>
    setCertificates((prev) =>
      prev.map((certificate) =>
        certificate.key === key
          ? { ...certificate, imageFile: file, message: { type: "", text: "" } }
          : certificate
      )
    );

  const startEditing = (key) =>
    setCertificates((prev) =>
      prev.map((certificate) =>
        certificate.key === key
          ? { ...certificate, editing: true, message: { type: "", text: "" } }
          : certificate
      )
    );

  const cancelEditing = (key) =>
    setCertificates((prev) =>
      prev.map((certificate) =>
        certificate.key === key
          ? { ...certificate, editing: false, imageFile: null, message: { type: "", text: "" } }
          : certificate
      )
    );

  const validateCertificate = (certificate) => {
    const fields = [
      { key: "title", label: "Certificate Title" },
      { key: "country", label: "Country" },
      { key: "level_certificate", label: "Level / Certificate" },
      { key: "description", label: "Description" },
    ];

    for (const field of fields) {
      if (!certificate[field.key].trim()) {
        return `${field.label} is required.`;
      }
      if (!isPlainText(certificate[field.key])) {
        return `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & ). HTML or other special characters are not allowed.`;
      }
    }
    return "";
  };

  const handleCertificateSubmit = async (certificate) => {
    const error = validateCertificate(certificate);
    if (error) {
      setCertificates((prev) =>
        prev.map((c) =>
          c.key === certificate.key ? { ...c, message: { type: "error", text: error } } : c
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", certificate.title);
    formData.append("country", certificate.country);
    formData.append("level_certificate", certificate.level_certificate);
    formData.append("description", certificate.description);
    if (certificate.imageFile) {
      formData.append("image", certificate.imageFile);
    }

    setCertificates((prev) =>
      prev.map((c) =>
        c.key === certificate.key ? { ...c, saving: true, message: { type: "", text: "" } } : c
      )
    );

    try {
      const data = certificate.id
        ? await updateCertificate(certificate.id, formData)
        : await createCertificate(formData);
      const saved = data.certificate;
      setCertificates((prev) =>
        prev.map((c) =>
          c.key === certificate.key
            ? {
                key: `certificate-${saved.id}`,
                id: saved.id,
                title: saved.title || "",
                country: saved.country || "",
                level_certificate: saved.level_certificate || "",
                description: saved.description || "",
                image: saved.image || "",
                imageFile: null,
                editing: false,
                saving: false,
                message: { type: "success", text: "Certificate saved successfully" },
              }
            : c
        )
      );
    } catch (err) {
      setCertificates((prev) =>
        prev.map((c) =>
          c.key === certificate.key
            ? { ...c, saving: false, message: { type: "error", text: err.message } }
            : c
        )
      );
    }
  };

  const handleCertificateDelete = async (certificate) => {
    if (!certificate.id) {
      setCertificates((prev) => prev.filter((c) => c.key !== certificate.key));
      return;
    }
    if (!window.confirm("Delete this certificate?")) return;

    try {
      await deleteCertificate(certificate.id);
      setCertificates((prev) => prev.filter((c) => c.key !== certificate.key));
    } catch (err) {
      setCertificates((prev) =>
        prev.map((c) =>
          c.key === certificate.key
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
            Certificate & Training
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title and heading of the Certificate & Training section.
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
                  placeholder="e.g. Our Certificates"
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
                  placeholder="e.g. Certificate & Training"
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
                  : "Create Certificate Section"}
              </button>
            </form>
          )}
        </div>
      </div>

  

      {/* Certificates */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Certificates
            </h2>
            <button
              type="button"
              onClick={addCertificate}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
            >
              + Add Certificate
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8">
          {certificates.length === 0 && (
            <p className="text-sm text-ink-500">
              No certificates yet. Click "+ Add Certificate" to create your first one.
            </p>
          )}

          {certificates.map((certificate, index) => (
            <div key={certificate.key} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                Certificate {index + 1}
              </p>

              {!certificate.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Image:</span>
                      {certificate.image ? (
                        <a
                          href={resolveMediaUrl(certificate.image)}
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
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Title:</span>
                      <span>{certificate.title || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Country:</span>
                      <span>{certificate.country || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Level:</span>
                      <span>{certificate.level_certificate || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Description:</span>
                      <span>{certificate.description || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(certificate.key)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCertificateDelete(certificate)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>

                  {certificate.message.text && (
                    <p className={getMessageClass(certificate.message.type)}>
                      {certificate.message.text}
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Certificate Image
                    </label>

                    {certificate.image && (
                      <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                        <a
                          href={resolveMediaUrl(certificate.image)}
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
                      accept="image/*"
                      onChange={(e) => updateCertificateImage(certificate.key, e.target.files[0] || null)}
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!certificate.imageFile && certificate.image && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current image will be kept unless you choose a new one.
                      </p>
                    )}
                    {certificate.imageFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New image selected: {certificate.imageFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Certificate Title
                    </label>
                    <input
                      type="text"
                      value={certificate.title}
                      onChange={(e) => updateCertificateField(certificate.key, "title", e.target.value)}
                      placeholder="e.g. DSD Residency - Level 1"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Country
                    </label>
                    <input
                      type="text"
                      value={certificate.country}
                      onChange={(e) => updateCertificateField(certificate.key, "country", e.target.value)}
                      placeholder="e.g. Spain"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Level / Certificate
                    </label>
                    <input
                      type="text"
                      value={certificate.level_certificate}
                      onChange={(e) => updateCertificateField(certificate.key, "level_certificate", e.target.value)}
                      placeholder="e.g. Master-Level Certification"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={certificate.description}
                      onChange={(e) => updateCertificateField(certificate.key, "description", e.target.value)}
                      placeholder="e.g. World class training & certification DSD Residency 1 course in Spain"
                      className={inputClass}
                    />
                  </div>

                  {certificate.message.text && (
                    <p className={getMessageClass(certificate.message.type)}>
                      {certificate.message.text}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={certificate.saving}
                      onClick={() => handleCertificateSubmit(certificate)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                    >
                      {certificate.saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEditing(certificate.key)}
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
            onClick={addCertificate}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Certificate
          </button>
        </div>
      </div>
          {/* Appointment Section */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
            We're Open & Ready to Care
          </h2>
          <p className="mt-1 text-sm text-brand-800">
            Edit the appointment block shown below the certificates on the Home page.
          </p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSectionSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                Appointment Image
              </label>

              {currentAppointmentImage && (
                <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                  <a
                    href={resolveMediaUrl(currentAppointmentImage)}
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
                accept="image/*"
                onChange={handleAppointmentImageChange}
                className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
              />
              {!appointmentImageFile && currentAppointmentImage && (
                <p className="mt-1.5 text-xs text-ink-500">
                  Current image will be kept unless you choose a new one.
                </p>
              )}
              {appointmentImageFile && (
                <p className="mt-1.5 text-xs text-ink-500">
                  New image selected: {appointmentImageFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                Appointment Heading
              </label>
              <input
                type="text"
                name="appointment_heading"
                value={section.appointment_heading}
                onChange={handleSectionChange}
                placeholder="e.g. We're Open & Ready to Care"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                Appointment Description
              </label>
              <textarea
                rows="3"
                name="appointment_description"
                value={section.appointment_description}
                onChange={handleSectionChange}
                placeholder="e.g. Drop by during our working hours or schedule an appointment that fits your day."
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                Appointment Button Text
              </label>
              <input
                type="text"
                name="appointment_button_text"
                value={section.appointment_button_text}
                onChange={handleSectionChange}
                placeholder="e.g. Book an Appointment"
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  All Days Open Label
                </label>
                <input
                  type="text"
                  name="open_days_label"
                  value={section.open_days_label}
                  onChange={handleSectionChange}
                  placeholder="e.g. All Days Open"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  All Days Open Value
                </label>
                <input
                  type="text"
                  name="open_days_value"
                  value={section.open_days_value}
                  onChange={handleSectionChange}
                  placeholder="e.g. Monday to Sunday"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Office Hours Label
                </label>
                <input
                  type="text"
                  name="office_hours_label"
                  value={section.office_hours_label}
                  onChange={handleSectionChange}
                  placeholder="e.g. Office Hours"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                  Office Hours Value
                </label>
                <input
                  type="text"
                  name="office_hours_value"
                  value={section.office_hours_value}
                  onChange={handleSectionChange}
                  placeholder="e.g. 9:00 Am - 7 Pm"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSection}
              className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
            >
              {savingSection
                ? "Saving..."
                : sectionRecordExists
                ? "Save Appointment Section"
                : "Create Appointment Section"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCertificates;