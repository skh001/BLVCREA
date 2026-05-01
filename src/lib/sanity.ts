import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// ── Typed queries ────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  description: string;
  image: any;
  category: string;
  inStock: boolean;
  createdAt: string;
}

export interface CustomRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  color: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  status: 'nouveau' | 'en_cours' | 'termine';
}

export async function getAllProducts(): Promise<Product[]> {
  return sanityClient.fetch(`
    *[_type == "product"] | order(_createdAt desc) {
      _id, title, slug, price, description, image, category, inStock, _createdAt
    }
  `);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] {
      _id, title, slug, price, description, image, category, inStock, _createdAt
    }`,
    { slug }
  );
}

export async function getCustomRequests(): Promise<CustomRequest[]> {
  return sanityWriteClient.fetch(`
    *[_type == "customRequest"] | order(_createdAt desc)[0...50] {
      _id, name, email, phone, color, description, imageUrl, _createdAt, status
    }
  `);
}
