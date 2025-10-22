const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Load environment variables from static-generator/.env
require("dotenv").config({ path: path.join(__dirname, ".env") });

/**
 * Generate static HTML pages with proper meta tags for blog posts
 * This creates individual HTML files that social media crawlers can read
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3001";
const DIST_DIR = process.env.DIST_DIR || "./dist/frontend";
const BASE_URL = process.env.BASE_URL || "http://localhost";

// Read the base index.html template
function getIndexTemplate() {
  const indexPath = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Index.html not found at ${indexPath}. Please run 'ng build' first.`
    );
  }
  return fs.readFileSync(indexPath, "utf8");
}

// Fetch blog posts from API
async function fetchBlogPosts() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/posts/published`;
    const client = url.startsWith("https") ? https : http;

    const req = client.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const posts = response.data || response;
          resolve(posts);
        } catch (error) {
          reject(
            new Error(`Failed to parse blog posts response: ${error.message}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Failed to fetch blog posts: ${error.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout fetching blog posts"));
    });
  });
}

// Fetch blog settings
async function fetchBlogSettings() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/setup/blog-settings`;
    const client = url.startsWith("https") ? https : http;

    const req = client.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const settings = response.data || response;
          resolve(settings);
        } catch (error) {
          console.warn("Failed to fetch blog settings:", error.message);
          resolve({
            blogTitle: "Blog",
            blogDescription: "A modern blogging platform",
          });
        }
      });
    });

    req.on("error", (error) => {
      console.warn("Failed to fetch blog settings:", error.message);
      resolve({
        blogTitle: "Blog",
        blogDescription: "A modern blogging platform",
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.warn("Timeout fetching blog settings");
      resolve({
        blogTitle: "Blog",
        blogDescription: "A modern blogging platform",
      });
    });
  });
}

// Generate meta tags for a blog post
function generateMetaTags(post, blogSettings) {
  const title = post.metaTitle || `${post.title} - ${blogSettings.blogTitle}`;

  // Generate description with multiple fallbacks
  let description = post.metaDescription || post.excerpt;

  // If still no description, try to generate from content (strip markdown/html and truncate)
  if (!description && post.content) {
    // Remove markdown/html tags and get first 160 characters
    const plainText = post.content
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    description = plainText.substring(0, 160);
    if (plainText.length > 160) {
      description += '...';
    }
  }

  // Final fallback to blog description or default
  if (!description || description.trim() === '') {
    description = (blogSettings.blogDescription && blogSettings.blogDescription.trim() !== '')
      ? blogSettings.blogDescription
      : `Read ${post.title} on ${blogSettings.blogTitle || 'this blog'}`;
  }

  const url = `${BASE_URL}/blog/${post.slug}`;

  // Handle image URL - check if it's already absolute or needs base URL
  let imageUrl = "";
  if (post.featuredImage) {
    if (
      post.featuredImage.startsWith("http://") ||
      post.featuredImage.startsWith("https://")
    ) {
      imageUrl = post.featuredImage;
    } else {
      // For relative URLs, use BASE_URL (respects environment)
      const baseForFiles = `${BASE_URL.replace(/\/$/, "")}/api`;
      imageUrl = post.featuredImage.startsWith("/")
        ? `${baseForFiles}${post.featuredImage}`
        : `${baseForFiles}/${post.featuredImage}`;
    }
  }

  const ogImageTags = imageUrl
    ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />`
    : "";

  const twitterImageTag = imageUrl
    ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
    : "";

  // Handle logo URL - same logic as featured image
  let logoUrl = "";
  if (blogSettings.logoUrl && blogSettings.logoUrl.trim() !== '') {
    if (
      blogSettings.logoUrl.startsWith("http://") ||
      blogSettings.logoUrl.startsWith("https://")
    ) {
      logoUrl = blogSettings.logoUrl;
    } else {
      const baseForFiles = `${BASE_URL.replace(/\/$/, "")}/api`;
      logoUrl = blogSettings.logoUrl.startsWith("/")
        ? `${baseForFiles}${blogSettings.logoUrl}`
        : `${baseForFiles}/${blogSettings.logoUrl}`;
    }
  }

  const ogLogoTag = logoUrl
    ? `<meta property="og:logo" content="${escapeHtml(logoUrl)}" />`
    : "";

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <!-- OpenGraph tags -->
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:site_name" content="${escapeHtml(blogSettings.blogTitle)}" />
    ${ogImageTags}
    ${ogLogoTag}

    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${twitterImageTag}`;
}

// Escape HTML entities
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Create static HTML file for a blog post
function createStaticPage(post, blogSettings, template) {
  const metaTags = generateMetaTags(post, blogSettings);

  // Remove existing title and meta description from template to avoid duplicates
  let html = template.replace(/<title>.*?<\/title>/, "");
  html = html.replace(/<meta name="description"[^>]*>/, "");

  // Add all meta tags (including title and description) in the head section
  html = html.replace("</head>", `${metaTags}\n  </head>`);

  // Create directory structure
  const blogDir = path.join(DIST_DIR, "blog");
  const postDir = path.join(blogDir, post.slug);

  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }

  // Write the HTML file
  const filePath = path.join(postDir, "index.html");
  fs.writeFileSync(filePath, html);

  console.log(`✅ Generated: ${filePath}`);
}

// Main function
async function generateStaticPages() {
  try {
    console.log("🔨 Generating static pages with meta tags...");

    // Check if dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error(
        `Build directory not found at ${DIST_DIR}. Please run 'ng build' first.`
      );
    }

    // Load the base template
    const template = getIndexTemplate();

    // Fetch data
    console.log("📡 Fetching blog data...");
    const [posts, blogSettings] = await Promise.all([
      fetchBlogPosts(),
      fetchBlogSettings(),
    ]);

    console.log(`📄 Found ${posts.length} blog posts`);
    console.log(`🏷️  Blog: ${blogSettings.blogTitle}`);

    // Generate static pages for each post
    for (const post of posts) {
      createStaticPage(post, blogSettings, template);
    }

    console.log(`\n🎉 Successfully generated ${posts.length} static pages!`);
    console.log("📁 Static pages are available in:", DIST_DIR);
    console.log("\n💡 To test the static pages:");
    console.log("   1. Serve the dist folder with any static server");
    console.log("   2. Navigate to /blog/[post-slug]/ to see the static HTML");
    console.log(
      "   3. Use tools like Facebook Sharing Debugger to test OpenGraph tags"
    );
  } catch (error) {
    console.error("❌ Error generating static pages:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateStaticPages();
}

module.exports = { generateStaticPages };
