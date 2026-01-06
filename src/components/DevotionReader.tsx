interface Props {
  title: string;
  data: any;
}

export default function DevotionReader({ title, data }: Props) {
  return (
    <article className="max-w-2xl mx-auto px-5 pt-12 pb-24 rounded-2xl bg-[#111]/60 border border-gray-800 shadow-md backdrop-blur-sm">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-serif font-bold mb-1 text-pink-400">
          {title}
        </h1>
        <p className="text-neutral-400">{data.displayDate}</p>
      </header>

      <section className="mb-10 text-center">
        <blockquote className="italic font-serif text-lg text-neutral-200">
          “{data.verse.text}”
        </blockquote>
        <div className="mt-2 text-sm text-neutral-400">
          — {data.verse.reference}
        </div>
      </section>

      <section className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
        {data.text}
      </section>
    </article>
  );
}
