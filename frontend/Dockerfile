FROM oven/bun:1.2-alpine AS base
WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["bun", "run", "dev"]
