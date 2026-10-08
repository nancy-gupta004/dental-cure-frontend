import { useEffect, useState } from "react";
import {
  getTeams,
  createSection,
  updateSection,
  createMember,
  updateMember,
  deleteMember,
} from "../../services/home/teamService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

const EMPTY_MEMBER = () => ({
  key: `member-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  name: "",
  designation: "",
  image_url: "",
  imageFile: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

function AdminTeams() {
  const [section, setSection] = useState({ title_1: "", heading: "", button_text: "", button_link: "" });
  const [members, setMembers] = useState([]);
  const [sectionRecordExists, setSectionRecordExists] = useState(false);
  const [sectionMessage, setSectionMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);

  useEffect(() => {
    getTeams()
      .then((data) => {
        if (data.section) {
          setSectionRecordExists(true);
        }

        const s = data.section || {};
        setSection({
          title_1: s.title_1 || "",
          heading: s.heading || "",
          button_text: s.button_text || "",
          button_link: s.button_link || "",
        });
        setMembers(
          (data.members || []).map((member) => ({
            key: `member-${member.id}`,
            id: member.id,
            name: member.name || "",
            designation: member.designation || "",
            image_url: member.image_url || "",
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
        button_text: saved.button_text || "",
        button_link: saved.button_link || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Teams section created successfully"
          : "Teams section updated successfully",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSavingSection(false);
    }
  };

  const addMember = () => setMembers((prev) => [...prev, EMPTY_MEMBER()]);

  const updateMemberField = (key, field, value) =>
    setMembers((prev) =>
      prev.map((member) => (member.key === key ? { ...member, [field]: value } : member))
    );

  const updateMemberImage = (key, file) =>
    setMembers((prev) =>
      prev.map((member) =>
        member.key === key ? { ...member, imageFile: file, message: { type: "", text: "" } } : member
      )
    );

  const startEditing = (key) =>
    setMembers((prev) =>
      prev.map((member) =>
        member.key === key ? { ...member, editing: true, message: { type: "", text: "" } } : member
      )
    );

  const cancelEditing = (key) =>
    setMembers((prev) =>
      prev.map((member) =>
        member.key === key
          ? { ...member, editing: false, imageFile: null, message: { type: "", text: "" } }
          : member
      )
    );

  const handleMemberSubmit = async (member) => {
    const formData = new FormData();
    formData.append("name", member.name);
    formData.append("designation", member.designation);
    if (member.imageFile) {
      formData.append("image", member.imageFile);
    }

    setMembers((prev) =>
      prev.map((m) => (m.key === member.key ? { ...m, saving: true, message: { type: "", text: "" } } : m))
    );

    try {
      const data = member.id ? await updateMember(member.id, formData) : await createMember(formData);
      const saved = data.member;
      setMembers((prev) =>
        prev.map((m) =>
          m.key === member.key
            ? {
                key: `member-${saved.id}`,
                id: saved.id,
                name: saved.name || "",
                designation: saved.designation || "",
                image_url: saved.image_url || "",
                imageFile: null,
                editing: false,
                saving: false,
                message: { type: "success", text: "Team Member saved successfully" },
              }
            : m
        )
      );
    } catch (err) {
      setMembers((prev) =>
        prev.map((m) =>
          m.key === member.key
            ? { ...m, saving: false, message: { type: "error", text: err.message } }
            : m
        )
      );
    }
  };

  const handleMemberDelete = async (member) => {
    if (!member.id) {
      setMembers((prev) => prev.filter((m) => m.key !== member.key));
      return;
    }
    if (!window.confirm("Delete this team member?")) return;

    try {
      await deleteMember(member.id);
      setMembers((prev) => prev.filter((m) => m.key !== member.key));
    } catch (err) {
      setMembers((prev) =>
        prev.map((m) =>
          m.key === member.key
            ? { ...m, message: { type: "error", text: err.message } }
            : m
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
            Teams
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title, heading, button text and button link of the Teams section.
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
                  Title
                </label>
                <input
                  id="title_1"
                  name="title_1"
                  type="text"
                  value={section.title_1}
                  onChange={handleSectionChange}
                  placeholder="e.g. Team Members"
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
                  placeholder="e.g. Your Smile, Our Team's Commitment"
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
                  value={section.button_text}
                  onChange={handleSectionChange}
                  placeholder="e.g. View Member"
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
                  value={section.button_link}
                  onChange={handleSectionChange}
                  placeholder="e.g. /contact"
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
                  : "Create Teams Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Team Members
            </h2>
            <button
              type="button"
              onClick={addMember}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
            >
              + Add Team Member
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8">
          {members.length === 0 && (
            <p className="text-sm text-ink-500">
              No team members yet. Click "+ Add Team Member" to create your first doctor.
            </p>
          )}

          {members.map((member, index) => (
            <div key={member.key} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                Member {index + 1}
              </p>

              {!member.editing ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Image:</span>
                      {member.image_url ? (
                        <a
                          href={resolveMediaUrl(member.image_url)}
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
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Name:</span>
                      <span>{member.name || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-24 shrink-0 font-semibold text-ink-500">Designation:</span>
                      <span>{member.designation || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(member.key)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMemberDelete(member)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>

                  {member.message.text && (
                    <p className={getMessageClass(member.message.type)}>{member.message.text}</p>
                  )}
                </>
              ) : (
                <div className="mt-4 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Doctor Image
                    </label>

                    {member.image_url && (
                      <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                        <a
                          href={resolveMediaUrl(member.image_url)}
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
                      onChange={(e) => updateMemberImage(member.key, e.target.files[0] || null)}
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!member.imageFile && member.image_url && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current image will be kept unless you choose a new one.
                      </p>
                    )}
                    {member.imageFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New image selected: {member.imageFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMemberField(member.key, "name", e.target.value)}
                      placeholder="e.g. Dr. Pooja Yadav"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={member.designation}
                      onChange={(e) => updateMemberField(member.key, "designation", e.target.value)}
                      placeholder="e.g. Chief Dentist & Smile Designer"
                      className={inputClass}
                    />
                  </div>

                  {member.message.text && (
                    <p className={getMessageClass(member.message.type)}>{member.message.text}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={member.saving}
                      onClick={() => handleMemberSubmit(member)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                    >
                      {member.saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEditing(member.key)}
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
            onClick={addMember}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Team Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTeams;