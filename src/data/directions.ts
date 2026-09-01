import canvasImage from "../assets/canvas.png";
import islandsImage from "../assets/islands.png";
import miniAppImage from "../assets/mini-app.png";
import questionsImage from "../assets/questions.png";

export type Accent = "violet" | "blue" | "cyan";

export interface Direction {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: typeof questionsImage;
  imageAlt: string;
  points: string[];
  accent: Accent;
  href?: string;
  buttonLabel?: string;
  buttonEyebrow?: string;
  featured?: boolean;
  revealGate?: "all-directions";
}

export interface DirectionPanel {
  id: string;
  number: string;
  title: string;
  kicker: string;
  image: typeof canvasImage;
  imageAlt: string;
  description: string;
  note: string;
  capabilities: string[];
  examples: Array<{ label: string; href: string }>;
  accent: Accent;
}

export const directions: Direction[] = [
  {
    id: "canvas",
    number: "01",
    title: "CANVAS",
    eyebrow: "Interaktywne doświadczenia",
    summary:
      "Efektowne, płynne interfejsy, które przyciągają uwagę i pozwalają opowiadać poprzez ruch.",
    image: questionsImage,
    imageAlt: "Neonowe znaki zapytania ukryte pod efektem PixiJS",
    points: ["Pixi.js", "Three.js", "GSAP.js"],
    accent: "violet",
  },
  {
    id: "islands",
    number: "02",
    title: "ISLANDS",
    eyebrow: "HTML + interaktywne wyspy",
    summary:
      "Statyczna, szybka strona wzbogacona o interaktywność dokładnie tam, gdzie jest potrzebna.",
    image: questionsImage,
    imageAlt: "Neonowe znaki zapytania ukryte pod efektem PixiJS",
    points: ["SEO-friendly HTML", "React tylko lokalnie", "Kalkulatory i generatory"],
    accent: "blue",
  },
  {
    id: "web-apps",
    number: "03",
    title: "MINI SPA",
    eyebrow: "Frontend • Fullstack • BaaS",
    summary:
      "Kompletne narzędzia z własną logiką, panelem użytkownika, administracją i statystykami.",
    image: questionsImage,
    imageAlt: "Neonowe znaki zapytania ukryte pod efektem PixiJS",
    points: [
      "Wewnętrzne narzędzia",
      "Pozyskiwanie klientów",
      "Wsparcie studentów",
    ],
    accent: "cyan",
  },
];

export const configuratorDemo: Direction = {
  id: "demo-configurator",
  number: "04",
  title: "Konfigurator",
  eyebrow: "Demonstracja możliwości",
  summary: "Prowadzenie użytkownika przez proces wyboru, wykonywanie obliczeń, dopasowywanie oraz prezentowanie spersonalizowanych rekomendacji.",
  image: questionsImage,
  imageAlt: "Ukryta demonstracja konfiguratora kierunków",
  points: ["Iland SPA", "React.js", "Three.js • PixiJS • GSAP"],
  accent: "violet",
  href: "demo-configurator",
  buttonLabel: "OTWÓRZ",
  buttonEyebrow: "prototyp konfiguratora",
  featured: true,
  revealGate: "all-directions",
};

export const panels: DirectionPanel[] = [
  {
    id: "canvas",
    number: "01",
    title: "Canvas",
    kicker: "Od animacji do funkcjonalnych doświadczeń",
    image: canvasImage,
    imageAlt: "Neonowa wizualizacja możliwości Canvas z interaktywnym drzewem 3D",
    description:
      "Canvas pozwala budować interfejsy z bardzo wysokim poziomem interaktywności, dużą liczbą animacji oraz obiektami 2D i 3D — przy zachowaniu płynnego działania także wtedy, gdy ekran zawiera wiele elementów.",
    note: "To nie tylko efekt wizualny. Canvas może prowadzić użytkownika przez dane, produkt lub temat — na przykład interaktywną anatomię dla kursów masażu albo mapę mieszkań w budynku.",
    capabilities: [
      "Interakcje reagujące na użytkownika",
      "Płynne animacje wielu obiektów",
      "Wizualizacje 2D i 3D",
      "Nietypowe mapy i eksploracja danych",
    ],
    examples: [
      { label: "Drzewo 3D", href: "https://oftheoak.co.uk/oak-species" },
      { label: "Interaktywna sfera", href: "https://codepen.io/juriandreiczuk/full/zYOLPYB" },
      { label: "Mapa mieszkań", href: "https://jeczmienna18.town-house.pl/" },
    ],
    accent: "violet",
  },
  {
    id: "islands",
    number: "02",
    title: "Islands Architecture",
    kicker: "Statyczne morze HTML. Dynamiczne wyspy.",
    image: islandsImage,
    imageAlt:
      "Ilustracja Islands Architecture ze statyczną wyspą HTML i interaktywnymi komponentami",
    description:
      "Strona pozostaje statyczna, szybka i czytelna dla robotów, a JavaScript działa tylko w wybranych miejscach. React może obsługiwać pojedynczy kalkulator, konfigurator czy galerię bez zmieniania całej strony w aplikację.",
    note: "Ten kierunek dobrze pasuje do kampanii marketingowych: istniejący landing może stać się platformą dla jednego wartościowego narzędzia, przygotowanego dokładnie pod potrzeby odbiorcy.",
    capabilities: [
      "Pełna treść dostępna w HTML",
      "Mniej JavaScriptu",
      "Szybsze ładowanie",
      "Interakcje tylko tam, gdzie są potrzebne",
    ],
    examples: [
      { label: "Album jubileuszowy GPW", href: "https://30latgpw.pl/" },
      { label: "Konfigurator oferty", href: "https://ista.follow.vision/" },
    ],
    accent: "blue",
  },
  {
    id: "web-apps",
    number: "03",
    title: "Mini aplikacje webowe",
    kicker: "Mały zespół. Konkretna funkcja. Duża wartość.",
    image: miniAppImage,
    imageAlt: "Neonowa ilustracja lekkiej aplikacji webowej z modułowymi funkcjami",
    description:
      "Frontendowe i fullstackowe aplikacje mogą powstawać jako samodzielne produkty albo wykorzystywać Backend as a Service. Taki projekt nie musi od razu oznaczać dużego zespołu i wielomiesięcznej realizacji.",
    note: "Przykładowe MVP łączyło ankiety i quizy z dwiema perspektywami: częścią użytkownika oraz panelem administracyjnym z CMS-em i statystykami odpowiedzi.",
    capabilities: [
      "Frontend / Fullstack / BaaS",
      "Wewnętrzne narzędzia",
      "Pozyskiwanie klientów",
      "Wsparcie studentów",
    ],
    examples: [
      { label: "Planning Poker", href: "#" },
      { label: "Badanie efektywności", href: "https://quesearch.vercel.app/" },
    ],
    accent: "cyan",
  },
];

export const getPanel = (id: string) => panels.find((panel) => panel.id === id);
