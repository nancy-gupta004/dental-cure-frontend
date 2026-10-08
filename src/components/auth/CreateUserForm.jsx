import { useState } from "react";
import { createUser } from "../../services/auth/authService";
import { PAGES } from "../../constants/pages";
import { inputClass, getMessageClass } from "../../utils/classes";

function CreateUserForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setMessage({ type: "", text: "" });
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePage = (key) => {
    setMessage({ type: "", text: "" });
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      await createUser({ ...form, permissions: selected });
      setMessage({
        type: "success",
        text: `User created. Access given to: ${selected.length ? selected.join(", ") : "none"}`,
      });
      setForm({ name: "", email: "", password: "" });
      setSelected([]);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter full name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700">
          Page Access
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PAGES.map((page) => (
            <label
              key={page.key}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                selected.includes(page.key)
                  ? "border-brand-400 bg-brand-50 text-brand-800"
                  : "border-ink-100 bg-white text-ink-700 hover:bg-brand-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(page.key)}
                onChange={() => togglePage(page.key)}
                className="h-4 w-4 accent-brand-500"
              />
              {page.label}
            </label>
          ))}
        </div>
      </div>

      {message.text && (
        <p className={getMessageClass(message.type)}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}

export default CreateUserForm;