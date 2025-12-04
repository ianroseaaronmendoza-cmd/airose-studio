import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Purpose = "Inquiry" | "Collaboration" | "Suggestion" | "Issue" | "Commission";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07060a] via-[#0b0b12] to-[#06040a] text-slate-100 antialiased">
      <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
        <SupportHero />
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          <DonationCards />
          <SupportFormCard />
        </div>
        <OtherWays />
      </div>
      <OutroSection />
    </main>
  );
}

/* ------------------------- HERO ------------------------- */
function SupportHero() {
  return (
    <header className="relative overflow-hidden rounded-2xl p-8 bg-[rgba(255,255,255,0.02)] backdrop-blur-sm border border-transparent/10 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl font-semibold text-pink-400">
            Support Airose Studio
          </h1>
          <p className="mt-3 text-slate-300">
            Your support keeps the Airose tools alive — from small fixes to new
            creative features. Whether you’d like to contribute, collab, or send
            ideas, this page is our two-way bridge.
          </p>
        </div>

        <div className="w-full lg:w-72 h-40 rounded-xl bg-gradient-to-tr from-white/3 to-white/2 border border-white/5 flex items-center justify-center px-8 py-10">
          <div className="text-center">
            <p className="text-sm text-slate-300">Current focus</p>
            <p className="mt-2 font-medium">Stability · UX · New features</p>
            <p className="mt-2 text-xs text-slate-400">Airose Official</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------- DONATION CARDS ------------------------- */
function DonationCards() {
  return (
    <section id="donate" className="space-y-6 animate-fadeUp">
      <h2 className="text-2xl font-semibold">Support Airose</h2>
      <p className="text-slate-300">
        Small contributions help keep development moving — bug fixes, hosting,
        and new experiments. Pick a method that works for you.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <DonationCard
          title="Ko-fi"
          desc="One-time or monthly tips — quick and friendly."
          href="https://ko-fi.com/airoseofficial"
          cta="Support on Ko-fi"
        />

        <DonationCard
          title="PayPal"
          desc="Direct donation for international supporters."
          href="https://paypal.me/airoseofficial"
          cta="Donate via PayPal"
        />

        <DonationCard
          title="GCash (Philippines)"
          desc="Local mobile payment — tap to view QR."
          href="#gcash"
          cta="Show GCash QR"
          isGcash
        />
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Tip: if you prefer a different method (bank transfer, crypto), mention it
        in the contact form and we’ll arrange details.
      </p>
    </section>
  );
}

function DonationCard({
  title,
  desc,
  href,
  cta,
  isGcash = false,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
  isGcash?: boolean;
}) {
  const [show, setShow] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isGcash) return;
    e.preventDefault();
    setShow(true);
  };

  return (
    <>
      <article
        className="rounded-xl p-5 bg-[rgba(255,255,255,0.02)] border border-white/6 backdrop-blur-sm
        transition-all duration-300 hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-500/10 hover:scale-[1.03]"
      >
        <h3 className="font-semibold text-pink-400">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{desc}</p>

        <div className="mt-4">
          <a
            href={href}
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-pink-500/20
              transition text-slate-100"
            target={isGcash ? undefined : "_blank"}
            rel={isGcash ? undefined : "noreferrer"}
          >
            {cta}
          </a>
        </div>
      </article>

      {isGcash && show && <GcashQrModal onClose={() => setShow(false)} />}
    </>
  );
}

/* ------------------------- GCash QR MODAL ------------------------- */
function GcashQrModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#0b0b12] border border-white/6 p-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">GCash QR</h3>
            <p className="text-sm text-slate-400 mt-1">Scan to pay Airose Official</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white text-xl">✕</button>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <img
            src="/gcash_qr.png"
            alt="GCash QR - Airose Official"
            className="w-56 h-56 object-contain rounded-lg bg-white/3 p-2"
          />
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Tip: Open your GCash app and scan this QR to send a donation.
        </p>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/6">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- SUPPORT FORM ------------------------- */
function SupportFormCard() {
  return (
    <section id="contact" className="rounded-2xl p-6 bg-[rgba(255,255,255,0.02)] border border-white/6 backdrop-blur-sm animate-fadeUp">
      <h2 className="text-2xl font-bold mb-4 text-pink-400">Contact</h2>
      <p className="text-slate-300 mt-2">
        Send inquiries, collaboration invites, commissions, or report issues.
      </p>
      <SupportForm />
    </section>
  );
}

function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("Inquiry");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => setSent(false), 5000);
      return () => clearTimeout(t);
    }
  }, [sent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !message) {
      setError("Please include at least your email and a short message.");
      return;
    }

    const to = "airoseofficial.studio@gmail.com";
    const subj = encodeURIComponent(`[${purpose}] Support from ${name || "Visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPurpose: ${purpose}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;

    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setPurpose("Inquiry");
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setPurpose("Inquiry");
    setError(null);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Name" value={name} setValue={setName} placeholder="Your Name" />
        <Input label="Email *" value={email} setValue={setEmail} placeholder="you@example.com" type="email" required />
      </div>

      <label className="block">
        <span className="text-sm text-slate-300">Purpose</span>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as Purpose)}
          className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-gray-100 focus:border-pink-400 focus:ring-pink-400 transition"
        >
          <option>Inquiry</option>
          <option>Collaboration</option>
          <option>Suggestion</option>
          <option>Issue</option>
          <option>Commission</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-slate-300">Message *</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="mt-1 w-full rounded-md bg-transparent border border-white/6 text-slate-100 focus:ring-2 focus:ring-pink-400 px-4 py-3"
          placeholder="Tell me about your idea or issue..."
        />
      </label>

      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400 transition"
        >
          Send Message
        </button>

        <button
          type="button"
          className="px-6 py-2 rounded-lg font-semibold bg-transparent border border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white transition"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      <div className="ml-auto text-sm text-slate-400">
        {sent && <span className="text-green-400">Opened mail client — please send.</span>}
        {error && <span className="text-pink-400">{error}</span>}
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md bg-transparent border border-white/6 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-pink-400 px-4 py-2"
      />
    </label>
  );
}

/* ------------------------- OTHER WAYS ------------------------- */
function OtherWays() {
  return (
    <section className="w-full mt-10 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <div className="rounded-xl p-5 bg-[rgba(255,255,255,0.01)] border border-white/6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-2 text-pink-400">Other Ways to Support</h3>
        <ul className="mt-3 text-slate-300 space-y-2 list-disc list-inside">
          <li>Star public repos on GitHub.</li>
          <li>Share Airose tools with friends or forums.</li>
          <li>Provide feedback — your use cases guide priorities.</li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------- OUTRO SECTION ------------------------- */
function OutroSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setVisible(true));
    }, { threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`mt-16 py-20 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="w-full text-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
        <div className="rounded-3xl p-10 bg-gradient-to-tr from-[#0b0510]/60 to-[#1b0b1f]/40 border border-white/6 backdrop-blur-md shadow-xl">
          <p className="text-xl sm:text-2xl leading-relaxed text-slate-100">
            <strong
  className="
    block mb-3
    bg-gradient-to-r from-pink-400 via-purple-400 to-teal-400
    bg-clip-text text-transparent
  "
>
  “Airose Studio is not just a website — it’s where creativity finds harmony.”
</strong>

            <span className="block text-slate-300 mt-2">
              Your support keeps every project alive, one spark at a time.
            </span>
          </p>
          <p className="mt-6 text-sm text-slate-400 italic">
            — <span className="not-italic">Airose Official</span>
          </p>
        </div>
      </div>
    </section>
  );
}
