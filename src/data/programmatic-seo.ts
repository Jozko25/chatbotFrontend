import variationsData from './programmatic-seo.json';

export interface ProgrammaticVariation {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  introParagraph: string;
}

export const PROGRAMMATIC_VARIATIONS: ProgrammaticVariation[] =
  variationsData as ProgrammaticVariation[];

export function getVariationBySlug(slug: string): ProgrammaticVariation | undefined {
  return PROGRAMMATIC_VARIATIONS.find((v) => v.slug === slug);
}

export function getProgrammaticSlugs(): string[] {
  return PROGRAMMATIC_VARIATIONS.map((v) => v.slug);
}
