/**
 * The /music page. Covers and photos are optional: put image files in
 * public/images/albums/ or public/images/guitar/ and set the path, e.g.
 * cover: "/images/albums/lateralus.jpg". Empty = a hand-made placeholder sleeve.
 * Use only images you have the right to use (your own photos, or art you're allowed to show).
 */

export type Album = {
  title: string;
  artist: string;
  year: string;
  /** Path under public/, e.g. "/images/albums/madvillainy.jpg". */
  cover: string;
  /** Sleeve colour for the placeholder. */
  color: string;
  /** Your note — why it matters to you. */
  note: string;
};

export const albums: Album[] = [
  { title: "Lateralus", artist: "Tool", year: "2001", cover: "", color: "#477BFF", note: "odd time signatures, and a title track built on the Fibonacci sequence." },
  { title: "Madvillainy", artist: "Madvillain", year: "2004", cover: "", color: "#FF755E", note: "Madlib beats and DOOM verses: 22 tracks in 46 minutes." },
  { title: "To Pimp a Butterfly", artist: "Kendrick Lamar", year: "2015", cover: "", color: "#9DDC8B", note: "jazz, funk and spoken word that only works front to back." },
];

/** The record on the platter — one from the crate above. */
export const nowPlaying = {
  track: "Lateralus",
  artist: "Tool",
  album: "Lateralus (2001)",
  note: "front to back. the only way to play it.",
};

/** The sticky note next to the turntable. */
export const onRepeat: string[] = ["Lateralus — Tool", "Madvillainy — Madvillain", "To Pimp a Butterfly — Kendrick Lamar"];

/**
 * The guitar corner. Photos: put files in public/images/guitar/ and set src.
 * `learning` and `gear` stay hidden on the page until they're filled in.
 */
export const guitar = {
  photos: [
    { src: "", caption: "me + guitar", back: "one of the best guitarists in college — says my own GitHub README." },
    { src: "", caption: "practice corner", back: "where the chess engines get a break." },
  ],
  learning: "",
  gear: "",
};
