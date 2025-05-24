from fastapi.responses import JSONResponse
from typing import Any, Optional

class ResponseFormatter:
    @staticmethod
    def success(data: Any = None, message: Optional[str] = None, status_code: int = 200):
        return JSONResponse(
            status_code=status_code,
            content={
                "data": data,
                "message":message,
                "error": None,
                "success": True
            }
        )

    @staticmethod
    def failure(error: list[str] | str,message: Optional[str] = None, status_code: int = 400):
        return JSONResponse(
            status_code=status_code,
            content={
                "data": None,
                "message":message,
                "error": error if isinstance(error, list) else [error],
                "success": False
            }
        )
