import { config } from "./config";
import { icons } from "./registry";
export const faqs = [
  {
    question: "What is Muslim Icons?",
    answer:
      "Muslim Icons is a free, open-source icon library for developers and designers building products for Muslim communities. Its Islamic icon collection covers mosques, prayer, Quran study, Ramadan, Eid, Hajj, Umrah and everyday Muslim life.",
  },
  {
    question: "Can I download Islamic icons as SVG files?",
    answer: `Yes. Open an icon in the explorer, choose its size and color, and download its SVG. All ${icons.length} icons are synced from the original Muslim Icons source library, using a consistent 24×24 outline style.`,
  },
  {
    question: "How do I use Muslim Icons with React?",
    answer: `Install @muslim-icons/react from npm, then import components such as Mosque, Quran, OpenQuran, PrayerMat and Kaaba. Components accept size, color and standard SVG props. The current npm release is v${config.packageVersion} with ${icons.filter((icon) => icon.availableInPackage).length} icon exports. The full SVG collection tracks the main repository, which can include newer icons.`,
  },
  {
    question: "Are Muslim Icons free for commercial projects?",
    answer:
      "The software is MIT licensed. The source repository describes intended CC0 1.0 artwork licensing, subject to contributor rights confirmation. Review the repository's artwork licensing notes before using the SVGs in a commercial or production project.",
  },
];
