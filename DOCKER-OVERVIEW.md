# OS Blog - Modern Blogging Platform

OS Blog is a modern, feature-rich blogging platform designed for developers and content creators. It includes a responsive frontend, a robust backend, and a PostgreSQL database for data persistence.

## Features:
- **Frontend**: Built with Angular, providing a responsive and user-friendly interface.
- **Backend**: Powered by NestJS, offering a scalable and secure API.
- **Database**: PostgreSQL for reliable data storage.
- **Authentication**: JWT-based for secure user sessions.
- **Customizable**: Easily configurable environment variables for deployment.

---

## Quick Start

To quickly start the OS Blog system with persistent data, use the following command:

```bash
docker run -d \
  --name os-blog \
  -p 80:80 \
  -v os-blog-database-data:/var/lib/postgresql/data \
  -v os-blog-static-files:/var/www/static \
  -e POSTGRES_PASSWORD="your_secure_password" \
  -e JWT_SECRET="your_jwt_secret_32_chars_minimum" \
  mjacadiz/os-blog:latest
```

- Replace `your_secure_password` with a strong password for the PostgreSQL database.
- Replace `your_jwt_secret_32_chars_minimum` with a secure JWT secret (minimum 32 characters).

Access the blog at: [http://localhost](http://localhost)

---

## Advanced Configuration

### Expose PostgreSQL Port
To expose the PostgreSQL database port for external access, use the following command:

```bash
docker run -d \
  --name os-blog \
  -p 80:80 \
  -p 5432:5432 \
  -v os-blog-database-data:/var/lib/postgresql/data \
  -v os-blog-static-files:/var/www/static \
  -e POSTGRES_PASSWORD="your_secure_password" \
  -e JWT_SECRET="your_jwt_secret_32_chars_minimum" \
  -e POSTGRES_DB="open_blog" \
  -e POSTGRES_USER="blog_user" \
  mjacadiz/os-blog:latest
```

- The database will be accessible on `localhost:5432`.

---

### Custom Ports
To run the blog on a custom port, specify the desired port:

```bash
docker run -d \
  --name os-blog \
  -p 8080:80 \
  -v os-blog-database-data:/var/lib/postgresql/data \
  -v os-blog-static-files:/var/www/static \
  -e POSTGRES_PASSWORD="your_secure_password" \
  -e JWT_SECRET="your_jwt_secret_32_chars_minimum" \
  mjacadiz/os-blog:latest
```

Access the blog at: [http://localhost:8080](http://localhost:8080)

---

## Environment Variables

| Variable           | Description                                      | Default Value       |
|---------------------|--------------------------------------------------|---------------------|
| `POSTGRES_PASSWORD` | Password for the PostgreSQL database (required) |                     |
| `JWT_SECRET`        | Secret key for JWT authentication (required)    |                     |
| `POSTGRES_DB`       | Name of the PostgreSQL database                 | `open_blog`         |
| `POSTGRES_USER`     | PostgreSQL username                             | `blog_user`         |
| `PORT`              | Port for the blog application                   | `80`                |
| `CORS_ORIGINS`      | Allowed origins for CORS                        | `http://localhost`  |
| `BASE_URL`          | Base URL for the application                    | `http://localhost`  |

---

## Limitations

### Horizontal Scaling
OS Blog uses a contained instance of PostgreSQL, which makes horizontal scaling challenging. If you require horizontal scaling, at the moment this solution is not prepared to allow setting up an external database service. (However have it in our plans)

---

## Notes:
- **Security**: Ensure strong passwords and secrets for production deployments.
- **First Startup**: The first startup may take a few minutes as the database initializes.
- **Logs**: View logs using `docker logs os-blog -f`.

For more details, visit the [GitHub repository](https://github.com/macadiz/os-blog).
