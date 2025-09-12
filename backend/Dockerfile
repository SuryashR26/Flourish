# 1. Use Node.js LTS
FROM node:18

# 2. Set the working directory
WORKDIR /usr/src/app

# 3. Copy package.json and lock file first
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy the rest of the backend code
COPY . .

# 6. Expose your backend port (check if it's 5000 in index.js)
EXPOSE 5000

# 7. Start backend
CMD ["node", "index.js"]
