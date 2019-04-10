FROM node:11

RUN npm install pm2 -g

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose default ports
EXPOSE 8002 8003

# Start the app
CMD [ "pm2-runtime", "server/index.js" ]