import ToothMark from "../ToothMark";

const features = [
  "Compassionate, expert dentists",
  "Secure patient records",
  "Convenient appointment booking",
];

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-white px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-105 w-105 rounded-full bg-brand-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-56 w-56 rounded-full bg-white/70 blur-2xl" />

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-brand-400/30 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-300 via-brand-200 to-brand-100 p-10 lg:flex">
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-[24px] border-white/30" />
          <div className="pointer-events-none absolute -left-16 top-16 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute bottom-1/3 right-8 h-24 w-24 text-brand-500/30">
            <ToothMark className="h-full w-full fill-brand-600" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-lg shadow-brand-400/20">
              <ToothMark className="h-6 w-6 fill-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-brand-800">The Dental Cure</p>
              <p className="text-xs text-brand-700/80">Modern dentistry, gentle care</p>
            </div>
          </div>

          <div className="relative">
            <h1 className="text-4xl font-semibold leading-tight text-brand-900">
              Your healthiest smile starts with the right care.
            </h1>
            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-brand-800">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/70">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-brand-700">
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="relative rounded-2xl bg-white/60 p-5 backdrop-blur-sm">
            <p className="text-sm italic leading-relaxed text-brand-800">
              "The most welcoming dental experience I've ever had."
            </p>
            <footer className="mt-2 text-xs font-medium text-brand-700">
              — Priya S., Patient
            </footer>
          </blockquote>
        </div>

        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-200">
                <ToothMark className="h-6 w-6 fill-brand-700" />
              </div>
              <span className="text-lg font-semibold text-brand-800">The Dental Cure</span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-ink-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;