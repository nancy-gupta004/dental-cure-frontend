import { useEffect, useState } from "react";
import { getImage } from "../../services/internationalPatients/imageService";
import { resolveMediaUrl } from "../../utils/media";

function Image() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImage()
      .then((data) => setImage(data.image || null))
      .catch(() => setImage(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-brand-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm text-ink-500">Loading...</p>
        </div>
      </section>
    );
  }

  // Nothing to show yet: the section is only rendered once the admin has given
  // it content, so an unfinished section never leaves a broken block behind
  if (!image) {
    return null;
  }

  // Slots the admin has not filled in yet are skipped, so the grid only shows
  // the images that actually exist
  const images = [image.image1, image.image2, image.image3, image.image4].filter(
    Boolean
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-brand-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((src, index) => (
            <div
              key={src}
              className="group overflow-hidden rounded-2xl shadow-lg shadow-brand-900/10 sm:rounded-3xl"
            >
              <img
                src={resolveMediaUrl(src)}
                alt={`Image ${index + 1}`}
                className="h-64 w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.02] lg:h-80"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Image;