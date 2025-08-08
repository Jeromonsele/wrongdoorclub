// src/data/quests.ts
export type QuestType = "social" | "movement" | "photo" | "reflect" | "food";

export type QuestText = { es: string; en: string };

export type Quest = {
  id: string;
  type: QuestType;
  text: QuestText;
  vocab?: { word: string; hint: string }[]; // spanish vocab hints
  gps?: { nearVenueId?: string; radiusM?: number };
  photo?: boolean;
};

export type Pack = { id: string; name: QuestText; quests: Quest[] };

export const SEED_PACK: Pack = {
  id: "seed",
  name: { es: "Paquete base", en: "Seed Pack" },
  quests: [
    { id: "s1", type: "social", text: { es: "Pregunta a una persona vendedora por su favorito en esta cuadra.", en: "Ask a vendor for a personal favorite on this block." }, vocab: [{ word: "vendedora", hint: "vendor" }] },
    { id: "m1", type: "movement", text: { es: "Sigue la luz cálida por dos esquinas.", en: "Follow the warm light for two corners." }, vocab: [{ word: "luz", hint: "light" }] },
    { id: "p1", type: "photo", text: { es: "Toma una foto donde el ámbar se encuentre con la sombra.", en: "Capture a photo where amber meets shadow." }, photo: true, vocab: [{ word: "sombra", hint: "shadow" }] },
    { id: "r1", type: "reflect", text: { es: "Escribe tres palabras que describan tu vibra ahora.", en: "Write three words that match your current vibe." }, vocab: [{ word: "vibra", hint: "vibe" }] },
    { id: "f1", type: "food", text: { es: "Prueba un antojo callejero que no hayas probado antes.", en: "Find a street snack you have not tried before." }, vocab: [{ word: "antojo", hint: "craving, snack" }] }
  ]
};

export const EXPANSION_PACKS: Pack[] = [
  {
    id: "puertas",
    name: { es: "Puertas y Palabras", en: "Doors and Words" },
    quests: [
      { id: "pp1", type: "photo", text: { es: "Foto de una puerta que se sienta acogedora.", en: "Photo of a doorway that feels welcoming." }, photo: true, vocab: [{ word: "acogedora", hint: "cozy, welcoming" }] },
      { id: "pp2", type: "social", text: { es: "Pregunta: ¿Cuál es tu lugar favorito para café en este barrio?", en: "Ask: What is your favorite coffee spot in this neighborhood?" }, vocab: [{ word: "barrio", hint: "neighborhood" }] },
      { id: "pp3", type: "movement", text: { es: "Toma la calle menos ruidosa por una cuadra.", en: "Take the quieter side of the street for one block." }, vocab: [{ word: "ruidosa", hint: "noisy" }] }
    ]
  },
  {
    id: "calm",
    name: { es: "Esquinas Calmas", en: "Calm Corners" },
    quests: [
      { id: "c1", type: "reflect", text: { es: "Siéntate un minuto y anota tres sonidos que escuches.", en: "Sit for one minute and note the sounds you hear." }, vocab: [{ word: "sonidos", hint: "sounds" }] },
      { id: "c2", type: "movement", text: { es: "Camina por la sombra durante una cuadra.", en: "Walk in the shade for one block." }, vocab: [{ word: "sombra", hint: "shade" }] }
    ]
  },
  {
    id: "spice",
    name: { es: "Ruta de Sabor", en: "Spice Route" },
    quests: [
      { id: "sp1", type: "food", text: { es: "Prueba una salsa que sueles evitar.", en: "Try a salsa level you usually avoid." }, vocab: [{ word: "salsa", hint: "sauce" }] },
      { id: "sp2", type: "social", text: { es: "Pregunta por un tip local para música en vivo esta noche.", en: "Ask for a local tip for live music tonight." }, vocab: [{ word: "tip", hint: "recommendation" }] }
    ]
  }
];

