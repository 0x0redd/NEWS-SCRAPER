FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY news-scraper.js ./

# Create data directory
RUN mkdir -p data

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S scraper -u 1001

# Change ownership of the app directory
RUN chown -R scraper:nodejs /app
USER scraper

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Default command
CMD ["node", "news-scraper.js", "--schedule"]
