# 1. Use Node.js Alpine image
FROM node:18-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package*.json ./
RUN npm ci

# 4. Copy the rest of your code
COPY . .

# 5. Build the Next.js app
RUN npm run build

# 6. Expose the app port
EXPOSE 3000

# 7. Start the app
CMD ["npm", "start"]
