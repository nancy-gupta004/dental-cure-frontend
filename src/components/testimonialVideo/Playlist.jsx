import { useEffect, useRef, useState } from "react";
import { getPlaylistVideos, incrementVideoViews } from "../../services/testimonialVideo/playlistService";
import { resolveMediaUrl } from "../../utils/media";

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatViews(views) {
  const total = Number(views) || 0;
  if (total >= 1000000) {
    return `${(total / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (total >= 1000) {
    return `${(total / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(total);
}

const PlayIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
      clipRule="evenodd"
    />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    <path
      fillRule="evenodd"
      d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737l-3.968 1.984a2.5 2.5 0 0 1 0 3.558l3.968 1.984a2.5 2.5 0 1 1-.734 1.552l-3.968-1.984a2.5 2.5 0 1 1 0-3.558l3.968-1.984a2.5 2.5 0 0 1 1.032-1.29Z" />
  </svg>
);

function Playlist() {
  const [videos, setVideos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const countedRef = useRef(new Set());

  useEffect(() => {
    let cancelled = false;
    getPlaylistVideos()
      .then((data) => {
      
        if (cancelled) return;
        const list = data.videos || [];
        setVideos(list);
        if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedVideo = videos.find((video) => video.id === selectedId) || null;

  const handleSelect = (video) => {
    setSelectedId(video.id);
    if (countedRef.current.has(video.id)) return;

    countedRef.current.add(video.id);
    incrementVideoViews(video.id)
      .then((data) => {
        const updated = data.video;
        setVideos((prev) =>
          prev.map((item) => (item.id === updated.id ? { ...item, views: updated.views } : item))
        );
      })
      .catch(() => {
        countedRef.current.delete(video.id);
      });
  };

  const handleShare = async () => {
    if (!selectedVideo) return;
    const url = resolveMediaUrl(selectedVideo.video);
    
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedVideo.title, url });
        return;
      } catch {
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setError("");
    } catch {
      setError("Could not copy the video link.");
    }
  };

  if (loading) {
    return (
      <section className="bg-ink-950 py-16">
        <div className="mx-auto max-w-6xl px-4 text-sm text-ink-400">Loading playlist...</div>
      </section>
    );
  }

  if (error && videos.length === 0) {
    return (
      <section className="bg-ink-950 py-16">
        <div className="mx-auto max-w-6xl px-4 text-sm text-red-400">{error}</div>
      </section>
    );
  }

  return (
    <section className="bg-ink-950 py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Playlist column */}
          
          <div className="w-full lg:w-5/12">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30">
                <PlayIcon className="ml-1 h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-marcellus text-3xl text-black">Playlist</h2>
              </div>
              <div className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                {videos.length} {videos.length === 1 ? "Video" : "Videos"}
              </div>
            </div>

            <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {videos.map((video, index) => {
                const isSelected = video.id === selectedId;
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleSelect(video)}
                    className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition ${
                      isSelected
                        ? "border-2 border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/20"
                        : "border border-white/10 bg-white/[0.03] hover:border-brand-500/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={resolveMediaUrl(video.thumbnail)}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-700">
                          <PlayIcon className="ml-0.5 h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-brand-400" : "text-ink-500"
                          }`}
                        >
                          #{index + 1}
                        </span>
                        {isSelected && (
                          <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Now
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 truncate text-sm font-semibold ${
                          isSelected ? "text-white" : "text-ink-300"
                        }`}
                      >
                        {video.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatDuration(video.duration)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="h-3.5 w-3.5" />
                          {formatViews(video.views)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player column */}
          <div className="w-full lg:w-7/12">
            {selectedVideo ? (
              <div>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/40">
                  <video
                    key={selectedVideo.id}
                    controls
                    playsInline
                    poster={resolveMediaUrl(selectedVideo.thumbnail)}
                    className="aspect-video w-full bg-black"
                  >
                    <source src={resolveMediaUrl(selectedVideo.video)} />
                  </video>
                </div>

                <div className="mt-5">
                  <h3 className="font-marcellus text-2xl text-white">
                    {selectedVideo.title}
                  </h3>
                  {selectedVideo.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">
                      {selectedVideo.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                      <EyeIcon className="h-4 w-4" />
                      {formatViews(selectedVideo.views)} views
                    </span>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      <ShareIcon className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-sm text-ink-500">
                Select a video to start watching.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Playlist;