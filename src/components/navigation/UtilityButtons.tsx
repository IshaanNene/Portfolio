"use client";

import { Sticker, Volume2, VolumeX } from "lucide-react";
import { setSoundEnabled, useSoundEnabled } from "@/lib/sound";
import { useStickerSheet } from "@/components/eggs/StickerLayer";

export function UtilityButtons() {
  const sound = useSoundEnabled();
  const { open, toggle } = useStickerSheet();
  return (
    <>
      <button
        type="button"
        onClick={() => setSoundEnabled(!sound)}
        aria-pressed={sound}
        aria-label={sound ? "Turn sound effects off" : "Turn sound effects on"}
        title={sound ? "Sound on" : "Sound off"}
        className="brutal-sm grid h-9 w-9 place-items-center bg-paper transition-transform hover:rotate-6"
      >
        {sound ? <Volume2 className="h-4 w-4" strokeWidth={2.5} /> : <VolumeX className="h-4 w-4" strokeWidth={2.5} />}
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={open}
        aria-label="Open sticker sheet"
        title="Stickers"
        className="brutal-sm grid h-9 w-9 place-items-center bg-sun transition-transform hover:-rotate-6"
      >
        <Sticker className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </>
  );
}
