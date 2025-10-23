// data/writings.ts

// ✨ Poems
export const poems = [
  {
    slug: "the-still-voice",
    title: "The Still Voice",
    date: "2025-10-10",
    excerpt: "A whisper in the calm of midday — a small surrender.",
    content: `The still voice calls
Beneath the clamor of my days—
I lean in, listen.`
  },
  {
    slug: "dawn-prayer",
    title: "Dawn Prayer",
    date: "2025-07-02",
    excerpt: "Morning and the small liturgies.",
    content: `There is a light in the kettle's steam,
A soft liturgy of boiling water.`
  },
  {
    slug: "beneath-the-fig-tree",
    title: "Beneath the Fig Tree",
    date: "2025-02-15",
    excerpt: "A moment of stillness beneath wide leaves.",
    content: `I sat beneath the fig tree
And time folded over me
Like a quiet blanket of light.`
  }
];

// ✨ Blogs
export const blogs = [
  {
    slug: "why-i-make-music",
    title: "Why I Make Music",
    date: "2025-08-20",
    excerpt: "A reflection on calling, craft, and the stories that shape us.",
    content: `I started making music long before I understood what it meant to write.
Music became a way to tell truths I couldn’t say aloud.

Over the years, I’ve realized it’s not just about sound —
it’s about building bridges between hearts.`
  },
  {
    slug: "tools-i-use",
    title: "Tools I Use (2025)",
    date: "2025-09-11",
    excerpt: "The current setup that helps me stay creative and efficient.",
    content: `Here are some tools I use daily:
- Ableton Live for production
- Notion for planning
- Canva for quick visual work
- DaVinci Resolve for video editing

What matters most isn’t the tools — it’s the consistency.`
  },
  {
    slug: "creativity-in-silence",
    title: "Creativity in Silence",
    date: "2025-04-05",
    excerpt: "Sometimes inspiration grows in stillness, not noise.",
    content: `In silence, I remember how small ideas begin —
not with thunder, but with the faint hum of being alive.

Art blooms when we give it room to breathe.`
  }
];

// ✨ Novels
export const novels = [
  {
    slug: "lost-sky",
    title: "Lost Sky",
    description: "A contemporary novel about two strangers crossing a city and a season of change.",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Chapter 1 — The Photograph",
        content: `She found the photograph under a stack of unpaid bills.
It wasn’t supposed to mean anything — but it did.`
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "Chapter 2 — The Bus Ride",
        content: `The bus spilled them into a late autumn street.
The sky, dim and heavy, felt like it was breathing.`
      },
      {
        number: 3,
        slug: "chapter-3",
        title: "Chapter 3 — A Name Remembered",
        content: `He kept the ticket stub and forgot to throw it away.
Names fade slower than memory.`
      }
    ]
  },
  {
    slug: "the-long-night",
    title: "The Long Night",
    description: "A story about loss, hope, and rediscovering the light after the storm.",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Chapter 1 — The Silence",
        content: `It had been forty days since the storm passed,
but the quiet still roared louder than before.`
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "Chapter 2 — Faint Lights",
        content: `In the city’s edge, one lamp still burned.
She followed it, unsure if it led home or nowhere.`
      }
    ]
  }
];

// ✨ Export everything together
export default {
  poems,
  blogs,
  novels
};
