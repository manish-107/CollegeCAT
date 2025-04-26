from app.db.postgres_client import get_db
from sqlalchemy.orm import Session
from app.models.model import Users as UserModel
from app.schemas.user_schema import signupData as userDetails

def get_userby_email(email: str, db: Session):
    # Get user details by email
    return db.query(UserModel).filter(UserModel.email == email).first()

def insert_userDetails(db: Session, userDetails: userDetails, email: str, oauth_provider: str, oauth_id: str):
    # Create a new User object
    new_user = UserModel(
        uname=userDetails.uname,
        email=email,
        role=userDetails.role,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        joining_year=userDetails.joining_year,
        is_active=True,
    )

    # Add the user to the session
    db.add(new_user)
    db.commit()  # Save changes to DB
    db.refresh(new_user)  # Refresh to get auto-generated fields like user_id

    return new_user 