import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blvcrea.fr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/boutique`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/personnalisation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  const products = await getAllProducts().catch(() => []);
  
  const productPages: MetadataRoute.Sitemap = products
    // On ignore les produits qui n'ont pas de slug défini
    .filter((p) => p.slug && p.slug.current)
    .map((p) => {
      // Sécurisation de la date (Sanity utilise souvent _createdAt au lieu de createdAt)
      const dateString = p.createdAt || p._createdAt;
      const validDate = dateString ? new Date(dateString) : new Date();

      return {
        url: `${siteUrl}/produit/${p.slug.current}`,
        lastModified: isNaN(validDate.getTime()) ? new Date() : validDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

  return [...staticPages, ...productPages];
}