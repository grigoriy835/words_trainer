FROM node:18-alpine as build
WORKDIR /app
VOLUME frontend/ /app
RUN npm install
RUN npm run build

FROM python:3.9
WORKDIR /app
RUN mkdir db
COPY backend/main.py /app
COPY requirements.txt /app
RUN pip3 install -r requirements.txt

CMD [ "python", "./main.py" ]
