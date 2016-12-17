FROM node:7.0.0
WORKDIR /opt/Rivestment/
COPY *.js /opt/Rivestment/
COPY *.json /opt/Rivestment/
COPY lib /opt/Rivestment/lib
RUN npm install
RUN npm run-script compile
RUN npm run-script copyhtml
RUN npm run-script copycss
RUN npm run-script copyjs
RUN npm run-script copyimg