FROM node:7.0.0
WORKDIR /opt/Rivestment/
COPY *.json /opt/Rivestment/
RUN npm install
COPY web /opt/Rivestment/web
RUN npm run-script copyimg
RUN npm run-script copycss
RUN npm run-script copyhtml
RUN npm run-script copyjs
RUN npm run-script compile
COPY *.js /opt/Rivestment/
COPY engine /opt/Rivestment/engine
COPY slack /opt/Rivestment/slack
