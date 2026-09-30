from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)

from database import Base


def utc_now():
    """
    Demo app stores UTC as naive SQLite datetime.
    API responses convert these values to UTC ISO strings.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Exam(Base):
    __tablename__ = "exams"

    id = Column(
        String(80),
        primary_key=True,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    total_minutes = Column(
        Integer,
        nullable=False,
        default=10,
    )

    sectional_timing = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    sections_json = Column(
        JSON,
        nullable=False,
        default=list,
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=utc_now,
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(
        String(80),
        primary_key=True,
    )

    exam_id = Column(
        String(80),
        ForeignKey(
            "exams.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    section = Column(
        String(150),
        nullable=False,
        default="General",
    )

    subject = Column(
        String(150),
        nullable=False,
        default="General",
    )

    topic = Column(
        String(150),
        nullable=False,
        default="General",
    )

    difficulty = Column(
        String(40),
        nullable=False,
        default="easy",
    )

    order_no = Column(
        Integer,
        nullable=False,
        default=1,
    )

    text = Column(
        Text,
        nullable=False,
    )

    spoken = Column(
        Text,
        nullable=True,
    )

    options_json = Column(
        JSON,
        nullable=False,
    )

    # Never returned before submission.
    correct_answer = Column(
        String(50),
        nullable=False,
    )

    # Never returned before submission.
    explanation = Column(
        Text,
        nullable=False,
        default="",
    )

    alt_text = Column(
        Text,
        nullable=True,
    )

    marks = Column(
        Float,
        nullable=False,
        default=1.0,
    )

    negative = Column(
        Float,
        nullable=False,
        default=0.0,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=utc_now,
    )


class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(
        String(64),
        primary_key=True,
    )

    exam_id = Column(
        String(80),
        ForeignKey(
            "exams.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # Only the token hash is saved.
    access_token_hash = Column(
        String(64),
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="active",
    )

    # Accessibility extra time selected
    # when the session starts.
    extra_time_percent = Column(
        Integer,
        nullable=False,
        default=0,
    )

    # Final server-controlled duration,
    # including extra time.
    duration_seconds = Column(
        Integer,
        nullable=False,
    )

    # Question + option order is generated ONCE.
    #
    # Example:
    # [
    #   {
    #       "question_id": "ssc-q3",
    #       "option_order": ["C", "A", "D", "B"]
    #   }
    # ]
    paper_order_json = Column(
        JSON,
        nullable=False,
        default=list,
    )

    start_time = Column(
        DateTime,
        nullable=False,
    )

    end_time = Column(
        DateTime,
        nullable=False,
    )

    submitted_at = Column(
        DateTime,
        nullable=True,
    )

    score = Column(
        Float,
        nullable=True,
    )

    max_score = Column(
        Float,
        nullable=True,
    )

    attempted = Column(
        Integer,
        nullable=True,
    )

    correct = Column(
        Integer,
        nullable=True,
    )

    incorrect = Column(
        Integer,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=utc_now,
    )


class SessionAnswer(Base):
    __tablename__ = "session_answers"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    session_id = Column(
        String(64),
        ForeignKey(
            "exam_sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    question_id = Column(
        String(80),
        ForeignKey(
            "questions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    chosen_option = Column(
        String(50),
        nullable=True,
    )

    # First time this question received
    # an answer.
    first_saved_at = Column(
        DateTime,
        nullable=False,
        default=utc_now,
    )

    # Updated every time the user changes
    # this answer.
    saved_at = Column(
        DateTime,
        nullable=False,
        default=utc_now,
    )

    # Analytics only.
    seconds_spent = Column(
        Integer,
        nullable=True,
    )

    # Filled ONLY when the server scores
    # the submitted exam.
    is_correct = Column(
        Boolean,
        nullable=True,
    )

    awarded_marks = Column(
        Float,
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "question_id",
            name="uq_session_question",
        ),
    )


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    session_id = Column(
        String(64),
        nullable=True,
        index=True,
    )

    action = Column(
        String(100),
        nullable=False,
    )

    details_json = Column(
        JSON,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=utc_now,
    )