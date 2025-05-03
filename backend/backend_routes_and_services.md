
# 📘 Backend Routes and Service Classes

This file outlines the possible **FastAPI routes** and associated **service classes** with their methods for the Timetable Management System project.

---

## 📌 API Routes (Suggested)

### 🧑‍💻 Auth Routes
- `POST /auth/google-login`
- `GET /auth/me`
- `POST /auth/signup`

### 👤 User Routes
- `GET /users/{user_id}`
- `GET /users/lecturers`
- `PUT /users/profile`

### 🗓️ Academic Year & Batch Routes
- `POST /academic-years`
- `GET /academic-years`
- `POST /batches`
- `GET /batches/{year_id}`
- `GET /batches/{batch_id}`

### 📚 Subject Routes
- `POST /subjects`
- `GET /subjects`
- `GET /subjects/{subject_id}`
- `PUT /subjects/{subject_id}`
- `DELETE /subjects/{subject_id}`

### ✅ Priority Form Routes
- `POST /priority-forms`
- `GET /priority-forms/status/{year_id}`
- `POST /priority-selections`
- `GET /priority-selections/{year_id}`

### ⚙️ Assignment Routes
- `POST /assignments/auto`
- `GET /assignments/{year_id}`
- `PUT /assignments/{assignment_id}`
- `POST /assignments/approve`

### 🧭 Workflow Routes
- `GET /workflow/step`
- `POST /workflow/next`
- `POST /workflow/set`

### 📆 Timetable Routes
- `POST /timetable/formats`
- `GET /timetable/formats/{year_id}`
- `PUT /timetable/formats/{format_id}`
- `POST /timetable/generate`
- `GET /timetable/{year_id}`
- `PUT /timetable/slots/{slot_id}`
- `POST /timetable/finalize`

### 🔔 Notification Routes
- `POST /notifications/send`
- `GET /notifications/{user_id}`

### 📊 Dashboard Routes
- `GET /dashboard/stats`
- `GET /dashboard/lecturer-info`

---

## 🧠 Service Classes and Methods

### `AuthService`
- `login_with_google(token: str) -> User`
- `get_current_user(user_id: UUID) -> User`
- `complete_signup(user_data: SignupSchema) -> User`

### `UserService`
- `get_user_by_id(user_id: UUID) -> User`
- `get_all_lecturers() -> List[User]`
- `update_profile(user_id: UUID, data: UserUpdateSchema) -> User`

### `AcademicYearService`
- `create_academic_year(data: YearCreateSchema) -> AcademicYear`
- `list_academic_years() -> List[AcademicYear]`

### `BatchService`
- `create_batch(data: BatchCreateSchema) -> Batch`
- `list_batches(year_id: UUID) -> List[Batch]`
- `get_batch_by_id(batch_id: UUID) -> Batch`

### `SubjectService`
- `create_subject(data: SubjectCreateSchema) -> Subject`
- `list_subjects() -> List[Subject]`
- `get_subject(subject_id: UUID) -> Subject`
- `update_subject(subject_id: UUID, data: SubjectUpdateSchema) -> Subject`
- `delete_subject(subject_id: UUID) -> None`

### `PriorityFormService`
- `create_priority_form(year_id: UUID) -> PriorityForm`
- `is_form_active(year_id: UUID) -> bool`

### `LecturerPriorityService`
- `submit_priority(user_id: UUID, data: PrioritySchema) -> None`
- `get_all_priorities(year_id: UUID) -> List[PrioritySelection]`

### `AssignmentService`
- `auto_assign_subjects(year_id: UUID) -> List[Assignment]`
- `list_assignments(year_id: UUID) -> List[Assignment]`
- `update_assignment(assignment_id: UUID, data: AssignmentUpdateSchema) -> Assignment`
- `approve_assignments(year_id: UUID) -> None`

### `WorkflowService`
- `get_current_step() -> int`
- `move_to_next_step() -> int`
- `force_set_step(step: int) -> int`

### `TimetableService`
- `create_format(data: TimetableFormatSchema) -> TimetableFormat`
- `get_format(year_id: UUID) -> TimetableFormat`
- `update_format(format_id: UUID, data: TimetableFormatUpdateSchema) -> TimetableFormat`
- `generate_timetable(year_id: UUID) -> List[TimetableSlot]`
- `get_timetable(year_id: UUID) -> List[TimetableSlot]`
- `update_slot(slot_id: UUID, data: TimetableSlotUpdateSchema) -> TimetableSlot`
- `finalize_timetable(year_id: UUID) -> None`

### `NotificationService`
- `send_notification(user_id: UUID, message: str) -> None`
- `get_notifications(user_id: UUID) -> List[Notification]`

### `DashboardService`
- `get_overview_stats(user_id: UUID) -> DashboardStats`
- `get_lecturer_info(user_id: UUID) -> LecturerDashboardData`

### `LogService`
- `list_logs(year_id: UUID = None) -> List[LogEntry]`
- `create_log(action: str, user_id: UUID, data: dict) -> None`




## 🗃️ Repository Classes and Methods

### `UserRepository`
- `get_by_id(user_id: UUID) -> User`
- `get_all_lecturers() -> List[User]`
- `update(user_id: UUID, data: dict) -> User`
- `create(user_data: dict) -> User`

### `AcademicYearRepository`
- `create(data: dict) -> AcademicYear`
- `list_all() -> List[AcademicYear]`

### `BatchRepository`
- `create(data: dict) -> Batch`
- `get_by_year(year_id: UUID) -> List[Batch]`
- `get_by_id(batch_id: UUID) -> Batch`

### `SubjectRepository`
- `create(data: dict) -> Subject`
- `list_all() -> List[Subject]`
- `get_by_id(subject_id: UUID) -> Subject`
- `update(subject_id: UUID, data: dict) -> Subject`
- `delete(subject_id: UUID) -> None`

### `PriorityFormRepository`
- `create(year_id: UUID) -> PriorityForm`
- `is_active(year_id: UUID) -> bool`

### `PrioritySelectionRepository`
- `create(user_id: UUID, data: dict) -> PrioritySelection`
- `get_by_year(year_id: UUID) -> List[PrioritySelection]`

### `AssignmentRepository`
- `create_bulk(assignments: List[dict]) -> List[Assignment]`
- `get_by_year(year_id: UUID) -> List[Assignment]`
- `update(assignment_id: UUID, data: dict) -> Assignment`
- `bulk_update_status(year_id: UUID, status: str) -> None`

### `WorkflowRepository`
- `get_current_step() -> int`
- `update_step(step: int) -> int`

### `TimetableRepository`
- `create_format(data: dict) -> TimetableFormat`
- `get_format_by_year(year_id: UUID) -> TimetableFormat`
- `update_format(format_id: UUID, data: dict) -> TimetableFormat`
- `create_slots(slots: List[dict]) -> List[TimetableSlot]`
- `get_slots_by_year(year_id: UUID) -> List[TimetableSlot]`
- `update_slot(slot_id: UUID, data: dict) -> TimetableSlot`

### `NotificationRepository`
- `create(user_id: UUID, message: str) -> Notification`
- `get_by_user(user_id: UUID) -> List[Notification]`

### `LogRepository`
- `create_log(entry: dict) -> None`
- `get_logs(year_id: UUID = None) -> List[LogEntry]`
"""