import { renderToString } from "react-dom/server";
import App from "./App";
import { config, site } from "./config";
import { icons, categories } from "./registry";
import { faqs } from "./content";
export function render() {
  return renderToString(<App />);
}
export function discovery() {
  const origin = site.url;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": origin + "/#project",
        name: "Muslim Icons",
        url: origin + "/",
        logo: origin + "/icon-512.png",
        sameAs: [config.repositoryUrl],
      },
      {
        "@type": "WebSite",
        "@id": origin + "/#website",
        name: "Muslim Icons",
        alternateName: "Muslim Icons — Icons for the Ummah",
        url: origin + "/",
        inLanguage: "en",
        publisher: { "@id": origin + "/#project" },
      },
      {
        "@type": "WebPage",
        "@id": origin + "/#webpage",
        url: origin + "/",
        name: site.title,
        description: site.description,
        inLanguage: "en",
        isPartOf: { "@id": origin + "/#website" },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: origin + "/og-card.png",
          width: 1200,
          height: 630,
        },
        mainEntity: { "@id": origin + "/#library" },
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": origin + "/#library",
        name: "Muslim Icons",
        description:
          "Open-source Muslim and Islamic SVG icon library with a published React package on npm. Artwork rights remain subject to the repository licensing notes.",
        codeRepository: config.repositoryUrl,
        programmingLanguage: ["TypeScript", "SVG"],
        runtimePlatform: "React",
        license: config.repositoryUrl + "/blob/main/LICENSE",
        keywords:
          "Muslim icons, Islamic icons, SVG icons, React icons, mosque icon, Quran icon, prayer icons, Ramadan icons, Hajj icons",
      },
      {
        "@type": "FAQPage",
        "@id": origin + "/#faq",
        isPartOf: { "@id": origin + "/#webpage" },
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };
  return { graph, site, config, icons, categories, faqs };
}
