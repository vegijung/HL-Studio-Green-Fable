/**
 * Contact configuration. The CTA component and the footer read from here.
 * All values are placeholders until the channel and the numbers are decided.
 */
export type ContactChannel = "whatsapp" | "email" | "phone";

export const contact = {
  /** which channel "Termin buchen" opens */
  primaryChannel: "email" as ContactChannel,
  email: "hallo@example.ch",
  phone: "+41 27 000 00 00",
  whatsapp: "+41 79 000 00 00",
  place: "Brig, Oberwallis",
};

export type Contact = typeof contact;
