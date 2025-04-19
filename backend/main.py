from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, Query
from requests_oauthlib import OAuth2Session
from fastapi.responses import JSONResponse
import xml.etree.ElementTree as ET
from pydantic import BaseModel

app = FastAPI()

origins = ["https://zabop.github.io", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PostBody(BaseModel):
    msg: str


def auth(auth_header):

    token = {
        "access_token": auth_header.replace("Bearer ", ""),
        "token_type": "Bearer",
        "scope": ["read_prefs"],
    }

    resp = OAuth2Session(token=token).get(
        "https://api.openstreetmap.org/api/0.6/user/details"
    )

    user = ET.fromstring(resp.content).find("user").attrib["display_name"]

    return user


@app.get("/get")
async def get(request: Request, msg: str = Query(...)):

    try:
        user = auth(request.headers.get("Authorization"))
        resp = f"Hi {user}, your message via GET was: {msg}"
    except Exception as e:
        resp = e

    return JSONResponse({"message": resp})


@app.post("/post")
async def post(postBody: PostBody):

    try:
        resp = f"Hi user, your message via POST was: {postBody.msg}"
    except Exception as e:
        resp = e

    return JSONResponse({"message": resp})
