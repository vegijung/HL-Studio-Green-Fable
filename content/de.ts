import type { SiteContent } from "./types";

/**
 * All German copy. Source: BRIEF.md section 7, used verbatim.
 * Swiss orthography: "ss" not "ß", numbers as CHF 1'000.
 */
export const de: SiteContent = {
  meta: {
    siteName: "HL Studio",
    title: "HL Studio — KI-Agentur im Oberwallis",
    description:
      "Websites, Automationen und Backoffice für Unternehmen im Oberwallis. In Tagen statt Monaten, zum Fixpreis.",
  },

  nav: {
    links: [
      { label: "Leistungen", href: "/#leistungen" },
      { label: "Cases", href: "/#cases" },
      { label: "Preise", href: "/#preise" },
      { label: "Team", href: "/#team" },
    ],
    cta: "Termin buchen",
  },

  hero: {
    label: "KI-Agentur · Oberwallis",
    h1: "Digitale Werkzeuge für dein Unternehmen.\nIn Tagen, nicht Monaten.",
    sub: "HL Studio baut Websites, Automationen und Backoffice-Lösungen für Betriebe im Oberwallis. Agenturqualität zum Fixpreis, weil wir mit den Werkzeugen von heute bauen statt mit Stundenbudgets.",
    ctaPrimary: "Termin buchen",
    ctaSecondary: { label: "Leistungen ansehen", href: "#leistungen" },
    tagline: "KI fer es fortgschrittus moro.",
  },

  facts: [
    { value: "5 Tage", label: "vom Briefing bis zum Livegang deiner Website" },
    { value: "ab CHF 1'000", label: "für eine komplette Website" },
    { value: "DE + EN", label: "zweisprachig inklusive, weitere Sprachen auf Anfrage" },
    { value: "CH", label: "Hosting und Daten in der Schweiz" },
    { value: "2", label: "Ansprechpersonen. Dieselben zwei, die bauen." },
    { value: "Brig", label: "vor Ort im Oberwallis, auch bei dir im Betrieb" },
  ],

  services: {
    label: "Leistungen",
    h2: "Von der Website bis zur Buchhaltung.",
    text: "Vier Bereiche, ein Team. Du bekommst keine Agentur mit zwölf Ansprechpersonen, sondern zwei Leute, die alles selbst bauen.",
    usps: [
      {
        title: "Fixpreis",
        text: "Du weisst vor dem Start, was es kostet und wann es fertig ist. Keine Stundenbudgets, keine Überraschungen.",
      },
      {
        title: "In Tagen, nicht Monaten",
        text: "Eine Website in fünf Arbeitstagen, eine Automation in zwei bis drei Wochen. Wir bauen mit den Werkzeugen von heute.",
      },
      {
        title: "Zwei, die selbst bauen",
        text: "Du sprichst vom ersten Gespräch bis zum Livegang mit denselben zwei Leuten, die deine Lösung umsetzen.",
      },
      {
        title: "Aus dem Oberwallis",
        text: "Vor Ort in Brig und bei dir im Betrieb, wenn es hilft. Hosting und Daten bleiben in der Schweiz.",
      },
    ],
    items: [
      {
        slug: "websites",
        index: "01",
        name: "Websites & Marketing",
        headline: "Deine neue Website. In fünf Arbeitstagen.",
        text: "Auf Deutsch und Englisch, mit Buchung oder Kontakt angebunden, in der Schweiz gehostet. Dazu Texte und Newsletter, wenn du es willst.",
        detail:
          "Du bringst Logo und Inhalte, wir bringen Struktur, Text und Gestaltung. Nach fünf Arbeitstagen ist die Website online, zweisprachig und auf jedem Gerät lesbar. Danach pflegen wir sie im Abo, wenn du willst.",
        points: [
          "Konzept, Texte und Design aus einer Hand",
          "Buchung, Kontakt oder Shop direkt angebunden",
          "Gefunden werden: Google-Eintrag und SEO inklusive",
        ],
        tags: ["Website", "Onlineshop", "SEO", "Newsletter"],
        link: { label: "Ab CHF 1'000 → Preise", href: "/#preise" },
      },
      {
        slug: "automationen",
        index: "02",
        name: "Automationen",
        headline: "Die KI schlägt vor. Du entscheidest.",
        text: "Abläufe, die dich jeden Tag Zeit kosten, laufen automatisch: Anfragen beantworten, Offerten erstellen, Bewertungen bearbeiten.",
        detail:
          "Wir schauen uns an, was dich jeden Tag Zeit kostet, und bauen den Ablauf so, dass er ohne dich läuft. Du behältst die Kontrolle: Nichts geht raus, was du nicht freigegeben hast.",
        points: [
          "Läuft in deinen bestehenden Tools: Mail, WhatsApp, Buchhaltung",
          "Die KI schlägt vor, du prüfst mit einem Klick",
          "Umsetzung in zwei bis drei Wochen, danach Schulung deines Teams",
        ],
        tags: ["Anfragen-Assistent", "Offerten", "Bewertungen", "Termine"],
      },
      {
        slug: "backoffice",
        index: "03",
        name: "Backoffice",
        headline: "Das Büro, das sich nicht stapelt.",
        text: "Belege, Mahnungen, Terminplanung, Rapporte: Wir richten die Systeme ein und übernehmen im Abo, was du nicht selbst machen willst.",
        detail:
          "Wir richten die Systeme ein und übernehmen laufend, was liegen bleibt. Du siehst jederzeit, was erledigt ist, und entscheidest, was du weiterhin selbst machen willst.",
        points: [
          "Belege und Rechnungen werden gelesen, zugeordnet und vorerfasst",
          "Mahnwesen und Terminplanung laufen im Hintergrund",
          "Im Abo, mit Antwort am selben Arbeitstag",
        ],
        tags: ["Belege", "Rechnungen", "Mahnwesen", "Terminplanung", "CRM"],
      },
      {
        slug: "beratung-schulung",
        index: "04",
        name: "Beratung & Schulung",
        headline: "Erst verstehen, dann automatisieren.",
        text: "Eine halbtägige KI-Schulung für dein Team. Oder ein Workshop, der klärt, welche Abläufe sich bei dir automatisieren lassen und welche nicht.",
        detail:
          "Kein Vortrag, sondern Arbeit an deinen eigenen Abläufen. Am Ende weisst du, welche drei Dinge du zuerst angehst, was sie kosten und was sie dir bringen.",
        points: [
          "Ein halber Tag, in deinem Betrieb, mit deinen Beispielen",
          "Eine klare Antwort, was sich bei dir lohnt und was nicht",
          "Eine Empfehlung für Werkzeuge, die zu deiner Grösse passen",
        ],
        tags: ["KI-Schulung", "Prozess-Check", "Tool-Auswahl"],
      },
    ],
  },

  cases: {
    label: "Cases",
    h2: "Was sich messbar ändert.",
    text: "Drei typische Ausgangslagen aus dem Oberwallis und was eine Lösung bewirkt. Die Zahlen stammen aus unseren Demo-Projekten, nicht aus Kundendaten.",
    items: [
      {
        sector: "Hotel · Zermatt (Beispiel)",
        title: "Gästeanfragen in vier Sprachen beantworten",
        before: { value: "45 min", label: "pro Tag, manuell" },
        after: { value: "5 min", label: "pro Tag, prüfen und senden" },
        text: "Ein Assistent liest Mail, WhatsApp und Booking-Nachrichten und schlägt Antworten im Ton des Hauses vor.",
      },
      {
        sector: "Handwerk · Visp (Beispiel)",
        title: "Offerte direkt von der Baustelle",
        before: { value: "3 Tage", label: "bis zur Offerte" },
        after: { value: "20 min", label: "von der Sprachnotiz zum PDF" },
        text: "Sprachnotiz aufnehmen, Positionen werden erkannt und im Firmentemplate als Offerte ausgegeben.",
      },
      {
        sector: "Treuhand · Brig (Beispiel)",
        title: "Belege sortieren und zuordnen",
        before: { value: "6 h", label: "pro Woche" },
        after: { value: "30 min", label: "pro Woche, Kontrolle" },
        text: "Eingehende Belege werden gelesen, dem Mandanten zugeordnet und in der Buchhaltung vorerfasst.",
      },
    ],
  },

  prices: {
    label: "Preise",
    h2: "Fixpreise. Keine Stundenrechnung.",
    text: "Du weisst vor dem Start, was es kostet und wann es fertig ist.",
    columns: [
      {
        name: "Website",
        price: "CHF 1'000",
        period: "einmalig",
        lead: "Neue Website, zweisprachig, in fünf Tagen",
        features: [
          "Konzept, Texte und Design",
          "Deutsch und Englisch",
          "Buchung oder Kontakt angebunden",
          "Hosting in der Schweiz, erstes Jahr inklusive",
          "Livegang nach 5 Arbeitstagen",
        ],
        cta: { label: "Termin buchen", solid: true },
      },
      {
        name: "Automation",
        price: "CHF 900",
        period: "pro Projekt",
        lead: "Ein Ablauf, komplett automatisiert",
        features: [
          "Analyse des Ablaufs vor Ort",
          "Umsetzung in 2–3 Wochen",
          "Anbindung an Mail, WhatsApp, Buchhaltung",
          "Schulung deines Teams",
          "30 Tage Nachbetreuung",
        ],
        cta: { label: "Termin buchen", solid: false },
      },
      {
        name: "Backoffice-Abo",
        price: "CHF 290",
        period: "pro Monat",
        lead: "Wir übernehmen das Büro laufend",
        features: [
          "Pflege und Hosting der Website",
          "Belege, Rechnungen, Mahnwesen",
          "Newsletter und ein Social-Post pro Woche",
          "Eine Automation-Stunde pro Monat",
          "Antwort am selben Arbeitstag",
        ],
        cta: { label: "Termin buchen", solid: false },
      },
    ],
    footnote: "Alle Preise exkl. MWST. Grössere Projekte auf Anfrage.",
  },

  team: {
    label: "Team",
    h2: "Zwei Gründer, beide aus dem Oberwallis.",
    text: "Studium an der Universität St. Gallen, über zwei Jahre tägliche Arbeit mit KI-Werkzeugen in Projekten und Unternehmen. Jetzt zurück in der Region.",
    members: [
      {
        name: "Janis Locher",
        role: "Beratung & Kunden",
        // Platzhalter-Satz, Entwurf. Bitte prüfen.
        text: "Klärt mit dir, was sich lohnt, und bleibt bis zum Livegang deine Ansprechperson.",
        image: "/team/janis.png",
        alt: "Porträt von Janis Locher",
      },
      {
        name: "Raphael Hildbrand",
        role: "Technik & Umsetzung",
        // Platzhalter-Satz, Entwurf. Bitte prüfen.
        text: "Baut Websites und Automationen selbst, von der ersten Zeile bis zum Hosting in der Schweiz.",
        image: "/team/raphael.png",
        alt: "Porträt von Raphael Hildbrand",
      },
    ],
  },

  contact: {
    statement: "30 Minuten reichen für eine ehrliche Einschätzung.",
    text: "Wir schauen deine Ausgangslage an und sagen dir, was sich lohnt und was nicht. Unverbindlich, online oder bei dir im Betrieb.",
    cta: "Termin buchen",
    channelLabels: {
      whatsapp: "WhatsApp",
      email: "E-Mail",
      phone: "Telefon",
    },
  },

  footer: {
    madeIn: "Made in Oberwallis",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
    copyright: "© 2026 HL Studio",
  },

  subpages: {
    back: "Zurück zur Startseite",
    servicePriceLink: { label: "Preise ansehen", href: "/#preise" },
    serviceCta: "Termin buchen",
  },

  legal: {
    impressum: {
      title: "Impressum",
      intro: "Platzhalter. Die Angaben werden vor dem Livegang ergänzt.",
      sections: [
        {
          heading: "Verantwortlich für den Inhalt",
          body: [
            "HL Studio",
            "[Strasse und Nummer]",
            "[PLZ] Brig, Schweiz",
            "[UID-Nummer]",
          ],
        },
        {
          heading: "Kontakt",
          body: ["[E-Mail]", "[Telefon]"],
        },
        {
          heading: "Haftungsausschluss",
          body: [
            "Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr. Haftungsansprüche wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff oder der Nutzung dieser Website entstehen, sind ausgeschlossen.",
          ],
        },
      ],
    },
    datenschutz: {
      title: "Datenschutz",
      intro: "Platzhalter. Die Datenschutzerklärung wird vor dem Livegang ergänzt.",
      sections: [
        {
          heading: "Verantwortliche Stelle",
          body: ["HL Studio, [Strasse und Nummer], [PLZ] Brig, Schweiz."],
        },
        {
          heading: "Hosting",
          body: [
            "Diese Website wird bei [Hosting-Anbieter] gehostet. Beim Aufruf werden technisch notwendige Daten wie IP-Adresse, Zeitpunkt und aufgerufene Seite in Server-Logs gespeichert.",
          ],
        },
        {
          heading: "Kontaktaufnahme",
          body: [
            "Wenn du uns per E-Mail, Telefon oder WhatsApp kontaktierst, verarbeiten wir deine Angaben zur Bearbeitung der Anfrage. Die Daten werden nicht an Dritte weitergegeben.",
          ],
        },
        {
          heading: "Cookies und Analyse",
          body: [
            "Diese Website setzt keine Tracking-Cookies und verwendet keine Analysewerkzeuge von Drittanbietern.",
          ],
        },
      ],
    },
  },
};
