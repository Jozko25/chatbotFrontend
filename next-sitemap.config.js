/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.xelochat.com',
  generateRobotsTxt: false, // We have a custom robots.txt
  generateIndexSitemap: false,
  outDir: 'public',

  // Exclude authenticated/private pages
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/billing/success',
    '/api/*',
    '/sign-in',
    '/sign-up',
  ],

  // Additional paths to include
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/pricing'),
    await config.transform(config, '/privacy'),
    await config.transform(config, '/terms'),
    await config.transform(config, '/embed-guide'),
  ],

  // Transform function to set priorities and change frequencies
  transform: async (config, path) => {
    // Default values
    let priority = 0.7;
    let changefreq = 'weekly';

    // Home page - highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }

    // Pricing - high priority, changes occasionally
    if (path === '/pricing') {
      priority = 0.9;
      changefreq = 'weekly';
    }

    // Embed guide - medium-high priority for conversions
    if (path === '/embed-guide') {
      priority = 0.8;
      changefreq = 'monthly';
    }

    // Legal pages - lower priority, rarely change
    if (path === '/privacy' || path === '/terms') {
      priority = 0.3;
      changefreq = 'yearly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
