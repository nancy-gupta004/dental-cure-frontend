import { useEffect, useState } from "react";
import { fetchPage } from "../services/pageService";

function ContentPage({ pageKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
 
  const [loadedKey, setLoadedKey] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchPage(pageKey)
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError("");
          setLoadedKey(pageKey);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoadedKey(pageKey);
        }
      });

    return () => {
      ignore = true;
    };
  }, [pageKey]);

  const loading = loadedKey !== pageKey;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-brand-400/20">
        <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 px-8 py-12">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900 capitalize">
            {pageKey}
          </h1>
        </div>

        <div className="px-8 py-8">
          {loading && <p className="text-sm text-ink-500">Loading...</p>}

          {!loading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && data && (
            <p className="text-base leading-relaxed text-ink-700">
              {data.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentPage;