export type Quest = {
  id: string;
  type: "social" | "movement" | "photo" | "reflect" | "food";
  text: string;
  gps?: { nearVenueId?: string; radiusM?: number };
  photo?: boolean;
};

export type Pack = { id: string; name: string; quests: Quest[] };

export const SEED_PACK: Pack = {
  id: "seed",
  name: "Seed Pack",
  quests: [
    {
      id: "s1",
      type: "social",
      text: "Ask a barista or vendor for a personal favorite in this block."
    },
    { id: "m1", type: "movement", text: "Follow the warmest light for two corners." },
    {
      id: "p1",
      type: "photo",
      text: "Frame a photo where amber meets shadow.",
      photo: true
    },
    {
      id: "r1",
      type: "reflect",
      text: "Write three words that match your current vibe."
    },
    {
      id: "f1",
      type: "food",
      text: "Find a street snack you have not tried before."
    }
  ]
};

export const EXPANSION_PACKS: Pack[] = [
  {
    id: "street",
    name: "Street Color",
    quests: [
      { id: "st1", type: "photo", text: "Photo of a doorway that feels welcoming.", photo: true },
      { id: "st2", type: "movement", text: "Turn left where you would usually turn right." },
      { id: "st3", type: "social", text: "Compliment someone’s shoes with a smile." }
    ]
  },
  {
    id: "calm",
    name: "Calm Corners",
    quests: [
      { id: "c1", type: "reflect", text: "Sit for one minute and note the sounds you hear." },
      { id: "c2", type: "movement", text: "Walk the quieter side of the street for one block." }
    ]
  },
  {
    id: "spice",
    name: "Spice Route",
    quests: [
      { id: "sp1", type: "food", text: "Try a salsa level you usually avoid." },
      { id: "sp2", type: "social", text: "Ask for a local tip for live music tonight." }
    ]
  }
];

