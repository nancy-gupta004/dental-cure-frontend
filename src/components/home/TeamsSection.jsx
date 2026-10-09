import { useEffect, useState } from "react";
import { getTeams } from "../../services/home/teamService";
import { resolveMediaUrl } from "../../utils/media";

function TeamsSection() {
  const [section, setSection] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    getTeams()
      .then((data) => {
        setSection(data.section || {});
        setMembers(data.members || []);
      })
      .catch(() => setSection(null));
  }, []);

  if (
    !section ||
    (!section.title_1 && !section.heading && !section.button_text && members.length === 0)
  ) {
    return null;
  }

  const headingWords = (section.heading || "").trim().split(" ");
  const hasSplittableHeading = headingWords.length >= 3;

  return (
   <section className="relative -top-24 overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
  <div className="mx-auto w-full max-w-6xl">
        {/* Title + Heading (left) and Button (right) */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {section.title_1 && (
              <p className="text-sm font-sans italic text-brand-500">
                {section.title_1}
              </p>
            )}

            {section.heading && (
              <h2 className="mt-3 text-4xl font-marcellus leading-tight tracking-tight text-ink-900 sm:text-5xl">
                {hasSplittableHeading ? (
                  <>
                    {headingWords.slice(0, -2).join(" ")}{" "}
        <span className="text-brand-400">
          {headingWords[headingWords.length - 2]}
        </span>{" "}
        {headingWords[headingWords.length - 1]}
                  </>
                ) : (
                  section.heading
                )}
              </h2>
            )}
          </div>

          {section.button_text && (
            <a
              href={section.button_link || "#"}
              className="inline-flex shrink-0 w-[173px] h-[48px] items-center gap-2 self-start rounded-full bg-brand-500 px-8 py-3.5 text-[13px] font-marcellus text-white shadow-xl shadow-brand-900/20 transition hover:from-brand-300 hover:to-brand-500 lg:self-end"
            >
              {section.button_text}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Team member cards */}
        {members.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <article key={member.id} className="group">
                  {member.image_url ? (
                    <img
                      src={resolveMediaUrl(member.image_url)}
                      alt={member.name || "Team member"}
                  className="mx-auto aspect-[4/5] w-[100%] object-cover rounded-[1rem] h-[24rem] transition-transform duration-500 ease-out group-hover:scale-90"/>
                  
                  ) : (
                    <div className="aspect-[4/5] w-full bg-brand-100" />
                  )}

                {member.name && (
                  <h3 className="mt-2  mr-2 font-marcellus leading-tight text-ink-900 sm:text-1xl">
                    {member.name}
                  </h3>
                )}

                {member.designation && (
                  <p className="mt-1.5 text-sm italic font-manrope  text-brand-500">
                    {member.designation}
                  </p>
                )}
              </article>
            ))}
            
          </div>
        )}
      </div>
    </section>
  );
}

export default TeamsSection;