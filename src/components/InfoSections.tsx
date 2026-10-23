import { Images, Sparkles } from 'lucide-react';
import { FAQS, FEATURES, STEPS } from './content';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-12 scroll-mt-24 sm:mt-16">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-sky-500 dark:text-cyan-300" aria-hidden="true" />
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Three taps, one download
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="glass-panel relative rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="absolute right-4 top-4 text-3xl font-black text-slate-900/[0.06] dark:text-white/[0.07]">
              0{index + 1}
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-fuchsia-500/15 text-sky-600 dark:text-cyan-300">
              <step.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section id="features" className="mt-12 scroll-mt-24 sm:mt-16">
      <div className="mb-5 flex items-center gap-2">
        <Images className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-300" aria-hidden="true" />
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Built for real TikTok links
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="glass-panel rounded-3xl p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/5 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


export function Faq() {
  return (
    <section id="faq" className="mt-12 scroll-mt-24 sm:mt-16">
      <h2 className="mb-5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
        Frequently asked questions
      </h2>
      <div className="glass-panel divide-y divide-slate-900/[0.07] overflow-hidden rounded-3xl dark:divide-white/[0.07]">
        {FAQS.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-900/[0.03] dark:text-slate-100 dark:hover:bg-white/[0.03] sm:px-5">
              {faq.question}
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-900/5 text-slate-500 transition-transform group-open:rotate-45 dark:bg-white/10 dark:text-slate-300">
                +
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:px-5">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
