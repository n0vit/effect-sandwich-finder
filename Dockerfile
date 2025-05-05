FROM node:lts-alpine3.21 AS base
ENV APP_HOME /app

WORKDIR ${APP_HOME}


# Install node modules
FROM base AS install
RUN npm install -g pnpm
RUN mkdir -p /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --frozen-lockfile


FROM install
COPY --from=install /temp/prod/node_modules /app/node_modules
COPY . .

CMD ["pnpm", "run", "start"]
