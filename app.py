from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from collections import Counter
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_NAME = "quotes.db"

def build_filters(params):
    filters = []
    values = []

    if 'state' in params and params['state']:
        filters.append("state = ?")
        values.append(params['state'])

    if 'roof_type' in params and params['roof_type']:
        filters.append("roof_type = ?")
        values.append(params['roof_type'])

    if 'year' in params and params['year']:
        filters.append("strftime('%Y', project_date) = ?")
        values.append(params['year'])

    where_clause = "WHERE " + " AND ".join(filters) if filters else ""
    return where_clause, values

@app.route('/api/filters')
def get_filters():
    conn = sqlite3.connect('quotes.db')
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT state FROM quotes ORDER BY state')
    states = [row[0] for row in cursor.fetchall()]

    cursor.execute('SELECT DISTINCT roof_type FROM quotes ORDER BY roof_type')
    roof_types = [row[0] for row in cursor.fetchall()]

    cursor.execute('SELECT DISTINCT project_date FROM quotes ORDER BY project_date DESC')
    dates = [row[0] for row in cursor.fetchall()]

    conn.close()
    return jsonify({
        'states': states,
        'roof_types': roof_types,
        'dates': dates
    })

def init_db():
    if not os.path.exists(DB_NAME):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE quotes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contractor_name TEXT,
                company TEXT,
                roof_size INTEGER,
                roof_type TEXT,
                city TEXT,
                state TEXT,
                project_date TEXT
            )
        """)
        conn.commit()
        conn.close()

@app.route('/api/quotes', methods=['POST'])
def submit_quote():
    data = request.get_json()
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO quotes (contractor_name, company, roof_size, roof_type, city, state, project_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('contractorName'),
        data.get('company'),
        data.get('roofSize'),
        data.get('roofType'),
        data.get('city'),
        data.get('state'),
        data.get('projectDate')
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Quote submitted successfully'}), 201

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    state = request.args.get('state')
    roof_type = request.args.get('roofType')

    query = "SELECT * FROM quotes WHERE 1=1"
    params = []

    if state:
        query += " AND state = ?"
        params.append(state)
    if roof_type:
        query += " AND roof_type = ?"
        params.append(roof_type)

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()

    quotes = [
        {
            "id": row[0],
            "contractorName": row[1],
            "company": row[2],
            "roofSize": row[3],
            "roofType": row[4],
            "city": row[5],
            "state": row[6],
            "projectDate": row[7]
        }
        for row in results
    ]

    return jsonify(quotes)

@app.route('/api/stats/summary')
def summary_stats():
    where, values = build_filters(request.args)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(f"SELECT COUNT(*), AVG(roof_size), roof_type FROM quotes {where}", values)
    total, avg_size, _ = cursor.fetchone()

    cursor.execute(f"SELECT roof_type, COUNT(*) FROM quotes {where} GROUP BY roof_type ORDER BY COUNT(*) DESC LIMIT 1", values)
    common_type_row = cursor.fetchone()
    common_type = common_type_row[0] if common_type_row else "N/A"

    conn.close()
    return jsonify({
        "totalProjects": total or 0,
        "averageRoofSize": round(avg_size or 0, 2),
        "commonRoofType": common_type
    })


@app.route('/api/stats/by-state')
def projects_by_state():
    where, values = build_filters(request.args)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(f"SELECT state, COUNT(*) FROM quotes {where} GROUP BY state", values)
    data = cursor.fetchall()
    conn.close()
    return jsonify({row[0]: row[1] for row in data})

@app.route('/api/stats/roof-size-type')
def avg_roof_size_by_type():
    where, values = build_filters(request.args)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(f"SELECT roof_type, AVG(roof_size) FROM quotes {where} GROUP BY roof_type", values)
    data = cursor.fetchall()
    conn.close()
    return jsonify({row[0]: round(row[1], 2) for row in data})

@app.route('/api/stats/monthly-trend')
def monthly_project_trend():
    where, values = build_filters(request.args)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(f"""
        SELECT strftime('%Y-%m', project_date) AS month, COUNT(*)
        FROM quotes {where}
        GROUP BY month
        ORDER BY month
    """, values)
    data = cursor.fetchall()
    conn.close()
    return jsonify({row[0]: row[1] for row in data})


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
