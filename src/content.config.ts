import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional().default("untitled"),
      category: z.enum(['commission', 'personal']),
      date: z.string(),
      cover: image(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      client: z.string().optional(),
    }),
});

export const collections = { works };
