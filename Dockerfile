FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Next.js reads NEXT_PUBLIC_* from the build environment directly.

RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
