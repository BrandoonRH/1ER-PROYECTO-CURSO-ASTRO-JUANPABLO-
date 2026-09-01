import { z } from "zod";

const imageSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const featuredImagesSchemas = z.object({
  thumbnail: imageSchema,
  medium: imageSchema,
  medium_large: imageSchema,
  large: imageSchema,
  full: imageSchema,
});

export const BaseWPSchema = z.object({
  id: z.number(),
  title: z.object({
    rendered: z.string(),
  }),
  slug: z.string(),
  content: z.object({
    rendered: z.string(),
  }),
  acf: z.object({
    subtitle: z.string(),
  }),
  feature_images: featuredImagesSchemas,
});

const processSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
});

export const ProcessPageSchema = BaseWPSchema.extend({
  acf: z
    .object({
      subtitle: z.string(),
    })
    .catchall(processSchema),
});

export const CategorySchema = z.object({
  name: z.string(),
  id: z.number(),
  slug: z.string(),
});

export const CategoriesSlugSchema = z.array(CategorySchema.pick({
  slug: true
}))

const CategoriesSchema = z.array(CategorySchema);

/***POSTS */

export const PostSchema = BaseWPSchema.omit({
  acf: true,
}).extend({
  date: z.string(),
  category_details: CategoriesSchema,
});

export type PostType = z.infer<typeof PostSchema>;

export const PostsSchema = z.array(PostSchema);
