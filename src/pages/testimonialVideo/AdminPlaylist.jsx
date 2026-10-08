import { useEffect, useState } from "react";
import {
  getAllPlaylistVideos,
  createPlaylistVideo,
  updatePlaylistVideo,
  deletePlaylistVideo,
  reorderPlaylistVideos,
} from "../../services/testimonialVideo/playlistService";
import { inputClass, getMessageClass } from "../../utils/classes";
import { resolveMediaUrl } from "../../utils/media";

// Plain text allows letters, numbers, spaces, and basic punctuation
const PLAIN_TEXT_PATTERN = /^[A-Za-z0-9\s.,!?'+&/:-]+$/;
const isPlainText = (value) => !value.trim() || PLAIN_TEXT_PATTERN.test(value);

let tempKey = 0;
const newKey = () => `new-${Date.now()}-${tempKey++}`;

function createEmptyVideo() {
  return {
    key: newKey(),
    id: null,
    title: "",
    description: "",
    video: "",
    thumbnail: "",
    duration: "",
    status: "active",
    thumbnailFile: null,
    videoFile: null,
    editing: true,
    saving: false,
    message: { type: "", text: "" },
  };
}

function mapSavedVideo(video) {
  return {
    key: `playlist-${video.id}-${Date.now()}`,
    id: video.id,
    title: video.title || "",
    description: video.description || "",
    video: video.video || "",
    thumbnail: video.thumbnail || "",
    duration: video.duration ? String(video.duration) : "",
    status: video.status || "active",
    thumbnailFile: null,
    videoFile: null,
    editing: false,
    saving: false,
    message: { type: "", text: "" },
  };
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function AdminPlaylist() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  const loadVideos = () =>
    getAllPlaylistVideos()
      .then((data) => setItems((data.videos || []).map(mapSavedVideo)))
      .catch((err) => setMessage({ type: "error", text: err.message }));

  useEffect(() => {
    getAllPlaylistVideos()
      .then((data) => setItems((data.videos || []).map(mapSavedVideo)))
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const updateItemState = (key, updater) =>
    setItems((prev) => prev.map((item) => (item.key === key ? updater(item) : item)));

  const handleAddVideo = () => {
    setMessage({ type: "", text: "" });
    setItems((prev) => [...prev, createEmptyVideo()]);
  };

  const handleFieldChange = (key, field, value) => {
    updateItemState(key, (item) => ({
      ...item,
      [field]: value,
      message: { type: "", text: "" },
    }));
  };

  const handleThumbnailChange = (key, file) => {
    updateItemState(key, (item) => ({
      ...item,
      thumbnailFile: file,
      message: { type: "", text: "" },
    }));
  };

  const handleVideoChange = (key, file) => {
    updateItemState(key, (item) => ({
      ...item,
      videoFile: file,
      message: { type: "", text: "" },
    }));
  };

  const startEditing = (key) =>
    updateItemState(key, (item) => ({
      ...item,
      editing: true,
      thumbnailFile: null,
      videoFile: null,
      message: { type: "", text: "" },
    }));

  const cancelEditing = (key) =>
    updateItemState(key, (item) => ({
      ...item,
      editing: false,
      thumbnailFile: null,
      videoFile: null,
      message: { type: "", text: "" },
    }));

  const validateItem = (item) => {
    if (!item.title.trim()) {
      return "Title is required.";
    }
    if (!isPlainText(item.title)) {
      return "Title can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (!isPlainText(item.description)) {
      return "Description can only contain letters, numbers, spaces, and basic punctuation.";
    }
    if (item.duration && (Number.isNaN(Number(item.duration)) || Number(item.duration) < 0)) {
      return "Duration must be a number of seconds greater than or equal to 0.";
    }
    if (!item.id && !item.thumbnailFile) {
      return "Thumbnail is required.";
    }
    if (!item.id && !item.videoFile) {
      return "Video file is required.";
    }
    return "";
  };

  const applySavedVideo = (item, saved) => {
    const savedItem = mapSavedVideo(saved);
    savedItem.message = { type: "success", text: "Video saved successfully" };
    savedItem.editing = false;
    setItems((prevItems) =>
      prevItems.map((i) => (i.key === item.key ? savedItem : i))
    );
  };

  const handleSaveVideo = async (item) => {
    const error = validateItem(item);
    if (error) {
      updateItemState(item.key, (prev) => ({
        ...prev,
        message: { type: "error", text: error },
      }));
      return;
    }

    const formData = new FormData();
    formData.append("title", item.title);
    formData.append("description", item.description);
    formData.append("duration", item.duration || "0");
    formData.append("status", item.status);
    if (item.thumbnailFile) {
      formData.append("thumbnail", item.thumbnailFile);
    }
    if (item.videoFile) {
      formData.append("video", item.videoFile);
    }

    updateItemState(item.key, (prev) => ({
      ...prev,
      saving: true,
      message: { type: "", text: "" },
    }));

    try {
      const data = item.id
        ? await updatePlaylistVideo(item.id, formData)
        : await createPlaylistVideo(formData);
      applySavedVideo(item, data.video);
    } catch (err) {
      updateItemState(item.key, (prev) => ({
        ...prev,
        saving: false,
        message: { type: "error", text: err.message },
      }));
    }
  };

  const handleDeleteVideo = async (item) => {
    if (!item.id) {
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      return;
    }
    if (!window.confirm("Delete this video?")) return;

    try {
      await deletePlaylistVideo(item.id);
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    } catch (err) {
      updateItemState(item.key, (prev) => ({
        ...prev,
        message: { type: "error", text: err.message },
      }));
    }
  };

  const reorderingBusy = reordering || items.some((i) => i.editing || i.id === null);

  const moveVideo = (index, direction) => {
    if (reorderingBusy) return;
    if (index === 0 && direction === -1) return;
    if (index === items.length - 1 && direction === 1) return;

    const next = [...items];
    const target = index + direction;
    const temp = next[target];
    next[target] = next[index];
    next[index] = temp;

    setReordering(true);
    setMessage({ type: "", text: "" });

    reorderPlaylistVideos(next.map((i) => i.id))
      .then(() => loadVideos())
      .catch((err) => {
        setMessage({ type: "error", text: err.message });
        return loadVideos();
      })
      .finally(() => setReordering(false));
  };

  const canMoveUp = (index) => !reorderingBusy && index > 0;
  const canMoveDown = (index) => !reorderingBusy && index < items.length - 1;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Testimonial Video &rarr; Playlist Section
              </span>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-900">
                Playlist
              </h1>
              <p className="mt-2 text-sm text-brand-800">
                Add, edit, delete, and reorder the testimonial videos shown in
                the playlist on the Testimonial Video page.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && (
            <>
              <button
                type="button"
                onClick={handleAddVideo}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                Add Video
              </button>
              {message.text && (
                <p className={getMessageClass(message.type)}>{message.text}</p>
              )}

              {items.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-500">
                  No videos yet. Click &quot;Add Video&quot; to create your
                  first one.
                </p>
              )}

              {items.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item, index) =>
                    item.editing ? (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5"
                      >
                        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                          {item.id ? "Edit Video" : "New Video"}
                        </p>

                        <div className="mt-4 space-y-5">
                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Video File{" "}
                              {!item.id && <span className="text-red-500">*</span>}
                            </label>

                            {item.video && (
                              <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                                <a
                                  href={resolveMediaUrl(item.video)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                                >
                                  View Current Video
                                </a>
                              </div>
                            )}

                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                handleVideoChange(item.key, e.target.files[0] || null)
                              }
                              className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                            />
                            {!item.videoFile && item.video && (
                              <p className="mt-1.5 text-xs text-ink-500">
                                Current video will be kept unless you choose a new one.
                              </p>
                            )}
                            {item.videoFile && (
                              <p className="mt-1.5 text-xs text-ink-500">
                                New video selected: {item.videoFile.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Thumbnail{" "}
                              {!item.id && <span className="text-red-500">*</span>}
                            </label>

                            {item.thumbnail && (
                              <div className="mb-3 rounded-xl border border-brand-100 bg-white p-4">
                                <img
                                  src={resolveMediaUrl(item.thumbnail)}
                                  alt="Current Thumbnail"
                                  className="max-h-32 w-full rounded-lg object-cover"
                                />
                                <a
                                  href={resolveMediaUrl(item.thumbnail)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-block text-sm font-semibold text-brand-600 underline hover:text-brand-700"
                                >
                                  View Thumbnail
                                </a>
                              </div>
                            )}

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) =>
                                handleThumbnailChange(item.key, e.target.files[0] || null)
                              }
                              className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-200"
                            />
                            {!item.thumbnailFile && item.thumbnail && (
                              <p className="mt-1.5 text-xs text-ink-500">
                                Current thumbnail will be kept unless you choose a new one.
                              </p>
                            )}
                            {item.thumbnailFile && (
                              <p className="mt-1.5 text-xs text-ink-500">
                                New thumbnail selected: {item.thumbnailFile.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                handleFieldChange(item.key, "title", e.target.value)
                              }
                              placeholder="e.g. Sarah&apos;s Smile Makeover"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                              Description
                            </label>
                            <textarea
                              rows="3"
                              value={item.description}
                              onChange={(e) =>
                                handleFieldChange(item.key, "description", e.target.value)
                              }
                              placeholder="Optional text shown under the title"
                              className={inputClass}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Duration (seconds)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={item.duration}
                                onChange={(e) =>
                                  handleFieldChange(item.key, "duration", e.target.value)
                                }
                                placeholder="e.g. 90"
                                className={inputClass}
                              />
                              <p className="mt-1 text-xs text-ink-500">
                                Only used as a label on the public page.
                              </p>
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700">
                                Status
                              </label>
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleFieldChange(item.key, "status", e.target.value)
                                }
                                className={inputClass}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                              <p className="mt-1 text-xs text-ink-500">
                                Inactive videos stay hidden on the public page.
                              </p>
                            </div>
                          </div>

                          {item.message.text && (
                            <p className={getMessageClass(item.message.type)}>
                              {item.message.text}
                            </p>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={item.saving}
                              onClick={() => handleSaveVideo(item)}
                              className="flex-1 cursor-pointer rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-400/40 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
                            >
                              {item.saving ? "Saving..." : "Save Video"}
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEditing(item.key)}
                              className="rounded-2xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={item.key}
                        className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-md shadow-brand-400/10"
                      >
                        <div className="relative">
                          <img
                            src={resolveMediaUrl(item.thumbnail)}
                            alt={item.title}
                            className="aspect-[16/9] w-full object-cover"
                          />

                          {item.status !== "active" && (
                            <div className="absolute left-2 top-2 rounded-full bg-ink-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                              Inactive
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/70 to-transparent px-3 pb-2 pt-8">
                            <p className="truncate text-center text-sm font-semibold text-white">
                              {item.title}
                            </p>
                          </div>

                          <div className="absolute right-2 top-2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveVideo(index, -1)}
                              disabled={!canMoveUp(index)}
                              title="Move Up"
                              className="pointer inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-ink-900/50 text-white shadow-sm backdrop-blur transition hover:bg-ink-900/70 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-3.5 w-3.5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVideo(index, 1)}
                              disabled={!canMoveDown(index)}
                              title="Move Down"
                              className="pointer inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/30 bg-ink-900/50 text-white shadow-sm backdrop-blur transition hover:bg-ink-900/70 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-3.5 w-3.5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 px-4 pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                            #{index + 1}
                          </p>
                          <p className="text-xs text-ink-500">
                            {formatDuration(item.duration)} &middot; {item.views} views
                          </p>
                        </div>

                        <div className="flex gap-2 p-3">
                          <button
                            type="button"
                            onClick={() => startEditing(item.key)}
                            className="flex-1 cursor-pointer rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-400/30 transition hover:from-brand-400 hover:to-brand-500"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(item)}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>

                        {item.message.text && (
                          <p className={getMessageClass(item.message.type)}>
                            {item.message.text}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="mt-8 w-full cursor-pointer rounded-2xl border-2 border-dashed border-brand-300 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  + Add Another Video
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPlaylist;