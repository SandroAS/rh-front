# rh-front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Rodando com Docker

Este projeto possui configurações para rodar em **ambientes de desenvolvimento** e **produção** usando Docker.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado  
- [Docker Compose](https://docs.docker.com/compose/install/) (opcional, mas recomendado)

---

### Desenvolvimento com hot reload (via Docker)

Este ambiente roda o servidor de desenvolvimento (Vite) dentro do container, com seu código local montado via volume para hot reload.

1. Build e start do container de desenvolvimento:

```sh
docker-compose -f docker-compose.dev.yml up --build
```

2. Acesse no navegador:

```sh
http://localhost:5173
```

3. O código que você alterar localmente será refletido automaticamente no navegador.

### Produção com build estático + Nginx

Neste ambiente, o projeto é buildado dentro do container e servido via Nginx.

1. Build e start do container de produção:
```sh
docker-compose -f docker-compose.prod.yml up --build
```

2. Acesse no navegador:
```sh
http://localhost:8080
```

#### Parar os containers
Para parar qualquer ambiente:
```sh
docker-compose down
```

#### Rodando sem Docker Compose
Se não estiver usando Docker Compose, pode rodar manualmente com:

- Desenvolvimento:
```sh
docker build -f Dockerfile.dev -t rh-dev .
```
```sh
docker run -it -p 5173:5173 -v $(pwd):/app -v /app/node_modules rh-dev
```
- Produção:
```sh
docker build -t rh-prod .
```
```sh
docker run -p 8080:80 rh-prod
```