# Orbit Compliance

Modern MERN SaaS scaffold for AI-driven compliance auditing with a desktop-style UI.

## Suggested Folder Structure

```text
Orbit Compliance/
├── client/
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.js
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Dock.jsx
│       │   ├── DropZone.jsx
│       │   ├── StatCard.jsx
│       │   └── Window.jsx
│       └── data/
│           └── modules.js
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── models/
│   │   └── ComplianceReport.js
│   └── uploads/
└── README.md
```

## Local Setup

1. Install dependencies in both apps.
2. In `server`, copy `.env.example` to `.env` and set your MongoDB Atlas password in `DB_PASSWORD`.
3. Run the API on `http://localhost:5000`.
4. Run the client on `http://localhost:5173`.

## Streamlit Deployment Notes

You have two practical options:

1. Static React build + Express API
   - Build the React app with `npm run build` in `client`.
   - Serve the compiled `dist` folder from Express or a static host.
   - Keep Streamlit only as a thin launcher or wrapper if your platform requires Python.

2. Streamlit wrapper
   - Create a minimal `streamlit_app.py`.
   - Embed the deployed React frontend in an `iframe`, or link users into the React app.
   - Use Streamlit for authentication/demo controls while Express remains the API backend.

Example wrapper:

```python
import streamlit as st

st.set_page_config(page_title="Orbit Compliance", layout="wide")
st.title("Orbit Compliance")
st.components.v1.iframe(
    "https://your-frontend-url.example.com",
    height=900,
    scrolling=True,
)
```

For production, a standard React + Node deployment is usually cleaner than putting the full app inside Streamlit.
# Orbit-Compliance
