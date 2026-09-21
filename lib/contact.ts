import { contact, type ContactChannel } from "@/content/contact";

const order: ContactChannel[] = ["whatsapp", "email", "phone"];

export function channelHref(channel: ContactChannel): string {
  switch (channel) {
    case "email":
      return `mailto:${contact.email}`;
    case "phone":
      return `tel:${contact.phone.replace(/\s+/g, "")}`;
    case "whatsapp":
      return `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`;
  }
}

/** the value shown to the user for a channel */
export function channelValue(channel: ContactChannel): string {
  switch (channel) {
    case "email":
      return contact.email;
    case "phone":
      return contact.phone;
    case "whatsapp":
      return contact.whatsapp;
  }
}

/** href of the primary "Termin buchen" call to action */
export function primaryHref(): string {
  return channelHref(contact.primaryChannel);
}

/** the channels that are not the primary one, in a stable order */
export function secondaryChannels(): ContactChannel[] {
  return order.filter((c) => c !== contact.primaryChannel);
}
