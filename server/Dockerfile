FROM python:3.8.3-alpine

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg dependencies
RUN apk update \
  && apk add curl postgresql-dev gcc python3-dev musl-dev

# install dependencies

RUN curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python
RUN source $HOME/.poetry/env
RUN pip install --upgrade pip
COPY poetry.lock pyproject.toml ./
RUN $HOME/.poetry/bin/poetry install --no-dev
RUN $HOME/.poetry/bin/poetry show

# copy project
COPY . .