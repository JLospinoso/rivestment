FROM node:7.9.0
RUN npm install gulp-cli -g
WORKDIR /opt/Rivestment/
COPY package.json /opt/Rivestment/
RUN npm install
COPY web /opt/Rivestment/web
COPY Gulpfile.js /opt/Rivestment/
RUN gulp
COPY index.js /opt/Rivestment/
COPY engine /opt/Rivestment/engine
COPY slack /opt/Rivestment/slack
RUN gulp test