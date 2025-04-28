from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, JSON, func, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()
metadata = Base.metadata

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

class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    uname = Column(String(50), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    oauth_provider = Column(String(50), nullable=False)
    oauth_id = Column(String(100), unique=True, nullable=False)
    joining_year = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now())

    created_academic_years = relationship("AcademicYears", back_populates="creator")
    created_batches = relationship("Batches", back_populates="creator")
    created_subjects = relationship("Subjects", back_populates="creator")
    preferences = relationship("LecturerPreferences", back_populates="lecturer")
    assignments_given = relationship("LecturerSubAssignments", foreign_keys='LecturerSubAssignments.assigned_by')
    assignments_received = relationship("LecturerSubAssignments", foreign_keys='LecturerSubAssignments.lecturer_id')
    created_formats = relationship("TimetableHourFormats", back_populates="creator")
    created_timetables = relationship("Timetable", back_populates="creator", foreign_keys='Timetable.created_by')

    def __repr__(self):
        return f"<User(id={self.user_id}, uname='{self.uname}', email='{self.email}', role='{self.role.name}')>"    

class AcademicYears(Base):
    __tablename__ = "academicyears"

    year_id = Column(Integer, primary_key=True)
    academic_year = Column(String(50), nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    creator = relationship("Users", back_populates="created_academic_years")
    batches = relationship("Batches", back_populates="year", cascade="all, delete")
    subjects = relationship("Subjects", back_populates="year", cascade="all, delete")
    preferences = relationship("LecturerPreferences", back_populates="year", cascade="all, delete")
    assignments = relationship("LecturerSubAssignments", back_populates="academic_year", cascade="all, delete")

    def __repr__(self):
        return f"<AcademicYear(id={self.year_id}, year='{self.academic_year}')>"


class Batches(Base):
    __tablename__ = "batches"

    batch_id = Column(Integer, primary_key=True)
    year_id = Column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    section = Column(String(10), nullable=False)
    noOfStudent = Column(Integer, nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    year = relationship("AcademicYears", back_populates="batches")
    creator = relationship("Users", back_populates="created_batches")
    assignments = relationship("LecturerSubAssignments", back_populates="batch", cascade="all, delete")
    formats = relationship("TimetableHourFormats", back_populates="batch", cascade="all, delete")
    timetables = relationship("Timetable", back_populates="batch", cascade="all, delete")

    def __repr__(self):
        return f"<Batch(id={self.batch_id}, section='{self.section}', year_id={self.year_id})>"


class Subjects(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True)
    year_id = Column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    subject_name = Column(String(255), nullable=False)
    subject_code = Column(String(100), unique=True, index=True, nullable=False)
    subject_type = Column(Enum(SubjectTypeEnum), nullable=False)
    no_of_hours_required = Column(Integer, nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    year = relationship("AcademicYears", back_populates="subjects")
    creator = relationship("Users", back_populates="created_subjects")
    preferences = relationship("LecturerPreferences", back_populates="subject", cascade="all, delete")
    assignments = relationship("LecturerSubAssignments", back_populates="subject", cascade="all, delete")
    timetables = relationship("Timetable", back_populates="subject", cascade="all, delete")

    def __repr__(self):
        return f"<Subject(id={self.subject_id}, name='{self.subject_name}', code='{self.subject_code}', type='{self.subject_type.name}')>"


class LecturerPreferences(Base):
    __tablename__ = "lecturerpreferences"
    __table_args__ = (
        UniqueConstraint('lecturer_id', 'selected_sub_id', 'year_id', name='uq_preference'),
    )

    preference_id = Column(Integer, primary_key=True)
    lecturer_id = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    selected_sub_id = Column(Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False)
    year_id = Column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    priority = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())

    lecturer = relationship("Users", back_populates="preferences")
    subject = relationship("Subjects", back_populates="preferences")
    year = relationship("AcademicYears", back_populates="preferences")

    def __repr__(self):
        return f"<LecturerPreference(id={self.preference_id}, lecturer_id={self.lecturer_id}, subject_id={self.selected_sub_id}, year_id={self.year_id}, priority={self.priority})>"


class LecturerSubAssignments(Base):
    __tablename__ = "lecturersubassignments"

    assignment_id = Column(Integer, primary_key=True)
    lecturer_id = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False)
    academic_year_id = Column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(ApprovalStatusEnum), default=ApprovalStatusEnum.PENDING)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    subject = relationship("Subjects", back_populates="assignments")
    lecturer = relationship("Users", foreign_keys=[lecturer_id], back_populates="assignments_received")
    assigner = relationship("Users", foreign_keys=[assigned_by], back_populates="assignments_given")
    batch = relationship("Batches", back_populates="assignments")
    academic_year = relationship("AcademicYears", back_populates="assignments")

    def __repr__(self):
        return f"<Assignment(id={self.assignment_id}, lecturer_id={self.lecturer_id}, subject_id={self.subject_id}, batch_id={self.batch_id}, status='{self.status.name}')>"


class TimetableHourFormats(Base):
    __tablename__ = "timetablehourformats"

    format_id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False)
    format_data = Column(JSON, nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    batch = relationship("Batches", back_populates="formats")
    creator = relationship("Users", back_populates="created_formats")
    timetables = relationship("Timetable", back_populates="format")

    def __repr__(self):
        return f"<TimetableFormat(id={self.format_id}, batch_id={self.batch_id})>"


class Timetable(Base):
    __tablename__ = "timetable"
    __table_args__ = (
        UniqueConstraint('batch_id', 'day', 'time_slot', name='uq_batch_day_slot'),
    )

    timetable_id = Column(Integer, primary_key=True)
    format_id = Column(Integer, ForeignKey("timetablehourformats.format_id", ondelete="RESTRICT"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.batch_id", ondelete="RESTRICT"), nullable=False)
    day = Column(String(20), nullable=False)
    time_slot = Column(String(50), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id", ondelete="RESTRICT"), nullable=False)
    lecturer_id = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    format = relationship("TimetableHourFormats", back_populates="timetables")
    batch = relationship("Batches", back_populates="timetables")
    subject = relationship("Subjects", back_populates="timetables")
    creator = relationship("Users", back_populates="created_timetables", foreign_keys=[created_by])
    lecturer = relationship("Users", foreign_keys=[lecturer_id])

    def __repr__(self):
        return f"<Timetable(id={self.timetable_id}, batch_id={self.batch_id}, day='{self.day}', slot='{self.time_slot}', subject_id={self.subject_id},lecturer_id={self.lecturer_id})>"


class WorkflowStatus(Base):
    __tablename__ = "workflowstatus"
    __table_args__ = (
        UniqueConstraint('year_id', name='uq_year_workflow'),
    )

    workflow_id = Column(Integer, primary_key=True)
    year_id = Column(Integer, ForeignKey("academicyears.year_id", ondelete="RESTRICT"), nullable=False)
    workflow_step = Column(Enum(WorkflowStageEnum), nullable=False)
    created_at = Column(DateTime, default=func.now())

    year = relationship("AcademicYears")

    def __repr__(self):
        return f"<WorkflowStatus(id={self.workflow_id}, year_id={self.year_id}, step='{self.workflow_step.name}')>"

