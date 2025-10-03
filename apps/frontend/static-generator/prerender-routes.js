const https = require('https');
const http = require('http');

/**
 * Dynamic route discovery for Angular prerendering
 * Fetches all blog post slugs from the API and generates routes
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function fetchBlogPosts() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/posts/published`;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const posts = response.data || response;
          const routes = posts.map(post => `/blog/${post.slug}`);
          resolve(routes);
        } catch (error) {
          console.warn('Failed to parse blog posts response:', error.message);
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      console.warn('Failed to fetch blog posts for prerendering:', error.message);
      resolve([]);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.warn('Timeout fetching blog posts for prerendering');
      resolve([]);
    });
  });
}

async function getRoutes() {
  console.log('🔍 Discovering blog post routes for prerendering...');

  // Base routes that should always be prerendered
  const baseRoutes = [
    '/',
    '/blog'
  ];

  try {
    const blogPostRoutes = await fetchBlogPosts();
    const allRoutes = [...baseRoutes, ...blogPostRoutes];

    console.log(`✅ Found ${blogPostRoutes.length} blog post routes`);
    console.log(`📄 Total routes to prerender: ${allRoutes.length}`);

    return allRoutes;
  } catch (error) {
    console.warn('⚠️  Error during route discovery:', error.message);
    console.log('📄 Falling back to base routes only');
    return baseRoutes;
  }
}

// Export for Angular CLI
module.exports = getRoutes;

// Allow script to be run directly
if (require.main === module) {
  getRoutes().then(routes => {
    console.log('Routes to prerender:');
    routes.forEach(route => console.log(`  ${route}`));
  });
}