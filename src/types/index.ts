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
  content: z.object({
    rendered: z.string(),
  }),
  acf: z.object({
    subtitle: z.string(),
  }),
  feature_images: featuredImagesSchemas
});
