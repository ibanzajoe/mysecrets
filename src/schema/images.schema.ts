import { z } from "zod";

export const ImageSchema = z.object({
    id: z.string().uuid(),
    url: z.string(),
    filename: z.string(),
    label: z.string().nullable(),
    width: z.number(),
    height: z.number(),
})

export const CreateImageSchema = z.object({
    url: z.string(),
    label: z.string().optional(),
    filename: z.string(),
    width: z.number(),
    height: z.number()
});

export type TImageSchema = z.infer<typeof ImageSchema>;
export type TCreateImageSchema = z.infer<typeof CreateImageSchema>;