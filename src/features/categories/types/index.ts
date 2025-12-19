export interface Category {
    id: number;
    name: string;
    slug: string;
    parent: number;
    description: string;
    display?: string;
    image?: {
        id: number;
        src: string;
        name: string;
        alt: string;
    } | null;
    menu_order?: number;
    count: number;
    _links?: any;
}

export interface CreateCategoryData {
    name: string;
    slug?: string;
    parent?: number;
    description?: string;
    display?: string;
    image?: {
        id: number;
    };
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id: number;
}
