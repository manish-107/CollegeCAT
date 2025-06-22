from sqlalchemy import Integer, String, Boolean, DateTime, Enum, ForeignKey, JSON, func
from sqlalchemy.orm import (
    declarative_base,
    DeclarativeBase,
    relationship,
    mapped_column,
    Mapped,
)
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
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False)
    oauth_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    oauth_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    joining_year: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    preferences: Mapped[list["LecturerPreferences"]] = relationship(
        "LecturerPreferences", back_populates="lecturer"
    )
    assignments_given: Mapped[list["LecturerSubAssignments"]] = relationship(
        "LecturerSubAssignments", foreign_keys="LecturerSubAssignments.assigned_by"
    )
    assignments_received: Mapped[list["LecturerSubAssignments"]] = relationship(
        "LecturerSubAssignments", foreign_keys="LecturerSubAssignments.lecturer_id"
    )

    def __repr__(self):
        return f"<User(id={self.user_id}, uname='{self.uname}', email='{self.email}', role='{self.role.name}')>"


class AcademicYears(BaseClass):
    __tablename__ = "academicyears"

    year_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    academic_year: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    batches: Mapped[list["Batches"]] = relationship(
        "Batches", back_populates="year", cascade="all, delete"
    )
    subjects: Mapped[list["Subjects"]] = relationship(
        "Subjects", back_populates="year", cascade="all, delete"
    )
    preferences: Mapped[list["LecturerPreferences"]] = relationship(
        "LecturerPreferences", back_populates="year", cascade="all, delete"
    )
    assignments: Mapped[list["LecturerSubAssignments"]] = relationship(
        "LecturerSubAssignments", back_populates="academic_year", cascade="all, delete"
    )
    timetable_formats: Mapped[list["TimetableHourFormats"]] = relationship(
        "TimetableHourFormats", back_populates="year"
    )
    timetables: Mapped[list["Timetable"]] = relationship(
        "Timetable", back_populates="year", cascade="all, delete"
    )
    workflow_stages: Mapped[list["WorkflowStage"]] = relationship(
        "WorkflowStage", back_populates="academic_year"
    )

    def __repr__(self):
        return f"<AcademicYear(id={self.year_id}, year='{self.academic_year}')>"


class Batches(BaseClass):
    __tablename__ = "batches"

    batch_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("academicyears.year_id", ondelete="RESTRICT"),
        nullable=False,
    )
    section: Mapped[str] = mapped_column(String(10), nullable=False)
    noOfStudent: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    year: Mapped["AcademicYears"] = relationship(
        "AcademicYears", back_populates="batches"
    )
    assignments: Mapped[list["LecturerSubAssignments"]] = relationship(
        "LecturerSubAssignments", back_populates="batch", cascade="all, delete"
    )
    formats: Mapped[list["TimetableHourFormats"]] = relationship(
        "TimetableHourFormats", back_populates="batch", cascade="all, delete"
    )
    timetables: Mapped[list["Timetable"]] = relationship(
        "Timetable", back_populates="batch", cascade="all, delete"
    )

    __table_args__ = (
        UniqueConstraint('year_id', 'section', name='uq_year_section'),
    )

    def __repr__(self):
        return f"<Batch(id={self.batch_id}, section='{self.section}', year_id={self.year_id})>"


class Subjects(BaseClass):
    __tablename__ = "subjects"

    subject_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("academicyears.year_id", ondelete="RESTRICT"),
        nullable=False,
    )
    subject_name: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_code: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    subject_type: Mapped[SubjectTypeEnum] = mapped_column(
        Enum(SubjectTypeEnum), nullable=False
    )
    no_of_hours_required: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    year: Mapped["AcademicYears"] = relationship(
        "AcademicYears", back_populates="subjects"
    )
    preferences: Mapped[list["LecturerPreferences"]] = relationship(
        "LecturerPreferences", back_populates="subject", cascade="all, delete"
    )
    assignments: Mapped[list["LecturerSubAssignments"]] = relationship(
        "LecturerSubAssignments", back_populates="subject", cascade="all, delete"
    )

    def __repr__(self):
        return f"<Subject(id={self.subject_id}, name='{self.subject_name}', code='{self.subject_code}', type='{self.subject_type.name}')>"


# Continue the other models in a similar manner.


class LecturerPreferences(BaseClass):
    __tablename__ = "lecturerpreferences"

    preference_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lecturer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False
    )
    year_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("academicyears.year_id", ondelete="RESTRICT"),
        nullable=False,
    )
    preferred_time: Mapped[JSON] = mapped_column(JSON, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lecturer: Mapped["Users"] = relationship("Users", back_populates="preferences")
    subject: Mapped["Subjects"] = relationship("Subjects", back_populates="preferences")
    year: Mapped["AcademicYears"] = relationship(
        "AcademicYears", back_populates="preferences"
    )

    __table_args__ = (
        UniqueConstraint(
            "lecturer_id", "subject_id", "year_id", name="unique_lecturer_subject_year"
        ),
    )

    def __repr__(self):
        return f"<LecturerPreference(id={self.preference_id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, year_id={self.year_id})>"


class LecturerSubAssignments(BaseClass):
    __tablename__ = "lecturersubassignments"

    assignment_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lecturer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False
    )
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False
    )
    academic_year_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("academicyears.year_id", ondelete="RESTRICT"),
        nullable=False,
    )
    assigned_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lecturer: Mapped["Users"] = relationship(
        "Users", back_populates="assignments_received", foreign_keys=[lecturer_id]
    )
    subject: Mapped["Subjects"] = relationship("Subjects", back_populates="assignments")
    batch: Mapped["Batches"] = relationship("Batches", back_populates="assignments")
    academic_year: Mapped["AcademicYears"] = relationship(
        "AcademicYears", back_populates="assignments"
    )
    assigned_by_user: Mapped["Users"] = relationship(
        "Users", back_populates="assignments_given", foreign_keys=[assigned_by]
    )

    def __repr__(self):
        return f"<LecturerSubAssignment(id={self.assignment_id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, batch_id={self.batch_id}, academic_year_id={self.academic_year_id})>"


class TimetableHourFormats(BaseClass):
    __tablename__ = "timetablehourformats"

    format_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    format_name: Mapped[str] = mapped_column(String(50), nullable=False)
    year_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False
    )
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False
    )
    format_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    batch: Mapped["Batches"] = relationship("Batches", back_populates="formats")
    year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="timetable_formats")
    timetables: Mapped[list["Timetable"]] = relationship(
        "Timetable", back_populates="format", cascade="all, delete"
    )

    def __repr__(self):
        return f"<TimetableHourFormat(id={self.format_id}, name='{self.format_name}', year_id={self.year_id}, batch_id={self.batch_id})>"


class Timetable(BaseClass):
    __tablename__ = "timetables"

    timetable_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    format_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("timetablehourformats.format_id", ondelete="RESTRICT"),
        nullable=False,
    )
    year_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False
    )
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False
    )
    timetable_data: Mapped[dict] = mapped_column(
        JSON, 
        nullable=False,
        comment="JSON structure containing daily subject schedules. Format: {'monday': ['subject1', 'subject2'], 'tuesday': ['subject1', 'subject2'], ...}"
    )
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    batch: Mapped["Batches"] = relationship("Batches", back_populates="timetables")
    format: Mapped["TimetableHourFormats"] = relationship(
        "TimetableHourFormats", back_populates="timetables"
    )
    year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="timetables")
    approvals: Mapped[list["Approvals"]] = relationship(
        "Approvals", back_populates="timetable", cascade="all, delete"
    )

    def __repr__(self):
        return f"<Timetable(id={self.timetable_id}, batch_id={self.batch_id}, year_id={self.year_id})>"


class Approvals(BaseClass):
    __tablename__ = "approvals"

    approval_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    timetable_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("timetables.timetable_id", ondelete="RESTRICT"),
        nullable=False,
    )
    approval_status: Mapped[ApprovalStatusEnum] = mapped_column(
        Enum(ApprovalStatusEnum), nullable=False
    )
    approval_stage: Mapped[WorkflowStageEnum] = mapped_column(
        Enum(WorkflowStageEnum), nullable=False
    )
    approved_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    timetable: Mapped["Timetable"] = relationship(
        "Timetable", back_populates="approvals"
    )

    def __repr__(self):
        return f"<Approval(id={self.approval_id}, timetable_id={self.timetable_id}, status='{self.approval_status.name}', stage='{self.approval_stage.name}')>"


class LecturerSubjectPriority(BaseClass):
    __tablename__ = "lecturer_subject_priorities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lecturer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False
    )
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=True
    )
    year_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False
    )
    priority: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    __table_args__ = (
        UniqueConstraint("lecturer_id", "subject_id", "batch_id", "year_id", name="unique_lecturer_subject_batch_priority"),
    )

    def __repr__(self):
        return f"<LecturerSubjectPriority(id={self.id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, batch_id={self.batch_id}, priority={self.priority})>"


class LecturerSubjectAllocation(BaseClass):
    __tablename__ = "lecturer_subject_allocations"

    allocation_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lecturer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False
    )
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False
    )
    year_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False
    )
    allocated_priority: Mapped[int] = mapped_column(Integer, nullable=False)  # The priority that was allocated
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    __table_args__ = (
        UniqueConstraint("subject_id", "batch_id", "year_id", name="unique_subject_batch_year_allocation"),
    )

    def __repr__(self):
        return f"<LecturerSubjectAllocation(allocation_id={self.allocation_id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, batch_id={self.batch_id}, year_id={self.year_id})>"


class WorkflowStage(BaseClass):
    __tablename__ = "workflow_stages"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    year_id: Mapped[int] = mapped_column(Integer, ForeignKey("academicyears.year_id"), nullable=False)
    current_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    
    # Relationships
    academic_year: Mapped["AcademicYears"] = relationship("AcademicYears", back_populates="workflow_stages")
    
    def __repr__(self):
        return f"<WorkflowStage(id={self.id}, year_id={self.year_id}, current_step={self.current_step}, is_completed={self.is_completed})>"
