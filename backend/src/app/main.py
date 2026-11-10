from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def health_check_uvicorn():
    return {"server": "working"}
