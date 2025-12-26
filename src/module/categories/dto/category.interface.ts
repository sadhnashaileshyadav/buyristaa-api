export interface CategoryInterface {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  parentId?: number;
  parent?: CategoryInterface;
  children?: CategoryInterface[];
}