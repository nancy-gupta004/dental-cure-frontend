import { useEffect, useState } from "react";
import { getTestimonialGallery } from "../../services/testimonialGallery/galleryService";
import { resolveMediaUrl } from "../../utils/media";

function TestimonialGallerySection() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonialGallery()
      .then((data) => setGallery(data.gallery || []))
      .catch(() => setGallery([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-brand-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <p className="text-center text-sm text-ink-500">Loading...</p>
        </div>
      </section>
    );
  }

  if (gallery.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-50">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        {/* 3-column grid on desktop, responsive on smaller screens */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white p-3 shadow-xl shadow-brand-400/10"
            >
              {item.image && (
                <img
                  src={resolveMediaUrl(item.image)}
                  alt={item.title}
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              )}

              {item.title && (
                <p className="px-2 pb-2 pt-4 text-center font-marcellus text-lg text-ink-900">
                  {item.title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialGallerySection;