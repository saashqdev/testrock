import { LoaderData } from "../api/KbRoutes.Article.Api";
import KbDocsLayout from "../../components/layouts/KbDocsLayout";
import KbArticleClientWrapper from "./KbArticleClientWrapper";

interface KbRoutesArticleViewProps {
  data: LoaderData;
}

export default function KbRoutesArticleView({ data }: KbRoutesArticleViewProps) {
  if (data.kb.layout === "docs") {
    return (
      <KbDocsLayout
        kb={data.kb}
        categories={data.categories}
        article={!data.item ? null : { ...data.item, userState: data.userState }}
        isAdmin={data.isAdmin}
      />
    );
  }

  return <KbArticleClientWrapper data={data} />;
}
