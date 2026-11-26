from pydantic import BaseModel


class OperationResponse(BaseModel):
    success: bool = True


class CountResponse(BaseModel):
    count: int
