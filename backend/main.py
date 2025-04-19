from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, Query
from requests_oauthlib import OAuth2Session
from fastapi.responses import JSONResponse
import xml.etree.ElementTree as ET

app = FastAPI()

origins = ["https://zabop.github.io", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/send_get")
async def mark_nodes_as(request: Request, msg: str = Query(...)):

    auth_header = request.headers.get("Authorization")
    token = {
        "access_token": auth_header.replace("Bearer ", ""),
        "token_type": "Bearer",
        "scope": ["write_api", "read_prefs"],
    }

    try:

        oauth_session = OAuth2Session(token=token)
        resp = oauth_session.get("https://api.openstreetmap.org/api/0.6/user/details")

        root = ET.fromstring(resp.content)
        user = root.find("user").attrib["display_name"]

        resp = f"Hi {user}, your message via GET was: {msg}"
    except Exception as e:
        resp = e

    return JSONResponse({"message": resp})
