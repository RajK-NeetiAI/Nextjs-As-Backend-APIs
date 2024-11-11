import { z } from 'zod'

export const createBookmarkSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    url: z.string().url('Invalid URL'),
    userId: z.number().positive('User ID is required')
})

export const updateBookmarkSchema = createBookmarkSchema.omit({ userId: true }).partial()

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>
