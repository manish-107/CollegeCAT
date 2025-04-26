from app.db.postgres_client import get_db
from sqlalchemy.orm import Session
from app.models.model import Users as UserModel

def get_userby_email(email: str, db: Session):
    # Get user details by email
    return db.query(UserModel).filter(UserModel.email == email).first()
