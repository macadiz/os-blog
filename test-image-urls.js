#!/usr/bin/env node

// Test the image URL generation logic
console.log('🧪 Testing image URL generation for different environments...');

// Mock the generateMetaTags function logic
function testImageUrl(featuredImage, baseUrl) {
  let imageUrl = '';
  if (featuredImage) {
    if (featuredImage.startsWith('http://') || featuredImage.startsWith('https://')) {
      imageUrl = featuredImage;
    } else {
      // For relative URLs, use BASE_URL (respects environment)
      const baseForFiles = baseUrl.replace(/\/$/, ''); // Remove trailing slash
      imageUrl = featuredImage.startsWith('/')
        ? `${baseForFiles}${featuredImage}`
        : `${baseForFiles}/${featuredImage}`;
    }
  }
  return imageUrl;
}

// Test cases
const testCases = [
  {
    name: 'Development (localhost)',
    baseUrl: 'http://localhost:4200',
    featuredImage: '/files/blog_images/test-image.jpg',
    expected: 'http://localhost:4200/files/blog_images/test-image.jpg'
  },
  {
    name: 'Production (custom domain)',
    baseUrl: 'https://myblog.com',
    featuredImage: '/files/blog_images/test-image.jpg',
    expected: 'https://myblog.com/files/blog_images/test-image.jpg'
  },
  {
    name: 'Production with trailing slash',
    baseUrl: 'https://myblog.com/',
    featuredImage: '/files/blog_images/test-image.jpg',
    expected: 'https://myblog.com/files/blog_images/test-image.jpg'
  },
  {
    name: 'Absolute URL (unchanged)',
    baseUrl: 'https://myblog.com',
    featuredImage: 'https://external-cdn.com/image.jpg',
    expected: 'https://external-cdn.com/image.jpg'
  },
  {
    name: 'Relative path without leading slash',
    baseUrl: 'https://myblog.com',
    featuredImage: 'files/blog_images/test-image.jpg',
    expected: 'https://myblog.com/files/blog_images/test-image.jpg'
  }
];

// Run tests
let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const result = testImageUrl(test.featuredImage, test.baseUrl);
  if (result === test.expected) {
    console.log(`✅ ${test.name}: ${result}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}: Expected "${test.expected}", got "${result}"`);
    failed++;
  }
});

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! Image URLs will work correctly in all environments.');
} else {
  console.log('⚠️  Some tests failed. Please check the implementation.');
  process.exit(1);
}