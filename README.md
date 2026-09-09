# AIPOCH Web

Standalone Next.js 16 application using React, TypeScript, Tailwind CSS and Bun.
The repository root is the application root. UI primitives are local source files
in `components/ui`; all dependencies are declared in one `package.json`.

## Local development

Use Bun 1.3.14 (the same version used by the Docker image):

```sh
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

Fill the runtime settings for your environment. Development runs at
[http://localhost:3202](http://localhost:3202). The browser API URL must be reachable
from the browser; `INTERNAL_API_URL` can use a separate server-accessible address.
The API is an external service and is not shipped in this repository.
Optional analytics settings may remain empty.

```sh
bun run test:unit
bun run typecheck
bun run lint
bunx playwright install chromium
bun run test:e2e
bun run build
bun run start
```

Playwright starts an isolated development server on port 3212 and covers desktop
and mobile Chromium. Production `start` uses port 3000 by default (`PORT` overrides it).

## Docker Compose

```sh
cp .env.example .env
# Fill the API, site, asset and public Wiki addresses for your deployment.
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
```

Compose fixes `web` to `ghcr.io/aipoch/aipoch-web:latest` on port 3060 and
`openscience-wiki` to `ghcr.io/aipoch/openscience-wiki:latest` on port 3062.
Images and host ports are defined directly in `compose.yaml`. The Web service reaches
Wiki through `http://openscience-wiki`; the public Wiki prefix must be reachable
from visitors' browsers. Wiki routes live below `/docs`. Reverse proxy and TLS
configuration are deployment responsibilities.

The multi-stage Dockerfile installs with the frozen Bun lockfile and runs the
Next.js standalone server as the non-root `bun` user. It includes `public` and
`.next/static`; local environment files and agent artifacts are excluded from
the build context. Public settings are injected at container startup via
`next-runtime-env`, allowing the same image to run in different environments.
Wiki uses the `aipoch` image namespace and retains its `linux/amd64` platform.

### Local image validation

Build Web explicitly with the same tag used by Compose. Ensure the Wiki image is
already cached locally, then prevent registry pulls and force container recreation:

```sh
docker build --platform linux/amd64 -t ghcr.io/aipoch/aipoch-web:latest .
docker compose up -d --pull never --no-build --force-recreate --wait
```

Compose contains no build configuration. These command options make local
validation use the locally built Web image and the cached Wiki image.

## Image publishing

`.github/workflows/build-push-web.yml` builds the root Dockerfile on every push
to `main` and publishes `ghcr.io/aipoch/aipoch-web` with `latest`, `main`, and
`sha-<full-commit>` tags. It uses `GITHUB_TOKEN` with `packages: write`; private
packages require registry authentication when pulled. The workflow can also be
run manually on `main`. It builds Linux AMD64 images and uses the GitHub Actions
build cache. The workflow takes effect once this change is present on `main`;
creating or renaming that branch is outside this migration.

## Migration from the previous layout

Run commands from the repository root instead of `web` or `web/apps/user`.
The former shared UI and TypeScript packages are now local source and root
configuration. The API, CLI, Admin application, standalone Skills admin page,
and AWS deployment workflows have been removed. Existing Web routes and
external API contracts are preserved. Deployment automation must use the root
`Dockerfile`, `compose.yaml` and new `web` service name.
