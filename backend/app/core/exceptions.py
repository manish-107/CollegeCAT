from fastapi import status
from typing import Optional, Any
import traceback

class BaseAPIException(Exception):
    def __init__(
        self,
        message: str,
        user_message: Optional[str] = None,
        details: Optional[Any] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: Optional[str] = None,
    ):
        self.message = message
        self.user_message = user_message or message
        self.details = details
        self.status_code = status_code
        self.error_code = error_code
        self.traceback = traceback.format_exc()
        super().__init__(self.message)


class NotFoundException(BaseAPIException):
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(
            message=message,
            user_message="The requested resource could not be found.",
            details=details,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND"
        )