FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
COPY src ./src
COPY test ./test
COPY tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs .prettierrc ./

RUN pnpm exec prisma generate
RUN pnpm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/generated ./prisma/generated

EXPOSE 3000
CMD ["node", "dist/main"]
