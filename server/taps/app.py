"""Entrypoint to Flask server."""

__author__ = "Dillon Kerr"

from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello():
    """Hello world route."""
    return "Hello World!"
