# effect-sandwich-finder

A sandwich finder mock built with [Effect TS](https://github.com/Effect-TS/core) and OpenTelemetry.  
This tool generates a continuous chain of “blocks,” processes each block to detect sandwich opportunities, and
optionally persists findings - all with structured tracing and pluggable runtimes (Node.js, Docker).

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)


## Features

- Stream-based block generation with `Stream.unfoldEffect`
- Concurrent processing and saving of sandwich detections
- Full OpenTelemetry tracing via `@effect/opentelemetry`
- Graceful shutdown on SIGINT/SIGTERM

## Prerequisites

- Node.js ≥ 18
- pnpm (or npm/yarn)
- Docker (optional, for containerized runs)

## Installation

1. Clone this repo `git clone git@github.com:n0vit/effect-sandwich-finder.git`
2. Go to repo dir `cd effect-sandwich-finder`
3. Inside repo directory run  `pnpm i` or `yarn -i`

## Configuration

| Environment Variable | Description                                               | Default              |
|----------------------|-----------------------------------------------------------|----------------------|
| `OTEL_URL`           | OTLP HTTP endpoint for traces export *see* `.env.example` | _http://jaeger:4318_ |

1. Create a `.env` file or export in your shell
2. Copy text from .env.example

## Usage

### Run Locally via Node.js

If you have not already started Jaeger, run  `docker-compose -p effect-sandwich-finder up -d jaeger`

Start program via command `pnpm run start` or `yarn run start`

### Run in Docker

Run command `docker-compose -p effect-sandwich-finder up -d`

See container log `docker logs -f --tail 15 sandwich-finder`
   


