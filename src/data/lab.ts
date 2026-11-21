/**
 * LAB — ideas & prototypes cards on /lab. SAMPLE content.
 */

export const labIdeas = [
  { id: "i1", title: "[SAMPLE] Idea I'm exploring", body: "[One or two lines about the idea and the question it answers]", status: "sketching" },
  { id: "i2", title: "[SAMPLE] Technical prototype", body: "[What the prototype proves or disproves]", status: "prototyping" },
  { id: "i3", title: "[SAMPLE] Engineering concept", body: "[A concept you find fascinating and want to explain]", status: "reading" },
] as const;

/** Revealed once the "classified" folder is unlocked. */
export const classified = [
  "[SAMPLE] An unannounced idea you're comfortable teasing.",
  "[SAMPLE] A prototype that failed beautifully — and what it taught you.",
  "Easter egg: the diary has a back page. Konami knows the way.",
];
