import {
  CalendarClock,
  Gauge,
  MountainSnow,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wrench,
  Wind,
} from 'lucide-react';

import { EstimateForm } from '@/components/estimate-form';

const services = [
  {
    icon: Wrench,
    title: 'HVAC repair',
    description:
      'Clear diagnostics and practical repair options for heating and cooling issues.',
  },
  {
    icon: Gauge,
    title: 'System replacement',
    description:
      'Right-sized equipment recommendations built around your home and budget.',
  },
  {
    icon: CalendarClock,
    title: 'Preventive maintenance',
    description:
      'Seasonal tune-ups that help your system run reliably and efficiently.',
  },
  {
    icon: Wind,
    title: 'Indoor air quality',
    description:
      'Thoughtful assessments for cleaner air and more comfortable rooms.',
  },
];

const credibility = [
  {
    icon: ShieldCheck,
    title: 'Licensed & insured',
    copy: 'Professional care for your home.',
  },
  {
    icon: ReceiptText,
    title: 'Upfront estimates',
    copy: 'Options explained before work begins.',
  },
  {
    icon: CalendarClock,
    title: 'Flexible scheduling',
    copy: 'Timing that works around your day.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#082b3d]/95 text-white backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            className="group flex items-center gap-3"
            aria-label="Summit Home Services, back to top"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#f98b45] text-[#082b3d] shadow-[0_7px_22px_rgba(249,139,69,0.28)] transition-transform group-hover:-translate-y-0.5">
              <MountainSnow
                aria-hidden="true"
                className="size-6"
                strokeWidth={2.25}
              />
            </span>
            <span className="leading-none">
              <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#8ed8e8]">
                Summit
              </span>
              <span className="mt-1 block text-sm font-semibold tracking-wide text-white">
                Home Services
              </span>
            </span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex"
          >
            <a className="transition-colors hover:text-white" href="#services">
              Services
            </a>
            <a
              className="transition-colors hover:text-white"
              href="#why-summit"
            >
              Why Summit
            </a>
            <a
              className="rounded-full border border-white/25 px-4 py-2 text-white transition-colors hover:border-[#f98b45] hover:bg-[#f98b45] hover:text-[#082b3d]"
              href="#estimate"
            >
              Request an estimate
            </a>
          </nav>

          <a
            className="rounded-full bg-[#f98b45] px-4 py-2 text-sm font-bold text-[#082b3d] md:hidden"
            href="#estimate"
          >
            Get an estimate
          </a>
        </div>
      </header>

      <section id="top" className="relative isolate bg-[#082b3d] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_5%,rgba(82,191,214,0.2),transparent_35%),linear-gradient(135deg,#082b3d_0%,#0b3b50_58%,#0b3345_100%)]" />
        <div className="absolute -left-28 top-32 -z-10 size-80 rounded-full border border-[#8ed8e8]/10" />
        <div className="absolute -left-16 top-44 -z-10 size-56 rounded-full border border-[#8ed8e8]/10" />

        <div className="mx-auto grid max-w-[90rem] items-start gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(34rem,0.84fr)] lg:px-12 lg:py-20">
          <div className="max-w-[43rem] pt-2 lg:pt-8">
            <p className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#8ed8e8]">
              <Sparkles aria-hidden="true" className="size-4 text-[#f98b45]" />
              Residential heating & cooling
            </p>
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.6rem]">
              Your home should feel right in every season.
            </h1>
            <p className="mt-7 max-w-[36rem] text-lg leading-8 text-[#d8eef3] sm:text-xl">
              Tell us what is happening. We will help you understand the next
              step, from a quick repair to a complete comfort upgrade.
            </p>

            <figure className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/15 bg-[#0b3447] shadow-[0_32px_80px_rgba(0,0,0,0.28)] sm:mt-12">
              <img
                src="/summit-hvac-technician.webp"
                alt="HVAC technician inspecting an outdoor home comfort system"
                width="1536"
                height="1024"
                fetchPriority="high"
                className="aspect-[16/9] w-full object-cover object-[58%_58%]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061e2a]/95 via-[#061e2a]/55 to-transparent px-6 pb-5 pt-16 sm:px-8 sm:pb-7">
                <figcaption className="text-sm font-semibold tracking-wide text-white/95">
                  Thoughtful service. Clear next steps.
                </figcaption>
              </div>
            </figure>
          </div>

          <div id="estimate" className="scroll-mt-28">
            <EstimateForm />
          </div>
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-20 bg-[#f3f8f9] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c95d24]">
                Services
              </p>
              <h2 className="mt-3 max-w-[12ch] text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#082b3d] sm:text-5xl">
                Comfort care for the whole system.
              </h2>
            </div>
            <p className="max-w-[38rem] text-lg leading-8 text-[#496572] lg:justify-self-end">
              Whether your system stopped working or you are planning ahead,
              start with the service that best matches your home.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] border border-[#c7dde2] bg-[#c7dde2] sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, description }) => (
              <article key={title} className="bg-white p-7 sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#e7f5f7] text-[#0b6075]">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-7 text-lg font-bold text-[#082b3d]">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-[#58717c]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="why-summit"
        className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-[90rem]">
          <div className="rounded-[2rem] bg-[#0b3b50] px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8ed8e8]">
                  Why Summit
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Confidence from the first conversation.
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-3">
                {credibility.map(({ icon: Icon, title, copy }) => (
                  <div key={title}>
                    <Icon
                      aria-hidden="true"
                      className="size-6 text-[#f98b45]"
                    />
                    <h3 className="mt-4 font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#c6e3e9]">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d9e7ea] bg-white px-5 py-8 text-sm text-[#637b84] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Summit Home Services</p>
          <p>Fictional company created for a portfolio demonstration.</p>
        </div>
      </footer>
    </main>
  );
}
