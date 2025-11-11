export type KnowledgeBaseCategoryDto = {
  id: string;
  knowledgeBaseId: string;
  title: string;
  language: string;
  sections: { id: string; order: number; title: string }[];
};
