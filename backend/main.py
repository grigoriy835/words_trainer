from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_response import Response
import sqlite3
import logging

logging.basicConfig(level=logging.DEBUG)


async def extract_words_list(request: Request) -> Response:
    return web.Response(text='')


async def save_word(request: Request) -> Response:
    return web.Response(text='')


app = web.Application()
app.router.add_get('/words_list', extract_words_list)
app.router.add_put('/word', extract_words_list)


def run_server(host, port):
    web.run_app(app, host=host, port=port)


def setup_db():
    # try:
    con = sqlite3.connect('main.db')
    con.execute('''CREATE TABLE words (word varchar(200), translation varchar(200), category varchar(50))''')
    con.close()


# except Exception as e:
#     pass


if __name__ == '__main__':
    setup_db()
    run_server(None, 9890)
