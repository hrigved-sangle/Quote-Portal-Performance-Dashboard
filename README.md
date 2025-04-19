# Quote Portal & Performance Dashboard

## Project Overview
A full-stack web application that allows contractors to submit project quotes and view an interactive performance dashboard for roofing projects. It simulates how a contractor-facing system might work in real-world scenarios.

### Features:
- Submit project quotes via a form (Contractor name, company, roof size, type, location, etc.)
- Backend API built with Flask and SQLite to store and retrieve data
- Dashboard that displays:
  - Projects by State (Bar Chart)
  - Average Roof Size by Type (Pie Chart)
  - Monthly Trend of Projects (Line Chart)
- Data filters (by state, type, and year)
- PDF export of the dashboard charts
- Stylish UI with custom CSS

## Tools & Technologies
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Python, Flask, SQLite
- **Other Libraries**:
  - Faker (for mock data)
  - PDFKit (for exporting dashboard as PDF)
  - Chart.js (for rendering charts)

## How to Run It Locally

### Requirements:
- Python 3.x installed on your system

### Steps:
1. **Clone the repository**
   ```bash
   git clone https://github.com/hrigved-sangle/Quote-Portal-Performance-Dashboard.git
   cd Quote-Portal-Performance-Dashboard
2. **Create virtual environment (optional)**
    ```bash
    python -m venv venv
    source venv/bin/activate        # Mac/Linux
    .\venv\Scripts\activate         # Windows
3. **Install dependencies**
    ```bash
    pip install -r requirements.txt
4. **Run the app**
    ```bash
    python app.py
5. **Open index.html and dashboard.html in your browser**

## Mock Data
1. Generated 1000+ fake roofing project entries using the Faker library to simulate real-world data.
2. Data includes roof size, type, contractor info, location, and project dates.
3. *quotes.db* is the file which has the mock data stored.

## Future Improvements
1. Add user login and authentication
2. Add validations and real-time error messages
3. Export dashboard data to CSV
4. Add live map visualizations using Google Maps
5. Deploy on a cloud platform (e.g., Heroku or Render)

