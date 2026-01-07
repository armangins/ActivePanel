import { z } from 'zod';
import type { UploadFile } from 'antd';

// Zod schema for image data from WooCommerce
export const imageSchema = z.object({
    id: z.number().optional(),
    src: z.string().url(),
    name: z.string(),
    alt: z.string().optional(),
});

// Zod schema for media upload response
export const mediaUploadResponseSchema = z.object({
    id: z.number(),
    source_url: z.string().url().optional(),
    guid: z.object({
        rendered: z.string().url(),
    }).optional(),
});

// TypeScript types inferred from Zod schemas
export type ImageData = z.infer<typeof imageSchema>;
export type MediaUploadResponse = z.infer<typeof mediaUploadResponseSchema>;

// Props interface
export interface ImageUploadProps {
    value?: ImageData[];
    onChange?: (fileList: ImageData[]) => void;
    maxCount?: number;
}

// Draggable item props
export interface DraggableUploadListItemProps {
    originNode: React.ReactElement;
    file: UploadFile;
}
