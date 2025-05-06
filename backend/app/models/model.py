from sqlalchemy import Integer, String, Boolean, DateTime, Enum, ForeignKey, JSON, func
from sqlalchemy.orm import declarative_base, DeclarativeBase, relationship, mapped_column, Mapped
from sqlalchemy import UniqueConstraint
import enum

Base = declarative_base()
metadata = Base.metadata

class BaseClass(DeclarativeBase):
    pass

# Enums
class RoleEnum(enum.Enum):
    HOD = "HOD"
    TIMETABLE_COORDINATOR = "TIMETABLE_COORDINATOR"
    LECTURER = "LECTURER"

class SubjectTypeEnum(enum.Enum):
    CORE = "CORE"
    ELECTIVE = "ELECTIVE"
    LAB = "LAB"

class ApprovalStatusEnum(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class WorkflowStageEnum(enum.Enum):
    STEP_1_CREATE_YEAR_AND_BATCH = 1
    STEP_2_SUBJECT_MANAGEMENT = 2
    STEP_3_SUBJECT_PRIORITY_FORM = 3
    STEP_4_PRIORITY_SELECTION = 4
    STEP_5_AUTO_SUBJECT_ASSIGNMENT_AND_SEND_TO_HOD = 5
    STEP_6_HOD_REVIEW_AND_APPROVAL = 6
    STEP_7_FINALIZE_SUBJECT_ALLOCATION = 7
    STEP_8_TIMETABLE_CREATION = 8
    STEP_9_TIMETABLE_FORMAT_REVIEW_AND_FINALIZE = 9
    STEP_10_AUTOGENERATE_TIMETABLE_AND_SEND_TO_HOD = 10
    STEP_11_HOD_EDIT_AND_UPDATE_TIMETABLE = 11
    STEP_12_TIMETABLE_FINALIZATION = 12

class Users(BaseClass):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uname: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False)
    oauth_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    oauth_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    joining_year: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    created_academic_years: Mapped[list["AcademicYears"]] = relationship("AcademicYears", back_populates="creator")
    created_batches: Mapped[list["Batches"]] = relationship("Batches", back_populates="creator")
    created_subjects: Mapped[list["Subjects"]] = relationship("Subjects", back_populates="creator")
    preferences: Mapped[list["LecturerPreferences"]] = relationship("LecturerPreferences", back_populates="lecturer")
    assignments_given: Mapped[list["LecturerSubAssignments"]] = relationship("LecturerSubAssignments", foreign_keys='LecturerSubAssignments.assigned_by')
    assignments_received: Mapped[list["LecturerSubAssignments"]] = relationship("LecturerSubAssignments", foreign_keys='LecturerSubAssignments.lecturer_id')
    created_formats: Mapped[list["TimetableHourFormats"]] = relationship("TimetableHourFormats", back_populates="creator")
    created_timetables: Mapped[list["Timetable"]] = relationship("Timetable", back_populates="creator", foreign_keys='Timetable.created_by')

    def __repr__(self):
        return f"<User(id={self.user_id}, uname='{self.uname}', email='{self.email}', role='{self.role.name}')>"

class AcademicYears(BaseClass):
    __tablename__ = "academicyears"

    year_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    academic_year: Mapped[str] = mapped_column(String(50), nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    creator: Mapped["Users"] = relationship("Users", back_populates="created_academic_years")
    batches: Mapped[list["Batches"]] = relationship("Batches", back_populates="year", cascade="all, delete")
    subjects: Mapped[list["Subjects"]] = relationship("Subjects", back_populates="year", cascade="all, delete")
    preferences: Mapped[list["LecturerPreferences"]] = relationship("LecturerPreferences", back_populates="year", cascade="all, delete")
    assignments: Mapped[list["LecturerSubAssignments"]] = relationship("LecturerSubAssignments", back_populates="academic_year", cascade="all, delete")

    def __repr__(self):
        return f"<AcademicYear(id={self.year_id}, year='{self.academic_year}')>"

class Batches(BaseClass):
    __tablename__ = "batches"

    batch_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year_id: Mapped[int] = mapped_column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    section: Mapped[str] = mapped_column(String(10), nullable=False)
    noOfStudent: Mapped[int] = mapped_column(Integer, nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="batches")
    creator: Mapped["Users"] = relationship("Users", back_populates="created_batches")
    assignments: Mapped[list["LecturerSubAssignments"]] = relationship("LecturerSubAssignments", back_populates="batch", cascade="all, delete")
    formats: Mapped[list["TimetableHourFormats"]] = relationship("TimetableHourFormats", back_populates="batch", cascade="all, delete")
    timetables: Mapped[list["Timetable"]] = relationship("Timetable", back_populates="batch", cascade="all, delete")

    def __repr__(self):
        return f"<Batch(id={self.batch_id}, section='{self.section}', year_id={self.year_id})>"

class Subjects(BaseClass):
    __tablename__ = "subjects"

    subject_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year_id: Mapped[int] = mapped_column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    subject_name: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    subject_type: Mapped[SubjectTypeEnum] = mapped_column(Enum(SubjectTypeEnum), nullable=False)
    no_of_hours_required: Mapped[int] = mapped_column(Integer, nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="subjects")
    creator: Mapped["Users"] = relationship("Users", back_populates="created_subjects")
    preferences: Mapped[list["LecturerPreferences"]] = relationship("LecturerPreferences", back_populates="subject", cascade="all, delete")
    assignments: Mapped[list["LecturerSubAssignments"]] = relationship("LecturerSubAssignments", back_populates="subject", cascade="all, delete")
    timetables: Mapped[list["Timetable"]] = relationship("Timetable", back_populates="subject", cascade="all, delete")

    def __repr__(self):
        return f"<Subject(id={self.subject_id}, name='{self.subject_name}', code='{self.subject_code}', type='{self.subject_type.name}')>"

# Continue the other models in a similar manner.


class LecturerPreferences(BaseClass):
    __tablename__ = "lecturerpreferences"

    preference_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lecturer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False)
    year_id: Mapped[int] = mapped_column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    preferred_time: Mapped[JSON] = mapped_column(JSON, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lecturer: Mapped["Users"] = relationship("Users", back_populates="preferences")
    subject: Mapped["Subjects"] = relationship("Subjects", back_populates="preferences")
    year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="preferences")

    __table_args__ = (
        UniqueConstraint("lecturer_id", "subject_id", "year_id", name="unique_lecturer_subject_year"),
    )

    def __repr__(self):
        return f"<LecturerPreference(id={self.preference_id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, year_id={self.year_id})>"

class LecturerSubAssignments(BaseClass):
    __tablename__ = "lecturersubassignments"

    assignment_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lecturer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False)
    batch_id: Mapped[int] = mapped_column(Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False)
    academic_year_id: Mapped[int] = mapped_column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    assigned_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lecturer: Mapped["Users"] = relationship("Users", back_populates="assignments_received", foreign_keys=[lecturer_id])
    subject: Mapped["Subjects"] = relationship("Subjects", back_populates="assignments")
    batch: Mapped["Batches"] = relationship("Batches", back_populates="assignments")
    academic_year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="assignments")
    assigned_by_user: Mapped["Users"] = relationship("Users", back_populates="assignments_given", foreign_keys=[assigned_by])

    def __repr__(self):
        return f"<LecturerSubAssignment(id={self.assignment_id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, batch_id={self.batch_id}, academic_year_id={self.academic_year_id})>"

class TimetableHourFormats(BaseClass):
    __tablename__ = "timetablehourformats"

    format_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False)
    format_name: Mapped[str] = mapped_column(String(50), nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    batch: Mapped["Batches"] = relationship("Batches", back_populates="formats")
    creator: Mapped["Users"] = relationship("Users", back_populates="created_formats")
    timetables: Mapped[list["Timetable"]] = relationship("Timetable", back_populates="format", cascade="all, delete")

    def __repr__(self):
        return f"<TimetableHourFormat(id={self.format_id}, batch_id={self.batch_id}, format_name='{self.format_name}')>"

class Timetable(BaseClass):
    __tablename__ = "timetables"

    timetable_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False)
    format_id: Mapped[int] = mapped_column(Integer, ForeignKey("timetablehourformats.format_id", ondelete="RESTRICT"), nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    timetable_data: Mapped[JSON] = mapped_column(JSON, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    batch: Mapped["Batches"] = relationship("Batches", back_populates="timetables")
    subject: Mapped["Subjects"] = relationship("Subjects", back_populates="timetables")
    format: Mapped["TimetableHourFormats"] = relationship("TimetableHourFormats", back_populates="timetables")
    creator: Mapped["Users"] = relationship("Users", back_populates="created_timetables")
    approvals: Mapped[list["Approvals"]] = relationship("Approvals", back_populates="timetable", cascade="all, delete")

    def __repr__(self):
        return f"<Timetable(id={self.timetable_id}, batch_id={self.batch_id}, subject_id={self.subject_id})>"

class Approvals(BaseClass):
    __tablename__ = "approvals"

    approval_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    timetable_id: Mapped[int] = mapped_column(Integer, ForeignKey("timetables.timetable_id", ondelete="RESTRICT"), nullable=False)
    approval_status: Mapped[ApprovalStatusEnum] = mapped_column(Enum(ApprovalStatusEnum), nullable=False)
    approval_stage: Mapped[WorkflowStageEnum] = mapped_column(Enum(WorkflowStageEnum), nullable=False)
    approved_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    timetable: Mapped["Timetable"] = relationship("Timetable", back_populates="approvals")
    approver: Mapped["Users"] = relationship("Users", back_populates="approvals")

    def __repr__(self):
        return f"<Approval(id={self.approval_id}, timetable_id={self.timetable_id}, status='{self.approval_status.name}', stage='{self.approval_stage.name}')>"

class Logs(BaseClass):
    __tablename__ = "logs"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    user: Mapped["Users"] = relationship("Users", back_populates="logs")

    def __repr__(self):
        return f"<Log(id={self.log_id}, user_id={self.user_id}, action='{self.action}')>"

# Relationships and other parts of the schema
Users.logs = relationship("Logs", back_populates="user", cascade="all, delete")
Users.approvals = relationship("Approvals", back_populates="approver", cascade="all, delete")
