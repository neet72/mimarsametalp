import type { Metadata } from "next";
import { ProjectsPortfolio } from "@/components/projects/ProjectsPortfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projeler",
  description:
    "Konut, ticari ve iç mimarlık projelerinden seçilmiş mimari çalışmalar ve uygulama örnekleri.",
  path: "/projeler",
});

export default function ProjelerPage() {
  return <ProjectsPortfolio />;
}
