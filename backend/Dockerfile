FROM python:3.9
WORKDIR /app
RUN mkdir db
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
COPY main.py /app

CMD [ "python", "./main.py" ]
