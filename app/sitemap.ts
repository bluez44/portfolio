import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // const res = await fetch('https://api.domaincuaban.com/posts');
  // const posts = await res.json();

  // const postUrls = posts.map((post: any) => ({
  //   url: `https://domaincuaban.com/blog/${post.slug}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }));

  const postUrls: MetadataRoute.Sitemap = [];

  const staticUrls = [
    {
      url: "https://www.vinhvolequang.io.vn/",
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 1.0,
    },
    // {
    //   url: 'https://domaincuaban.com/about',
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.8,
    // },
    // {
    //   url: 'https://domaincuaban.com/blog',
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly' as const,
    //   priority: 0.9,
    // },
  ];

  return [...staticUrls, ...postUrls];
}
