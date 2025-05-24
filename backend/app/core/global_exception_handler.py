import logging
from fastapi import Request
from typing import Union,List
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError, DBAPIError

logger = logging.getLogger("uvicorn.error")  # or your custom logger

class GlobalExceptionHandler:
    @staticmethod
    async def handle(request: Request, exc: Exception):
        status_code = 500
        error_type = type(exc).__name__
        error_message: Union[str, List[str]] = "An unexpected error occurred"

        if isinstance(exc, StarletteHTTPException):
            error_message = exc.detail
            status_code = exc.status_code

        elif isinstance(exc, RequestValidationError):
            error_message = [e['msg'] for e in exc.errors()]
            status_code = 422

        elif isinstance(exc, IntegrityError):
            error_message = "Database integrity error"
            status_code = 400

        elif isinstance(exc, DBAPIError):
            error_message = "Database connection or execution error"
            status_code = 500

        elif hasattr(exc, "detail"):
            error_message = str(getattr(exc, "detail", str(exc)))
        else:
            error_message = str(exc)

        # Log concise info only (no traceback)
        logger.error(f"Exception caught: {error_type}: {error_message} at {request.method} {request.url.path}")

        return JSONResponse(
            status_code=status_code,
            content={
                "data": None,
                "error": [{
                    "type": error_type,
                    "message": error_message,
                    "path": str(request.url.path),
                    "method": request.method
                }],
                "success": False,
            }
        )
