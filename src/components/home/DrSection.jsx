import { useEffect, useState } from "react";
import { getDr } from "../../services/home/drService";
import { resolveMediaUrl } from "../../utils/media";
import StarRating from "../StarRating";

function DrSection() {
  const [dr, setDr] = useState(null);

  useEffect(() => {
    getDr()
      .then((data) => {
        const value = data.dr || {};
        setDr({
          ...value,
          years_of_experience: value.years_of_experience ?? "",
        });
      })
      .catch(() => setDr(null));
  }, []);

  if (!dr || (!dr.dr_name && !dr.title_1 && !dr.dr_image_url)) return null;

  return (
    <section className="bg-white px-6 py-16 sm:px-10">
      <div className=" mx-auto grid w-full max-w-6xl items-center gap-0 lg:grid-cols-2">
        {dr.dr_image_url && (
          <div className="flex justify-center">
             <div className="relative -left-8 mt-10 hidden h-[360px] w-[400px] rounded-bl-[120px] rounded-tl-[0px] rounded-tr-[0px] border-2 border-[#e9dfd4] lg:block" />

            <img
              src={resolveMediaUrl(dr.dr_image_url)}
              alt={dr.dr_name || "Doctor"}
              className="absolute mb-20 ml-10 h-90 w-110 rounded-bl-[80px] object-cover shadow-xl shadow-brand-400/30"
            />
                 {/* Experience Circle */}
          {dr.years_of_experience !== "" && (
<div className="absolute left-[32%] top-[156%] text-center z-20 flex h-10 w-10 flex-col items-center justify-center rounded-full bg-white text-center shadow-lg sm:h-34 sm:w-34">        
        <span className="font-marcellus text-[30px]  leading-none text-ink-900 ">
                {dr.years_of_experience}+
              </span>

              <span className="mt-1 text-sm font-marcellus  leading-tight text-ink-800 ">
                Year
              </span>

              <span className="font-marcellus text-sm leading-tight text-ink-800 ">
                Experienced
              </span>
            </div>
          )}
        </div>
      )}

       
        <div className=" mx-auto ">
            {dr.title_1 && (
            <p className=" mb-1 text-xs font-sans italic  tracking-[0.2em] text-brand-600">
              {dr.title_1}
            </p>
          )}
         <div className="mt-3 flex items-center gap-6">

            {dr.dr_name && (
              <h2 className="text-xl font-marcellus leading-tight tracking-tight text-ink-900 sm:text-5xl">
                {dr.dr_name}
              </h2>
            )}
             {dr.certification_name && (
            <div className="flex items-center ">
              <span className="font-marcellus text-[18px] text-[#c8ab8e] ">
                {dr.certification_name}
              </span>

              {/* Check mark */}
              <span className="font-serif text-2xl mb-8 text-[#c8ab8e]">
                ✓
              </span>
            </div>
          )}
          </div>
          {dr.title_2 && (
            <h3 className="mt-4 text-[14px] font-sans text-ink-700">
              {dr.title_2}
            </h3>
          )}

         

          {dr.description && (
            <div
              className="mt-2 text-[12px] leading-relaxed text-ink-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-brand-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: dr.description }}
            />
          )}

        

        <div className="mt-1 flex items-center gap-6">
          {dr.button_text && (
            <a
              href="#"
              className="inline-block text-sm font-marcellus rounded-full bg-brand-500 px-8 py-3.5 text-base text-white shadow-xl shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500"
            > 
              {dr.button_text}
                <span className="ml-2 text-sm leading-none">→</span>

            </a>
  )}

{Number(dr.google_rating) > 0 && (
  <div className="flex items-center gap-3">
    {/* Google Icon */}
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.85-6.85C35.9 2.45 30.47 0 24 0 14.61 0 6.51 5.38 2.56 13.22l7.98 6.2C12.45 13.08 17.73 9.5 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M46.98 24.55c0-1.64-.15-3.22-.43-4.73H24v9.01h12.9c-.56 3-2.24 5.54-4.76 7.24l7.69 5.97c4.49-4.14 7.15-10.25 7.15-17.49z"
      />
      <path
        fill="#FBBC05"
        d="M10.54 28.58A14.5 14.5 0 0 1 9.77 24c0-1.59.27-3.13.77-4.58l-7.98-6.2A24 24 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.98-6.2z"
      />
      <path
        fill="#EA4335"
        d="M24 48c6.48 0 11.91-2.14 15.88-5.82l-7.69-5.97c-2.14 1.44-4.86 2.29-8.19 2.29-6.27 0-11.55-3.58-13.46-8.7l-7.98 6.2C6.51 42.62 14.61 48 24 48z"
      />
    </svg>

    {/* Rating */}
    <div>
      <div className="flex items-center gap-2">
        <StarRating
          rating={Math.min(5, Math.max(1, Number(dr.google_rating)))}
        />

        <span className="text-sm font-semibold text-ink-700">
          {dr.google_rating} / 5
        </span>
      </div>

      <p className="mt-1 text-xs text-ink-400">
        12k rating on google
      </p>
    </div>
  </div>
)}
</div>
        </div>
      </div>
    </section>
  );
}

export default DrSection;