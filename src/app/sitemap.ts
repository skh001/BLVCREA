import { MetadataRoute } from 'next';
import { getAllProducts, getCategories } from '@/lib/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blvcrea.fr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/boutique`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/personnalisation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  const [products, categories] = await Promise.all([
    getAllProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => (c.count ?? 0) > 0)
    .map((c) => ({
      url: `${siteUrl}/boutique/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const productPages: MetadataRoute.Sitemap = products
    // On ignore les produits qui n'ont pas de slug défini
    .filter((p) => p.slug && p.slug.current)
    .map((p) => {
      const dateString = p.createdAt;
      const validDate = dateString ? new Date(dateString) : new Date();

      return {
        url: `${siteUrl}/produit/${p.slug.current}`,
        lastModified: isNaN(validDate.getTime()) ? new Date() : validDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

  return [...staticPages, ...categoryPages, ...productPages];
}