FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6767
ENV HOSTNAME="0.0.0.0"

# Copy package metadata and built application from runner context
COPY app/package.json app/package-lock.json ./
COPY app/node_modules ./node_modules
COPY app/.next ./.next
COPY app/public ./public

EXPOSE 6767

CMD ["npm", "run", "start"]
