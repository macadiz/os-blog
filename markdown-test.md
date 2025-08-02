# Main Heading (H1)

This is the largest heading with a bottom border.

## Secondary Heading (H2)

This is the second-level heading, also with a bottom border.

### Third Level Heading (H3)

This is a third-level heading without a border.

#### Fourth Level Heading (H4)

This is a fourth-level heading.

##### Fifth Level Heading (H5)

This is a fifth-level heading.

###### Sixth Level Heading (H6)

This is the smallest heading with gray color.

---

## Paragraphs and Text Formatting

This is a regular paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use __bold text__ and _italic text_ with underscores.

Here's a paragraph with a [link to Google](https://www.google.com) and some `inline code` with pink highlighting.

## Lists

### Unordered Lists

- First level bullet point
- Another first level item
  - Second level bullet (circle)
  - Another second level item
    - Third level bullet (square)
    - Another third level item
- Back to first level

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item

### Mixed Lists

1. Numbered item
   - Bullet point under numbered item
   - Another bullet point
2. Another numbered item
   - More bullet points
     1. Nested numbered under bullet
     2. Another nested numbered

## Blockquotes

> This is a blockquote with blue left border and light background.
> 
> It can span multiple lines and paragraphs.
> 
> > This is a nested blockquote.

## Code Blocks

### Inline Code
Here's some `inline code` with special styling.

### JavaScript Code Block
```javascript
function greetUser(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to our blog, ${name}`;
}

const user = "John Doe";
greetUser(user);
```

### TypeScript Code Block
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class BlogPost {
  constructor(
    public title: string,
    public content: string,
    public author: User
  ) {}
  
  publish(): void {
    console.log(`Publishing post: ${this.title}`);
  }
}
```

### CSS Code Block
```css
.prose h1 {
  font-size: 2.25rem !important;
  border-bottom: 2px solid #e5e7eb !important;
  color: #111827 !important;
}
```

### JSON Code Block
```json
{
  "name": "Open Blog",
  "version": "1.0.0",
  "description": "A modern blog platform",
  "features": [
    "Markdown support",
    "Syntax highlighting",
    "User management"
  ]
}
```

### Bash Code Block
```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build
```

## Tables

### Simple Table

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown Support | ✅ Complete | High |
| Syntax Highlighting | ✅ Complete | High |
| User Authentication | ✅ Complete | High |
| Comments System | ⏳ Pending | Medium |
| Search Functionality | ❌ Not Started | Low |

### Complex Table with Different Content

| Component | Technology | Lines of Code | Complexity |
|-----------|------------|---------------|------------|
| Frontend | Angular 17 | 2,500+ | Medium |
| Backend | NestJS | 1,800+ | High |
| Database | PostgreSQL | N/A | Low |
| Styling | Tailwind CSS | 500+ | Low |

### Table with Links and Code

| API Endpoint | Method | Description | Example |
|--------------|--------|-------------|---------|
| `/api/posts` | GET | Get all posts | `GET /api/posts?page=1` |
| `/api/posts/:id` | GET | Get single post | `GET /api/posts/123` |
| `/api/posts` | POST | Create new post | `POST /api/posts` |
| `/api/posts/:id` | PUT | Update post | `PUT /api/posts/123` |
| `/api/posts/:id` | DELETE | Delete post | `DELETE /api/posts/123` |

## Images

![Sample Image](https://placehold.co/600x400/000000/FFFFFF/png?text=Sample+Blog+Image)

*Caption: This is a sample image with rounded corners and shadow.*

## Horizontal Rules

---

## Complex Combinations

### Code with Explanation

Here's how to create a new blog post:

```typescript
const newPost = {
  title: "My First Post",
  content: "# Welcome\n\nThis is my first blog post!",
  tags: ["tutorial", "beginner"],
  published: true
};
```

The `newPost` object contains:
- **title**: The post title
- **content**: Markdown content
- **tags**: Array of tag names
- **published**: Boolean for publish status

### Lists with Code and Links

1. **Setup the environment**
   - Install Node.js from [nodejs.org](https://nodejs.org)
   - Run `npm install` to install dependencies
   
2. **Configure the database**
   ```bash
   # Create database
   createdb openblog
   
   # Run migrations
   npm run migrate
   ```

3. **Start development**
   - Run `npm run dev` for frontend
   - Run `npm run start:dev` for backend

### Blockquote with Code

> **Pro Tip**: Always use TypeScript for better code quality!
> 
> ```typescript
> // Good: Type-safe code
> interface BlogPost {
>   title: string;
>   publishedAt: Date;
> }
> 
> // Bad: No type safety
> const post = { title: "Hello", publishedAt: "today" };
> ```

## Final Notes

This comprehensive example includes:

- ✅ All 6 heading levels (H1-H6)
- ✅ Paragraphs with various text formatting
- ✅ Unordered, ordered, and nested lists
- ✅ Blockquotes (simple and nested)
- ✅ Inline code and code blocks with syntax highlighting
- ✅ Tables (simple, complex, and with mixed content)
- ✅ Images with alt text
- ✅ Horizontal rules
- ✅ Links (inline and reference style)
- ✅ Complex combinations of all elements

**End of test document** - All Markdown elements should now be properly styled! 🎉
