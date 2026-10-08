import { useEffect, useState } from "react";
import { getGallery } from "../../services/home/galleryService";
import { resolveMediaUrl } from "../../utils/media";

function GallerySection() {
  const [section, setSection] = useState(null);

  useEffect(() => {
    getGallery()
      .then((data) => {
        setSection(data?.section || null);
      })
      .catch(() => {
        setSection(null);
      });
  }, []);

  if (!section) return null;

  const images = [1, 2, 3, 4, 5, 6, 7]
    .map((n) => ({
      number: n,
      src: section[`image_${n}`],
    }))
    .filter((item) => item.src);

  const hasContent =
    section.title ||
    section.heading ||
    section.description ||
    images.length > 0;

  if (!hasContent) return null;

  // Split heading
  const headingWords = (section.heading || "").trim().split(/\s+/);

  const headingFirst =
    headingWords.length > 1 ? `${headingWords[0]} ` : "";

  const headingRest =
    headingWords.length > 1
      ? headingWords.slice(1).join(" ")
      : headingWords.join(" ");

  // Find image by image number
  const getImage = (number) =>
    images.find((image) => image.number === number);

  return (
    <section className="overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-[1460px]">

        {/* ================= HEADER ================= */}
        <div className="text-center">
          {section.title && (
            <p className="text-xs font-medium italic tracking-[0.2em] text-brand-600">
              {section.title}
            </p>
          )}

          {section.heading && (
            <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {headingFirst && <span>{headingFirst}</span>}

              {headingRest && (
                <span className="text-brand-400">
                  {headingRest}
                </span>
              )}
            </h2>
          )}

          {section.description && (
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
              {section.description}
            </p>
          )}
        </div>

        {/* ================= GALLERY ================= */}
        {images.length > 0 && (
          <div
            className="
              mt-14

              hidden
              lg:grid

              lg:grid-cols-6
              lg:grid-rows-[120px_205px_205px]

              gap-4
            "
          >
            {/* IMAGE 1 - LEFT TOP */}
            {getImage(1) && (
              <GalleryImage
                image={getImage(1)}
                className="col-start-1 col-end-2 row-start-1 row-end-3"
              />
            )}

            {/* IMAGE 2 - CENTER LARGE */}
            {getImage(2) && (
              <GalleryImage
                image={getImage(2)}
                className="col-start-2 col-end-5 row-start-1 row-end-4"
              />
            )}

            {/* IMAGE 3 - RIGHT TOP */}
            {getImage(3) && (
              <GalleryImage
                image={getImage(3)}
                className="col-start-5 col-end-7 row-start-1 row-end-2"
              />
            )}

            {/* IMAGE 4 - LEFT BOTTOM */}
            {getImage(4) && (
              <GalleryImage
                image={getImage(4)}
                className="col-start-1 col-end-2 row-start-3 row-end-4"
              />
            )}

            {/* IMAGE 5 - RIGHT MIDDLE LEFT */}
            {getImage(5) && (
              <GalleryImage
                image={getImage(5)}
                className="col-start-5 col-end-6 row-start-2 row-end-4"
              />
            )}

            {/* IMAGE 6 - RIGHT MIDDLE RIGHT */}
            {getImage(6) && (
              <GalleryImage
                image={getImage(6)}
                className="col-start-6 col-end-7 row-start-2 row-end-3"
              />
            )}

            {/* IMAGE 7 - RIGHT BOTTOM RIGHT */}
            {getImage(7) && (
              <GalleryImage
                image={getImage(7)}
                className="col-start-6 col-end-7 row-start-3 row-end-4"
              />
            )}
          </div>
        )}

        {/* ================= TABLET / MOBILE ================= */}
        {images.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 lg:hidden">
            {images.map((image, index) => (
              <GalleryImage
                key={`gallery-mobile-${image.number}`}
                image={image}
                className={
                  index === 0
                    ? "col-span-2 h-[400px]"
                    : index === 1
                    ? "col-span-2 h-[450px]"
                    : "h-[220px]"
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ================= IMAGE COMPONENT ================= */

function GalleryImage({ image, className = "" }) {
  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        sm:rounded-3xl
        ${className}
      `}
    >
      <img
        src={resolveMediaUrl(image.src)}
        alt={`Gallery ${image.number}`}
        className="
          h-full
          w-full
          object-cover
          transition-transform
          duration-500
          ease-in-out
          group-hover:scale-[1.02]
        "
      />
    </div>
  );
}

export default GallerySection;