from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_response import Response
import sqlite3
import logging

logging.basicConfig(level=logging.DEBUG)
db_name = 'main.db'


async def extract_words_list(request: Request) -> Response:
    req_data = await request.json() if await request.text() else {}
    query = 'SELECT * FROM words'
    params = []
    if 'category' in req_data:
        query += ' where category = ?'
        params.append(req_data['category'])
    else:
        query += ' where category <> ?'
        params.append('deleted')
    con = sqlite3.connect(db_name)
    cur = con.cursor()
    data = [{'id': row[0], 'word': row[1], 'translation': row[2], 'category': row[3]} for row in
            cur.execute(query, params)]

    con.close()
    return web.json_response(data=data, headers={'Access-Control-Allow-Origin': '*'})


def save_word_func(con, word: str, translation: str, id: str = None, category: str = None):
    if id:
        query = 'UPDATE words SET word = ?, translation = ?' + (
            ', category = ?' if category else '') + ' WHERE id = ?'
        params = [word, translation]
        if category:
            params.append(category)
        params.append(id)

        con.execute(query, params)
    else:
        con.execute('''INSERT INTO words (word, translation, category) VALUES (?, ?, ?)''',
                    (word, translation, category if category else 'default'))


async def save_word(request: Request) -> Response:
    data = await request.json()

    con = sqlite3.connect(db_name)
    save_word_func(con, **data)
    con.commit()
    con.close()

    return web.Response(headers={'Access-Control-Allow-Origin': '*'})


async def save_word_batch(request: Request) -> Response:
    con = sqlite3.connect(db_name)
    data = await request.json()
    for item in data:
        save_word_func(con, **item)
    con.commit()
    con.close()

    return web.Response(headers={'Access-Control-Allow-Origin': '*'})


async def delete_word(request: Request) -> Response:
    data = await request.json()
    assert 'id' in data

    con = sqlite3.connect(db_name)
    con.execute('UPDATE words SET category = "deleted" WHERE id = ', [data[id]])
    con.commit()
    con.close()

    return web.Response(headers={'Access-Control-Allow-Origin': '*'})


app = web.Application()
app.router.add_get('/words_list', extract_words_list)
app.router.add_post('/save_word', save_word)
app.router.add_post('/delete_word', delete_word)
app.router.add_post('/save_word_batch', save_word_batch)


def run_server(host, port):
    web.run_app(app, host=host, port=port)


def setup_db():
    con = sqlite3.connect(db_name)
    try:
        con.execute(
            '''CREATE TABLE words (id INTEGER PRIMARY KEY, word varchar(200), translation varchar(200), category varchar(50))''')

    except sqlite3.OperationalError as e:
        pass
    con.close()


if __name__ == '__main__':
    setup_db()
    run_server(None, 9890)
