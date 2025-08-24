# OS Blog

A modern, open-source blogging platform designed for creators, teams, and communities. OS Blog makes it easy to publish, manage, and share content with a beautiful, intuitive interface.

---

## 🚀 What Can You Do With OS Blog?

- **Create and Publish Posts:** Write, edit, and publish blog posts with a rich text editor.
- **Organize Content:** Use categories and tags to keep your blog organized.
- **User Roles:** Multiple roles (Admin, Author, Reader) for flexible collaboration and access control.
- **Profile Management:** Update your profile, including profile picture and personal info.
- **Media Uploads:** Easily upload and manage images for posts and profiles.
- **Commenting:** Readers can leave comments and interact with posts.
- **Search and Filter:** Quickly find posts by keyword, category, or tag.
- **SEO-Friendly:** Clean URLs and metadata for better search engine visibility.
- **Admin Dashboard:** Manage users, posts, and site settings from a dedicated admin area.
- **Setup Wizard:** Guided setup for first-time configuration.
- **Secure Authentication:** Sign up, log in, and manage sessions securely.

---

## Running OS Blog Locally

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- PostgreSQL (if not using Docker)
- Docker (optional, for containerized setup)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd open-blog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and edit as needed:

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database and JWT settings
```

### 4. Run the App

```bash
npm run dev
```

- Frontend: http://localhost:4200
- Backend/API: http://localhost:3000
- API Docs: http://localhost:3000/api

---

## Running with Docker

## 🐳 Official Docker Image (Recommended)

You can also run OS Blog using the official Docker image, which contains the pre-built frontend, backend, and all required dependencies.

### Pull and Run from Docker Hub

```bash
docker pull macadiz/os-blog:latest
docker run -d \
  --name os-blog \
  -p 8081:80 \
  -p 5436:5432 \
  -v openblog-database-data:/var/lib/postgresql/data \
  -v openblog-static-files:/app/static \
  --restart unless-stopped \
  macadiz/os-blog:latest
```

- Access the blog at: http://localhost:8081

> **Note:**
> - The image includes both the frontend and backend, served via Nginx.
> - You must provide a valid `.env` file with your database and JWT settings.
> - Database and static files are persisted using Docker volumes.
> - For first-time setup, visit `/setup` after starting the container.

---

## Running local docker image


### One-Step Setup (Windows)

```powershell
./setup.ps1
```

- This PowerShell script builds the Docker image, interactively configures environment variables, and starts the app on Windows.

### One-Step Setup (Linux/macOS)

```bash
./setup.sh
```

- This shell script builds the Docker image, sets up environment variables, and starts the app on Linux/macOS.

### Manual Docker Build

```bash
docker build -t os-blog .
docker run -d \
  --name os-blog \
  -p 8081:80 \
  -p 5436:5432 \
  -v openblog-database-data:/var/lib/postgresql/data \
  -v openblog-static-files:/app/static \
  --env-file .env \
  --restart unless-stopped \
  os-blog
```

- Access the blog at: http://localhost:8081

---

## ℹ️ Additional Information

- **First-Time Setup:** Visit `/setup` in your browser to create the admin account and configure your blog.
- **API Documentation:** Swagger docs available at `openapi.yaml`
- **Database Migrations:** Use `npm run prisma:migrate` to apply schema changes.
- **Static Files:** Uploaded images are stored in a persistent Docker volume or `static/` directory.

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork this repository.
2. Create a new branch for your feature or fix.
3. Make your changes and add tests if applicable.
4. Run the app locally to verify your changes.
5. Submit a pull request with a clear description.

**Contributor Tips:**
- Follow the existing code style and structure.
- Write clear commit messages.
- For major changes, open an issue first to discuss your idea.

---

## 📝 License

This project is licensed under the MIT License.

---

**Need help?**  
Check the API docs, review the deployment guide, or open an issue on GitHub!
