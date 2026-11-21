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
  { title: "Lateralus", artist: "Tool", year: "2001", cover: "", color: "#477BFF", note: "[PLACEHOLDER] why this one stuck with you" },
  { title: "Madvillainy", artist: "Madvillain", year: "2004", cover: "", color: "#FF755E", note: "[PLACEHOLDER] favourite track + why" },
  { title: "To Pimp a Butterfly", artist: "Kendrick Lamar", year: "2015", cover: "", color: "#9DDC8B", note: "[PLACEHOLDER] what it means to you" },
  { title: "[Album]", artist: "[Artist]", year: "[YYYY]", cover: "", color: "#FFD84D", note: "[PLACEHOLDER] another favourite" },
  { title: "[Album]", artist: "[Artist]", year: "[YYYY]", cover: "", color: "#FFB3C7", note: "[PLACEHOLDER] one more for the crate" },
];

/** What's on the turntable. */
export const nowPlaying = {
  track: "[Track]",
  artist: "[Artist]",
  album: "[Album]",
  note: "[PLACEHOLDER] on repeat this week",
};

/** Small "currently listening" list on a sticky note. */
export const onRepeat: string[] = ["[Track] — [Artist]", "[Track] — [Artist]", "[Track] — [Artist]"];

/** The guitar corner. Photos: put files in public/images/guitar/ and set src. */
export const guitar = {
  photos: [
    { src: "", caption: "me + guitar", back: "[PLACEHOLDER] a note about this photo" },
    { src: "", caption: "practice corner", back: "[PLACEHOLDER] where you play" },
  ],
  learning: "[PLACEHOLDER] a song or technique you're learning",
  gear: "[PLACEHOLDER] your guitar",
};
