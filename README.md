# Mobile Web IDE

A mobile-first, OLED-dark code workspace with an iOS-inspired glass interface.

## Features
- HTML, CSS, JavaScript and Python editor tabs
- Live HTML/CSS/JS preview in a sandboxed iframe
- Python execution in the browser through Pyodide (loaded from CDN)
- Local project files saved in browser storage
- Create, rename, delete and switch files
- Import files and export individual files or the whole project as ZIP
- Responsive layout designed for phone screens
- Flask + Gunicorn backend and Render deployment configuration

## Run locally
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Open `http://127.0.0.1:5000`.

## Deploy to Render
1. Push this folder to a GitHub repository.
2. In Render, choose **New + → Blueprint** and connect the repository.
3. Render reads `render.yaml`, installs requirements and starts Gunicorn.
4. Open the generated URL.

## Notes
- HTML/CSS/JS preview runs in a sandboxed iframe.
- Python runs client-side using Pyodide from jsDelivr. The first run needs internet access.
- Project files are stored in this browser's local storage. Clearing site data or switching browsers can remove them. Export ZIP backups regularly.
- This is a front-end learning IDE, not a secure multi-user cloud IDE. It does not execute uploaded Python on the Flask server.
