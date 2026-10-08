import { useEffect, useState } from "react";
import {
  getBlog,
  createSection,
  updateSection,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../../services/home/blogService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text fields only allow letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&:/-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

const EMPTY_BLOG = () => ({
  key: `blog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  id: null,
  date: "",
  title_1: "",
  title_2: "",
  image: "",
  imageFile: null,
  editing: true,
  saving: false,
  message: { type: "", text: "" },
});

function AdminBlog() {
  const [section, setSection] = useState({
    title: "",
    heading: "",
    button_text: "",
    button_link: "",
  });
  const [blogs, setBlogs] = useState([]);
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
      const data = await getBlog();
      if (data.section || data.data) {
        setSectionRecordExists(true);
      }

      const s = data.section || data.data || {};
      setSection({
        title: s.title || "",
        heading: s.heading || "",
        button_text: s.button_text || "",
        button_link: s.button_link || "",
      });
      const items = data.blogs || s.blogs || [];
      setBlogs(
        items.map((b) => ({
          key: `blog-${b.id}`,
          id: b.id,
          date: b.date || "",
          title_1: b.title_1 || "",
          title_2: b.title_2 || "",
          image: b.image || "",
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

    const textFields = [
      { key: "title", label: "Title" },
      { key: "heading", label: "Heading" },
      { key: "button_text", label: "Button Text" },
      { key: "button_link", label: "Button Link" },
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
        button_text: savedSection.button_text || "",
        button_link: savedSection.button_link || "",
      });
      setSectionMessage({
        type: "success",
        text: isCreate
          ? "Blog section created successfully"
          : "Blog section updated successfully",
      });
    } catch (err) {
      setSectionMessage({ type: "error", text: err.message });
    } finally {
      setSavingSection(false);
    }
  };

  const addBlog = () => {
    setBlogs((prev) => [...prev, EMPTY_BLOG()]);
  };

  const updateBlogField = (key, field, value) => {
    setBlogs((prev) =>
      prev.map((b) => (b.key === key ? { ...b, [field]: value } : b))
    );
  };

  const updateBlogImage = (key, file) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.key === key
          ? { ...b, imageFile: file, message: { type: "", text: "" } }
          : b
      )
    );
  };

  const startEditing = (key) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.key === key
          ? { ...b, editing: true, message: { type: "", text: "" } }
          : b
      )
    );
  };

  const cancelEditing = (key) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.key === key
          ? {
              ...b,
              editing: false,
              imageFile: null,
              message: { type: "", text: "" },
            }
          : b
      )
    );
  };

  const handleBlogSubmit = async (blog) => {
    const textFields = [
      { key: "title_1", label: "Title 1" },
      { key: "title_2", label: "Title 2" },
    ];

    for (const field of textFields) {
      if (!isPlainText(blog[field.key])) {
        setBlogs((prev) =>
          prev.map((b) =>
            b.key === blog.key
              ? {
                  ...b,
                  message: {
                    type: "error",
                    text: `${field.label} can only contain letters, numbers, spaces, and basic punctuation ( . , ! ? - ' + & : ). HTML or other special characters are not allowed.`,
                  },
                }
              : b
          )
        );
        return;
      }
    }

    const formData = new FormData();
    formData.append("date", blog.date || "");
    formData.append("title_1", blog.title_1);
    formData.append("title_2", blog.title_2);
    if (blog.imageFile) {
      formData.append("image", blog.imageFile);
    }

    setBlogs((prev) =>
      prev.map((b) =>
        b.key === blog.key
          ? { ...b, saving: true, message: { type: "", text: "" } }
          : b
      )
    );

    try {
      const data = blog.id
        ? await updateBlog(blog.id, formData)
        : await createBlog(formData);
      const saved = data.blog || {};
      setBlogs((prev) =>
        prev.map((b) =>
          b.key === blog.key
            ? {
                key: `blog-${saved.id}`,
                id: saved.id,
                date: saved.date || "",
                title_1: saved.title_1 || "",
                title_2: saved.title_2 || "",
                image: saved.image || "",
                imageFile: null,
                editing: false,
                saving: false,
                message: {
                  type: "success",
                  text: "Blog saved successfully",
                },
              }
            : b
        )
      );
    } catch (err) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.key === blog.key
            ? {
                ...b,
                saving: false,
                message: { type: "error", text: err.message },
              }
            : b
        )
      );
    }
  };

  const handleBlogDelete = async (blog) => {
    if (!blog.id) {
      setBlogs((prev) => prev.filter((b) => b.key !== blog.key));
      return;
    }
    if (!window.confirm("Delete this blog item?")) return;

    try {
      await deleteBlog(blog.id);
      setBlogs((prev) => prev.filter((b) => b.key !== blog.key));
    } catch (err) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.key === blog.key
            ? { ...b, message: { type: "error", text: err.message } }
            : b
        )
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-12">
      {/* BLOG SECTION SETTINGS */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">
            Blog
          </h1>
          <p className="mt-2 text-sm text-brand-800">
            Edit the title, heading, button text and button link of the Blog
            section.
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
                  placeholder="e.g. Latest Blog"
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
                  placeholder="e.g. Stay Informed With Our Latest Blogs"
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
                  placeholder="e.g. View More"
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
                  placeholder="e.g. /blogs"
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
                  : "Create Blog Section"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* BLOGS LIST */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-900">
              Blogs
            </h2>
            <button
              type="button"
              onClick={addBlog}
              className="rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
            >
              + Add Blog
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-8">
          {blogs.length === 0 && (
            <p className="text-sm text-ink-500">
              No blogs yet. Click "+ Add Blog" to create your first item.
            </p>
          )}

          {blogs.map((blog, index) => (
            <div
              key={blog.key}
              className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                Blog {index + 1}
              </p>

              {!blog.editing ? (
                /* VIEW MODE */
                <>
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Image:
                      </span>
                      {blog.image ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveMediaUrl(blog.image)}
                            alt={blog.title_1 || "Blog"}
                            className="h-10 w-12 rounded object-cover border border-brand-200"
                          />
                          <a
                            href={resolveMediaUrl(blog.image)}
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
                        Date:
                      </span>
                      <span className="font-medium">{blog.date || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Title 1:
                      </span>
                      <span className="font-medium">{blog.title_1 || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="w-28 shrink-0 font-semibold text-ink-500">
                        Title 2:
                      </span>
                      <span className="font-medium">{blog.title_2 || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(blog.key)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBlogDelete(blog)}
                      className="rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>

                  {blog.message.text && (
                    <p
                      className={`mt-3 ${getMessageClass(blog.message.type)}`}
                    >
                      {blog.message.text}
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

                    {blog.image && (
                      <div className="mb-3 flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
                        <img
                          src={resolveMediaUrl(blog.image)}
                          alt="Current"
                          className="h-12 w-14 rounded object-cover"
                        />
                        <a
                          href={resolveMediaUrl(blog.image)}
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
                        updateBlogImage(blog.key, e.target.files[0] || null)
                      }
                      className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                    />
                    {!blog.imageFile && blog.image && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        Current image will be kept unless you choose a new one.
                      </p>
                    )}
                    {blog.imageFile && (
                      <p className="mt-1.5 text-xs text-ink-500">
                        New image selected: {blog.imageFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={blog.date}
                      onChange={(e) =>
                        updateBlogField(blog.key, "date", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Title 1
                    </label>
                    <input
                      type="text"
                      value={blog.title_1}
                      onChange={(e) =>
                        updateBlogField(blog.key, "title_1", e.target.value)
                      }
                      placeholder="e.g. Stay Updated with Dental Care"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                      Title 2
                    </label>
                    <input
                      type="text"
                      value={blog.title_2}
                      onChange={(e) =>
                        updateBlogField(blog.key, "title_2", e.target.value)
                      }
                      placeholder="e.g. Insights."
                      className={inputClass}
                    />
                  </div>

                  {blog.message.text && (
                    <p className={getMessageClass(blog.message.type)}>
                      {blog.message.text}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={blog.saving}
                      onClick={() => handleBlogSubmit(blog)}
                      className="flex-1 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                    >
                      {blog.saving ? "Saving..." : "Save Blog"}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEditing(blog.key)}
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
            onClick={addBlog}
            className="w-full rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            + Add Blog
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminBlog;