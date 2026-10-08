import { resolveMediaUrl } from "../../utils/media";

function SmileResultCard({ item, serviceName, isClone = false }) {
  const hasBefore = Boolean(item?.beforeImage);
  const hasAfter = Boolean(item?.afterImage);

  if (!hasBefore && !hasAfter) {
    return null;
  }

  const beforeAlt = serviceName
    ? `${serviceName} before treatment`
    : "Before teeth transformation";

  const afterAlt = serviceName
    ? `${serviceName} after treatment`
    : "After teeth transformation";

  return (
    <div
      className="group relative h-[260px] w-full overflow-hidden rounded-[24px] bg-brand-100"
      aria-hidden={isClone || undefined}
    >
      {/* BEFORE IMAGE */}
      {hasBefore && (
        <img
          src={resolveMediaUrl(item.beforeImage)}
          alt={isClone ? "" : beforeAlt}
          loading="lazy"
          className="  absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-0
          "
        />
      )}

      {/* AFTER IMAGE */}
      {hasAfter && (
        <img
          src={resolveMediaUrl(item.afterImage)}
          alt={isClone ? "" : afterAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover scale-105 opacity-0 transition-all duration-700 ease-in-out group-hover:scale-100 group-hover:opacity-100
          "
        />
      )}

      {/* BEFORE LABEL */}
      {hasBefore && (
        <div
          className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-lg text-white transition-opacity duration-500 group-hover:opacity-0"
        >
          <span>Before</span>
          <span className="text-xl">→</span>
        </div>
      )}

      {/* AFTER LABEL */}
      {hasAfter && (
        <div
          className="absolute bottom-6 right-6 z-10 flex items-center gap-2 text-lg text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          <span>←</span>
          <span>After</span>
        </div>
      )}
    </div>
  );
}

function SmileResultsSection({ smileResults, serviceName }) {
  const title = smileResults?.title || "";
  const heading1 = smileResults?.heading1 || "";
  const heading2 = smileResults?.heading2 || "";

  const items = (smileResults?.items || [])
    .filter(
      (item) =>
        item &&
        (item.beforeImage || item.afterImage)
    )
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (a.id ?? 0) - (b.id ?? 0);
    });

  const total = items.length;

  if (!title && !heading1 && !heading2 && total === 0) {
    return null;
  }

 
  
  const shouldLoop = total > 4;

  return (
    <section className="overflow-hidden bg-brand-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        

        {(title || heading1 || heading2) && (
          <div className="mx-auto max-w-4xl text-center">
            {title && (
              <p className="text-sm font-medium italic tracking-[0.08em] text-brand-600 sm:text-base">
                {title}
              </p>
            )}

            {heading1 && (
              <h2 className="mt-3 font-marcellus text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                {heading1}
              </h2>
            )}

            {heading2 && (
              <h3 className="mt-2 font-marcellus text-3xl leading-tight tracking-tight text-brand-600 sm:text-4xl">
                {heading2}
              </h3>
            )}
          </div>
        )}

        {/* ================================
            CARDS
        ================================= */}

        {total > 0 && (
          <div className="mt-12 overflow-hidden">
            {shouldLoop ? (
             
              <div
                className="
                  smile-marquee
                  flex
                  w-max
                  gap-5
                  lg:gap-6
                "
              >
                {/* FIRST GROUP */}
                <div
                  className="
                    smile-marquee-group
                    flex
                    w-[calc(100vw-40px)]
                    max-w-7xl
                    shrink-0
                    gap-5
                    sm:w-[calc(100vw-64px)]
                    lg:w-[calc(100vw-80px)]
                    lg:gap-6
                  "
                >
                  {items.map((item, index) => (
                    <div
                      key={`first-${item.id ?? index}`}
                      className="
                        w-[calc((100%-15px)/2)]
                        shrink-0
                        sm:w-[calc((100%-15px)/2)]
                        lg:w-[calc((100%-72px)/4)]
                      "
                    >
                      <SmileResultCard
                        item={item}
                        serviceName={serviceName}
                      />
                    </div>
                  ))}
                </div>

                {/* SECOND IDENTICAL GROUP */}
                <div
                  className="
                    smile-marquee-group
                    flex
                    w-[calc(100vw-40px)]
                    max-w-7xl
                    shrink-0
                    gap-5
                    sm:w-[calc(100vw-64px)]
                    lg:w-[calc(100vw-80px)]
                    lg:gap-6
                  "
                  aria-hidden="true"
                >
                  {items.map((item, index) => (
                    <div
                      key={`second-${item.id ?? index}`}
                      className="
                        w-[calc((100%-15px)/2)]
                        shrink-0
                        sm:w-[calc((100%-15px)/2)]
                        lg:w-[calc((100%-72px)/4)]
                      "
                    >
                      <SmileResultCard
                        item={item}
                        serviceName={serviceName}
                        isClone
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /*
                4 OR FEWER CARDS

                No animation is needed.
                Just show the cards normally.
              */
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  sm:grid-cols-2
                  lg:grid-cols-4
                  lg:gap-6
                "
              >
                {items.map((item, index) => (
                  <SmileResultCard
                    key={item.id ?? index}
                    item={item}
                    serviceName={serviceName}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

   
      {shouldLoop && (
        <style>{`
          .smile-marquee {
            animation: smile-scroll 30s linear infinite;
          }

          @keyframes smile-scroll {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(
                calc(
                  -50% - 10px
                )
              );
            }
          }

          @media (min-width: 1024px) {
            .smile-marquee {
              animation-duration: 35s;
            }

            @keyframes smile-scroll {
              from {
                transform: translateX(0);
              }

              to {
                transform: translateX(
                  calc(
                    -50% - 12px
                  )
                );
              }
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .smile-marquee {
              animation: none;
            }
          }
        `}</style>
      )}
    </section>
  );
}

export default SmileResultsSection;