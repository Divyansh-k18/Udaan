import hashlib
import hmac
import secrets
import uuid

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    Request,
    status,
)

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

from sqlalchemy.orm import Session

from database import get_db

from models import (
    AuditLog,
    Exam,
    ExamSession,
    Question,
    SessionAnswer,
)


router = APIRouter(
    prefix="/sessions",
    tags=["Mock Sessions"],
)


# =================================================
# TIME
# =================================================


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def iso_utc(value):
    if value is None:
        return None

    return (
        value.replace(
            tzinfo=timezone.utc
        )
        .isoformat()
        .replace(
            "+00:00",
            "Z",
        )
    )


# =================================================
# TOKEN
# =================================================


def hash_token(token: str):
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def create_access_token():
    return secrets.token_urlsafe(32)


def token_is_valid(
    raw_token: str,
    stored_hash: str,
):
    candidate = hash_token(
        raw_token
    )

    return hmac.compare_digest(
        candidate,
        stored_hash,
    )


# =================================================
# AUDIT
# =================================================


def add_audit(
    db: Session,
    action: str,
    session_id=None,
    details=None,
):
    db.add(
        AuditLog(
            session_id=session_id,
            action=action,
            details_json=details or {},
        )
    )


# =================================================
# PYDANTIC REQUESTS
# =================================================


class StartSessionRequest(BaseModel):
    exam_id: str

    # Demo accessibility extra-time setting.
    # 0 means normal time.
    # 25 means 25% additional time.
    extra_time_percent: int = Field(
        default=0,
        ge=0,
        le=100,
    )


class AnswerItem(BaseModel):
    question_id: str

    # null / blank means clear answer
    chosen: Optional[str] = None

    # Client-reported analytics value only.
    # It NEVER controls the exam deadline.
    seconds: Optional[int] = Field(
        default=None,
        ge=0,
        le=86400,
    )


class SaveAnswersRequest(BaseModel):
    answers: List[AnswerItem] = Field(max_length=500)

    @field_validator("answers")
    @classmethod
    def unique_questions(cls, answers):
        ids = [item.question_id for item in answers]
        if len(ids) != len(set(ids)):
            raise ValueError("Each question may appear only once in an answer batch.")
        return answers


# =================================================
# COMMON HELPERS
# =================================================


def get_session_or_404(
    db: Session,
    session_id: str,
):
    exam_session = (
        db.query(ExamSession)
        .filter(
            ExamSession.id
            == session_id
        )
        .first()
    )

    if not exam_session:
        raise HTTPException(
            status_code=404,
            detail="Exam session not found.",
        )

    return exam_session


def verify_access(
    exam_session: ExamSession,
    token: Optional[str],
):
    if not token:
        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,
            detail=
                "Missing X-Session-Token header.",
        )

    if not token_is_valid(
        token,
        exam_session.access_token_hash,
    ):
        raise HTTPException(
            status_code=
                status.HTTP_403_FORBIDDEN,
            detail=
                "Invalid session token.",
        )


def mark_expired_if_needed(
    db: Session,
    exam_session: ExamSession,
):
    if (
        exam_session.status == "active"
        and
        utc_now() >= exam_session.end_time
    ):
        exam_session.status = "expired"

        add_audit(
            db,
            "session_expired",
            exam_session.id,
            {
                "end_time":
                    iso_utc(
                        exam_session.end_time
                    ),
            },
        )

        db.commit()

        db.refresh(
            exam_session
        )

    return (
        exam_session.status
        == "expired"
    )


def ensure_answers_allowed(
    db: Session,
    exam_session: ExamSession,
):
    if (
        exam_session.status
        == "submitted"
    ):
        add_audit(
            db,
            "answer_rejected_submitted",
            exam_session.id,
        )

        db.commit()

        raise HTTPException(
            status_code=409,
            detail=
                "This exam has already been submitted. Answers are locked.",
        )

    if (
        utc_now()
        >= exam_session.end_time
    ):
        exam_session.status = "expired"

        add_audit(
            db,
            "answer_rejected_late",
            exam_session.id,
            {
                "end_time":
                    iso_utc(
                        exam_session.end_time
                    ),
            },
        )

        db.commit()

        raise HTTPException(
            status_code=409,
            detail=
                "Exam time has ended. Late answers are not accepted.",
        )


# =================================================
# OPTIONS
# =================================================


def normalise_options(
    question: Question,
):
    options = (
        question.options_json
        or []
    )

    letters = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
    ]

    result = []

    for index, option in enumerate(
        options
    ):
        fallback_id = (
            letters[index]
            if index < len(letters)
            else str(index + 1)
        )

        if isinstance(
            option,
            dict,
        ):
            option_id = str(
                option.get("id")
                or
                option.get("value")
                or
                fallback_id
            )

            text = str(
                option.get("text")
                or
                option.get("label")
                or
                option.get("value")
                or
                ""
            )

            spoken = str(
                option.get("spoken")
                or
                text
            )

            lang = (
                option.get("lang")
                or
                option.get("langCode")
            )

        else:
            option_id = fallback_id
            text = str(option)
            spoken = text
            lang = None

        result.append(
            {
                "id":
                    option_id,

                "text":
                    text,

                "spoken":
                    spoken,

                "lang":
                    lang,
            }
        )

    return result


def get_valid_option_ids(
    question: Question,
):
    return [
        option["id"]
        for option
        in normalise_options(
            question
        )
    ]


# =================================================
# ONE-TIME PAPER SHUFFLE
# =================================================


def create_paper_order(
    questions,
):
    """
    Shuffle question order and each
    question's options ONCE.

    The resulting order is stored in
    exam_sessions.paper_order_json.
    """

    randomizer = (
        secrets.SystemRandom()
    )

    shuffled_questions = [
        question
        for question
        in questions
    ]

    randomizer.shuffle(
        shuffled_questions
    )

    paper_order = []

    for question in shuffled_questions:
        option_ids = [
            option["id"]
            for option
            in normalise_options(
                question
            )
        ]

        randomizer.shuffle(
            option_ids
        )

        paper_order.append(
            {
                "question_id":
                    question.id,

                "option_order":
                    option_ids,
            }
        )

    return paper_order


def order_options(
    question: Question,
    option_order,
):
    options = normalise_options(
        question
    )

    option_map = {
        option["id"]: option
        for option in options
    }

    ordered = []

    for option_id in (
        option_order or []
    ):
        option = option_map.get(
            option_id
        )

        if option:
            ordered.append(
                option
            )

    # Safety fallback in case data changed
    # after session creation.
    known_ids = {
        option["id"]
        for option in ordered
    }

    for option in options:
        if (
            option["id"]
            not in known_ids
        ):
            ordered.append(
                option
            )

    return ordered


def ordered_questions(
    db: Session,
    exam_session: ExamSession,
):
    questions = (
        db.query(Question)
        .filter(
            Question.exam_id
            == exam_session.exam_id
        )
        .all()
    )

    question_map = {
        question.id: question
        for question in questions
    }

    result = []

    for paper_item in (
        exam_session.paper_order_json
        or []
    ):
        question = question_map.get(
            paper_item.get(
                "question_id"
            )
        )

        if question:
            result.append(
                (
                    question,
                    paper_item.get(
                        "option_order",
                        [],
                    ),
                )
            )

    return result


# =================================================
# POST /sessions
# =================================================


@router.post("")
def create_session(
    payload: StartSessionRequest,
    request: Request,
    db: Session = Depends(
        get_db
    ),
):
    exam = (
        db.query(Exam)
        .filter(
            Exam.id
            == payload.exam_id
        )
        .first()
    )

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    if not exam.active:
        raise HTTPException(
            status_code=409,
            detail=
                "This exam is not currently available.",
        )

    questions = (
        db.query(Question)
        .filter(
            Question.exam_id
            == exam.id
        )
        .order_by(
            Question.order_no.asc()
        )
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=409,
            detail=
                "This exam has no questions.",
        )

    # -------------------------
    # SERVER-CONTROLLED TIME
    # -------------------------

    base_seconds = (
        exam.total_minutes
        * 60
    )

    extra_seconds = round(
        base_seconds
        *
        (
            payload.extra_time_percent
            / 100
        )
    )

    duration_seconds = (
        base_seconds
        + extra_seconds
    )

    start_time = utc_now()

    end_time = (
        start_time
        +
        timedelta(
            seconds=
                duration_seconds
        )
    )

    # -------------------------
    # ONE-TIME SHUFFLE
    # -------------------------

    paper_order = (
        create_paper_order(
            questions
        )
    )

    session_id = str(
        uuid.uuid4()
    )

    access_token = (
        create_access_token()
    )

    exam_session = ExamSession(
        id=session_id,

        exam_id=exam.id,

        access_token_hash=
            hash_token(
                access_token
            ),

        status="active",

        extra_time_percent=
            payload.extra_time_percent,

        duration_seconds=
            duration_seconds,

        paper_order_json=
            paper_order,

        start_time=
            start_time,

        end_time=
            end_time,
    )

    db.add(
        exam_session
    )

    add_audit(
        db,
        "session_created",
        session_id,
        {
            "exam_id":
                exam.id,

            "question_count":
                len(questions),

            "extra_time_percent":
                payload.extra_time_percent,

            "duration_seconds":
                duration_seconds,

            "client_ip":
                request.client.host
                if request.client
                else None,
        },
    )

    db.commit()

    return {
        "id":
            session_id,

        "exam_id":
            exam.id,

        "exam_name":
            exam.name,

        # Raw token returned only here.
        "access_token":
            access_token,

        "status":
            "active",

        "start_time":
            iso_utc(
                start_time
            ),

        "end_time":
            iso_utc(
                end_time
            ),

        "base_minutes":
            exam.total_minutes,

        "extra_time_percent":
            payload.extra_time_percent,

        "duration_seconds":
            duration_seconds,

        "question_count":
            len(questions),
    }


# =================================================
# GET /sessions/{id}/paper
# =================================================


@router.get(
    "/{session_id}/paper"
)
def get_paper(
    session_id: str,

    x_session_token:
        Optional[str] =
        Header(
            default=None,
            alias=
                "X-Session-Token",
        ),

    db: Session = Depends(
        get_db
    ),
):
    exam_session = (
        get_session_or_404(
            db,
            session_id,
        )
    )

    verify_access(
        exam_session,
        x_session_token,
    )

    mark_expired_if_needed(
        db,
        exam_session,
    )

    exam = (
        db.query(Exam)
        .filter(
            Exam.id
            == exam_session.exam_id
        )
        .first()
    )

    ordered = (
        ordered_questions(
            db,
            exam_session,
        )
    )

    public_questions = []

    for (
        position,
        (
            question,
            option_order,
        ),
    ) in enumerate(
        ordered,
        start=1,
    ):
        public_questions.append(
            {
                "number":
                    position,

                "id":
                    question.id,

                "section":
                    question.section,

                "subject":
                    question.subject,

                "topic":
                    question.topic,

                "difficulty":
                    question.difficulty,

                "text":
                    question.text,

                "spoken":
                    question.spoken,

                "options":
                    order_options(
                        question,
                        option_order,
                    ),

                "altText":
                    question.alt_text,

                "marks":
                    question.marks,

                "negative":
                    question.negative,

                # IMPORTANT:
                #
                # correct_answer is
                # intentionally omitted.
                #
                # explanation is also
                # intentionally omitted.
            }
        )

    saved_answers = (
        db.query(SessionAnswer)
        .filter(
            SessionAnswer.session_id
            == exam_session.id
        )
        .all()
    )

    # Safe resume information only.
    resume_answers = [
        {
            "question_id":
                answer.question_id,

            "chosen":
                answer.chosen_option,

            "seconds":
                answer.seconds_spent,

            "saved_at":
                iso_utc(
                    answer.saved_at
                ),
        }
        for answer
        in saved_answers
    ]

    add_audit(
        db,
        "paper_viewed",
        exam_session.id,
    )

    db.commit()

    return {
        "session_id":
            exam_session.id,

        "status":
            exam_session.status,

        "exam": {
            "id":
                exam.id,

            "name":
                exam.name,

            "base_minutes":
                exam.total_minutes,

            "sectional_timing":
                exam.sectional_timing,

            "sections":
                exam.sections_json,
        },

        "extra_time_percent":
            exam_session.extra_time_percent,

        "duration_seconds":
            exam_session.duration_seconds,

        "start_time":
            iso_utc(
                exam_session.start_time
            ),

        "end_time":
            iso_utc(
                exam_session.end_time
            ),

        "questions":
            public_questions,

        "saved_answers":
            resume_answers,
    }


# =================================================
# PUT /sessions/{id}/answers
# =================================================


@router.put(
    "/{session_id}/answers"
)
def save_answers(
    session_id: str,
    payload: SaveAnswersRequest,

    x_session_token:
        Optional[str] =
        Header(
            default=None,
            alias=
                "X-Session-Token",
        ),

    db: Session = Depends(
        get_db
    ),
):
    exam_session = (
        get_session_or_404(
            db,
            session_id,
        )
    )

    verify_access(
        exam_session,
        x_session_token,
    )

    # Reject submitted and late answers.
    ensure_answers_allowed(
        db,
        exam_session,
    )

    if not payload.answers:
        raise HTTPException(
            status_code=422,
            detail=
                "At least one answer is required.",
        )

    if (
        len(payload.answers)
        > 100
    ):
        raise HTTPException(
            status_code=422,
            detail=
                "Too many answers in one request.",
        )

    response_items = []

    saved_count = 0
    cleared_count = 0

    for item in payload.answers:
        # Check time again while processing.
        # This helps prevent a batch received
        # right on the deadline from continuing.
        ensure_answers_allowed(
            db,
            exam_session,
        )

        question = (
            db.query(Question)
            .filter(
                Question.id
                == item.question_id,

                Question.exam_id
                == exam_session.exam_id,
            )
            .first()
        )

        if not question:
            raise HTTPException(
                status_code=422,
                detail=
                    f"Question {item.question_id} does not belong to this exam.",
            )

        existing = (
            db.query(
                SessionAnswer
            )
            .filter(
                SessionAnswer.session_id
                == exam_session.id,

                SessionAnswer.question_id
                == question.id,
            )
            .first()
        )

        chosen = (
            item.chosen.strip()
            if item.chosen
            else ""
        )

        now = utc_now()

        # -------------------------
        # CLEAR ANSWER
        # -------------------------

        if not chosen:
            if existing:
                db.delete(
                    existing
                )

            cleared_count += 1

            response_items.append(
                {
                    "question_id":
                        question.id,

                    "status":
                        "cleared",

                    "saved_at":
                        iso_utc(
                            now
                        ),
                }
            )

            continue

        # -------------------------
        # VALIDATE OPTION
        # -------------------------

        valid_options = (
            get_valid_option_ids(
                question
            )
        )

        if (
            chosen
            not in valid_options
        ):
            raise HTTPException(
                status_code=422,
                detail=
                    f"Invalid option for question {question.id}.",
            )

        # Client time is analytics only.
        seconds = (
            item.seconds
        )

        if existing:
            existing.chosen_option = (
                chosen
            )

            existing.seconds_spent = (
                seconds
            )

            existing.saved_at = (
                now
            )

            # Result information must remain
            # empty until submission.
            existing.is_correct = None

            existing.awarded_marks = None

            first_saved_at = (
                existing.first_saved_at
            )

        else:
            answer = SessionAnswer(
                session_id=
                    exam_session.id,

                question_id=
                    question.id,

                chosen_option=
                    chosen,

                seconds_spent=
                    seconds,

                first_saved_at=
                    now,

                saved_at=
                    now,
            )

            db.add(
                answer
            )

            first_saved_at = (
                now
            )

        saved_count += 1

        response_items.append(
            {
                "question_id":
                    question.id,

                "status":
                    "saved",

                # Server-generated timestamps.
                "first_saved_at":
                    iso_utc(
                        first_saved_at
                    ),

                "saved_at":
                    iso_utc(
                        now
                    ),

                # Do NOT return whether
                # the answer is correct.
            }
        )

    add_audit(
        db,
        "answers_saved",
        exam_session.id,
        {
            "saved":
                saved_count,

            "cleared":
                cleared_count,
        },
    )

    db.commit()

    return {
        "ok":
            True,

        "saved":
            saved_count,

        "cleared":
            cleared_count,

        "server_time":
            iso_utc(
                utc_now()
            ),

        "answers":
            response_items,
    }


# =================================================
# BUILD SUBMISSION RESPONSE
# =================================================


def build_submission_response(
    exam_session,
    ordered,
    answer_map,
):
    question_results = []

    for (
        question,
        option_order,
    ) in ordered:
        answer = (
            answer_map.get(
                question.id
            )
        )

        chosen = (
            answer.chosen_option
            if answer
            else ""
        )

        question_results.append(
            {
                "id":
                    question.id,

                "section":
                    question.section,

                "subject":
                    question.subject,

                "topic":
                    question.topic,

                "chosen":
                    chosen,

                "attempted":
                    bool(chosen),

                "correct":
                    bool(
                        answer
                        and
                        answer.is_correct
                    ),

                "seconds":
                    answer.seconds_spent
                    if answer
                    else None,

                "saved_at":
                    iso_utc(
                        answer.saved_at
                    )
                    if answer
                    else None,

                "score":
                    (
                        answer.awarded_marks
                        if (
                            answer
                            and
                            answer.awarded_marks
                            is not None
                        )
                        else 0
                    ),

                # These fields are returned
                # ONLY after submission.
                "correct_answer":
                    question.correct_answer,

                "explanation":
                    question.explanation,
            }
        )

    elapsed_end = (
        exam_session.submitted_at
        or
        exam_session.end_time
    )

    effective_end = min(
        elapsed_end,
        exam_session.end_time,
    )

    total_seconds = max(
        0,
        int(
            (
                effective_end
                -
                exam_session.start_time
            ).total_seconds()
        ),
    )

    return {
        "session_id":
            exam_session.id,

        "exam_id":
            exam_session.exam_id,

        "status":
            "submitted",

        "submitted_at":
            iso_utc(
                exam_session.submitted_at
            ),

        "start_time":
            iso_utc(
                exam_session.start_time
            ),

        "end_time":
            iso_utc(
                exam_session.end_time
            ),

        "extra_time_percent":
            exam_session.extra_time_percent,

        "duration_seconds":
            exam_session.duration_seconds,

        "total_seconds":
            total_seconds,

        "score":
            exam_session.score,

        "max_score":
            exam_session.max_score,

        "attempted":
            exam_session.attempted,

        "correct":
            exam_session.correct,

        "incorrect":
            exam_session.incorrect,

        "total_questions":
            len(ordered),

        "questions":
            question_results,
    }


# =================================================
# POST /sessions/{id}/submit
# =================================================


@router.post(
    "/{session_id}/submit"
)
def submit_session(
    session_id: str,

    x_session_token:
        Optional[str] =
        Header(
            default=None,
            alias=
                "X-Session-Token",
        ),

    db: Session = Depends(
        get_db
    ),
):
    exam_session = (
        get_session_or_404(
            db,
            session_id,
        )
    )

    verify_access(
        exam_session,
        x_session_token,
    )

    ordered = (
        ordered_questions(
            db,
            exam_session,
        )
    )

    answers = (
        db.query(SessionAnswer)
        .filter(
            SessionAnswer.session_id
            == exam_session.id
        )
        .all()
    )

    answer_map = {
        answer.question_id:
            answer
        for answer
        in answers
    }

    # -------------------------
    # ALREADY SUBMITTED
    # -------------------------

    if (
        exam_session.status
        == "submitted"
    ):
        response = (
            build_submission_response(
                exam_session,
                ordered,
                answer_map,
            )
        )

        response[
            "already_submitted"
        ] = True

        return response

    # A submission after time expires is
    # allowed so saved answers can still be
    # scored.
    #
    # New/changed answers are NOT allowed
    # after end_time.

    now = utc_now()

    submitted_after_end = (
        now
        > exam_session.end_time
    )

    attempted = 0
    correct_count = 0
    incorrect_count = 0

    total_score = 0.0
    max_score = 0.0

    for (
        question,
        option_order,
    ) in ordered:
        max_score += float(
            question.marks
        )

        answer = (
            answer_map.get(
                question.id
            )
        )

        if (
            not answer
            or
            not answer.chosen_option
        ):
            continue

        attempted += 1

        is_correct = (
            answer.chosen_option
            ==
            question.correct_answer
        )

        if is_correct:
            correct_count += 1

            awarded = float(
                question.marks
            )

        else:
            incorrect_count += 1

            awarded = -abs(
                float(
                    question.negative
                )
            )

        # SERVER performs scoring.
        answer.is_correct = (
            is_correct
        )

        answer.awarded_marks = (
            round(
                awarded,
                2,
            )
        )

        total_score += awarded

    exam_session.status = (
        "submitted"
    )

    exam_session.submitted_at = (
        now
    )

    exam_session.score = round(
        total_score,
        2,
    )

    exam_session.max_score = round(
        max_score,
        2,
    )

    exam_session.attempted = (
        attempted
    )

    exam_session.correct = (
        correct_count
    )

    exam_session.incorrect = (
        incorrect_count
    )

    add_audit(
        db,
        "session_submitted",
        exam_session.id,
        {
            "submitted_after_end":
                submitted_after_end,

            "attempted":
                attempted,

            "correct":
                correct_count,

            "incorrect":
                incorrect_count,

            "score":
                round(
                    total_score,
                    2,
                ),
        },
    )

    db.commit()

    db.refresh(
        exam_session
    )

    answers = (
        db.query(SessionAnswer)
        .filter(
            SessionAnswer.session_id
            == exam_session.id
        )
        .all()
    )

    answer_map = {
        answer.question_id:
            answer
        for answer
        in answers
    }

    response = (
        build_submission_response(
            exam_session,
            ordered,
            answer_map,
        )
    )

    response[
        "already_submitted"
    ] = False

    return response


# =================================================
# GET /sessions/{id}/time
# =================================================


@router.get(
    "/{session_id}/time"
)
def get_session_time(
    session_id: str,

    x_session_token:
        Optional[str] =
        Header(
            default=None,
            alias=
                "X-Session-Token",
        ),

    db: Session = Depends(
        get_db
    ),
):
    exam_session = (
        get_session_or_404(
            db,
            session_id,
        )
    )

    verify_access(
        exam_session,
        x_session_token,
    )

    mark_expired_if_needed(
        db,
        exam_session,
    )

    now = utc_now()

    if (
        exam_session.status
        == "submitted"
    ):
        remaining_seconds = 0

    else:
        remaining_seconds = max(
            0,
            int(
                (
                    exam_session.end_time
                    -
                    now
                ).total_seconds()
            ),
        )

    return {
        "session_id":
            exam_session.id,

        "status":
            exam_session.status,

        "server_time":
            iso_utc(
                now
            ),

        "start_time":
            iso_utc(
                exam_session.start_time
            ),

        "end_time":
            iso_utc(
                exam_session.end_time
            ),

        "duration_seconds":
            exam_session.duration_seconds,

        "extra_time_percent":
            exam_session.extra_time_percent,

        "remaining_seconds":
            remaining_seconds,

        "expired":
            (
                exam_session.status
                == "expired"
            ),

        "submitted":
            (
                exam_session.status
                == "submitted"
            ),
    }


# =================================================
# DEMO SEED DATA
# =================================================


def seed_demo_data(
    db: Session,
):
    """
    Demo-only style-based exams.

    VERIFY WITH OFFICIAL NOTIFICATION
    before using real examination rules.

    These are not official papers.
    """

    demo_exams = [
        {
            "id":
                "ssc-cgl-mini",

            "name":
                "SSC-style Mini Mock",

            "total_minutes":
                10,

            "sections": [
                {
                    "name":
                        "Quantitative Aptitude",
                    "subject":
                        "Quantitative Aptitude",
                },
                {
                    "name":
                        "English",
                    "subject":
                        "English",
                },
            ],
        },

        {
            "id":
                "bank-po-mini",

            "name":
                "Bank PO-style Mini Mock",

            "total_minutes":
                10,

            "sections": [
                {
                    "name":
                        "Quantitative Aptitude",
                    "subject":
                        "Quantitative Aptitude",
                },
                {
                    "name":
                        "Reasoning",
                    "subject":
                        "Reasoning",
                },
            ],
        },

        {
            "id":
                "rrb-ntpc-mini",

            "name":
                "RRB NTPC-style Mini Mock",

            "total_minutes":
                10,

            "sections": [
                {
                    "name":
                        "Mathematics",
                    "subject":
                        "Mathematics",
                },
                {
                    "name":
                        "General Intelligence",
                    "subject":
                        "Reasoning",
                },
            ],
        },
    ]

    for data in demo_exams:
        exam = (
            db.query(Exam)
            .filter(
                Exam.id
                == data["id"]
            )
            .first()
        )

        if not exam:
            db.add(
                Exam(
                    id=
                        data["id"],

                    name=
                        data["name"],

                    total_minutes=
                        data[
                            "total_minutes"
                        ],

                    sectional_timing=
                        False,

                    sections_json=
                        data[
                            "sections"
                        ],

                    active=
                        True,
                )
            )

    db.flush()

    demo_questions = [
        {
            "id": "ssc-q1",
            "exam": "ssc-cgl-mini",
            "section": "Quantitative Aptitude",
            "subject": "Quantitative Aptitude",
            "topic": "Percentage",
            "text": "What is 25 percent of 200?",
            "options": [
                {"id": "A", "text": "25"},
                {"id": "B", "text": "50"},
                {"id": "C", "text": "75"},
                {"id": "D", "text": "100"},
            ],
            "answer": "B",
            "explanation":
                "25 percent of 200 is 50.",
            "marks": 2,
            "negative": 0.5,
            "order": 1,
        },

        {
            "id": "ssc-q2",
            "exam": "ssc-cgl-mini",
            "section": "Quantitative Aptitude",
            "subject": "Quantitative Aptitude",
            "topic": "Ratio",
            "text":
                "Simplify the ratio 10 to 20.",
            "options": [
                {"id": "A", "text": "1 to 2"},
                {"id": "B", "text": "2 to 1"},
                {"id": "C", "text": "1 to 3"},
                {"id": "D", "text": "3 to 2"},
            ],
            "answer": "A",
            "explanation":
                "Divide both terms by 10 to obtain 1 to 2.",
            "marks": 2,
            "negative": 0.5,
            "order": 2,
        },

        {
            "id": "ssc-q3",
            "exam": "ssc-cgl-mini",
            "section": "English",
            "subject": "English",
            "topic": "Vocabulary",
            "text":
                "Choose the word closest in meaning to rapid.",
            "options": [
                {"id": "A", "text": "Slow"},
                {"id": "B", "text": "Quick"},
                {"id": "C", "text": "Weak"},
                {"id": "D", "text": "Quiet"},
            ],
            "answer": "B",
            "explanation":
                "Rapid means quick or fast.",
            "marks": 2,
            "negative": 0.5,
            "order": 3,
        },

        {
            "id": "ssc-q4",
            "exam": "ssc-cgl-mini",
            "section": "English",
            "subject": "English",
            "topic": "Grammar",
            "text":
                "Choose the grammatically correct sentence.",
            "options": [
                {
                    "id": "A",
                    "text": "She go to school."
                },
                {
                    "id": "B",
                    "text": "She goes to school."
                },
                {
                    "id": "C",
                    "text": "She going to school."
                },
                {
                    "id": "D",
                    "text": "She gone to school."
                },
            ],
            "answer": "B",
            "explanation":
                "With she in the simple present tense, the correct verb is goes.",
            "marks": 2,
            "negative": 0.5,
            "order": 4,
        },

        {
            "id": "bank-q1",
            "exam": "bank-po-mini",
            "section": "Quantitative Aptitude",
            "subject": "Quantitative Aptitude",
            "topic": "Average",
            "text":
                "What is the average of 10, 20 and 30?",
            "options": [
                {"id": "A", "text": "10"},
                {"id": "B", "text": "20"},
                {"id": "C", "text": "25"},
                {"id": "D", "text": "30"},
            ],
            "answer": "B",
            "explanation":
                "The sum is 60. Divide by 3 to get 20.",
            "marks": 1,
            "negative": 0.25,
            "order": 1,
        },

        {
            "id": "bank-q2",
            "exam": "bank-po-mini",
            "section": "Quantitative Aptitude",
            "subject": "Quantitative Aptitude",
            "topic": "Simple Interest",
            "text":
                "What is 10 percent simple interest on 1000 rupees for one year?",
            "options": [
                {"id": "A", "text": "50 rupees"},
                {"id": "B", "text": "100 rupees"},
                {"id": "C", "text": "150 rupees"},
                {"id": "D", "text": "200 rupees"},
            ],
            "answer": "B",
            "explanation":
                "Ten percent of 1000 is 100.",
            "marks": 1,
            "negative": 0.25,
            "order": 2,
        },

        {
            "id": "bank-q3",
            "exam": "bank-po-mini",
            "section": "Reasoning",
            "subject": "Reasoning",
            "topic": "Number Series",
            "text":
                "Find the next number: 2, 4, 6, 8.",
            "options": [
                {"id": "A", "text": "9"},
                {"id": "B", "text": "10"},
                {"id": "C", "text": "11"},
                {"id": "D", "text": "12"},
            ],
            "answer": "B",
            "explanation":
                "The sequence increases by 2 each time.",
            "marks": 1,
            "negative": 0.25,
            "order": 3,
        },

        {
            "id": "bank-q4",
            "exam": "bank-po-mini",
            "section": "Reasoning",
            "subject": "Reasoning",
            "topic": "Odd One Out",
            "text":
                "Which is the odd one out?",
            "options": [
                {"id": "A", "text": "Apple"},
                {"id": "B", "text": "Banana"},
                {"id": "C", "text": "Mango"},
                {"id": "D", "text": "Carrot"},
            ],
            "answer": "D",
            "explanation":
                "Apple, banana and mango are fruits. Carrot is a vegetable.",
            "marks": 1,
            "negative": 0.25,
            "order": 4,
        },

        {
            "id": "rrb-q1",
            "exam": "rrb-ntpc-mini",
            "section": "Mathematics",
            "subject": "Mathematics",
            "topic": "Addition",
            "text":
                "What is 125 plus 75?",
            "options": [
                {"id": "A", "text": "150"},
                {"id": "B", "text": "175"},
                {"id": "C", "text": "200"},
                {"id": "D", "text": "225"},
            ],
            "answer": "C",
            "explanation":
                "125 plus 75 equals 200.",
            "marks": 1,
            "negative": 0.33,
            "order": 1,
        },

        {
            "id": "rrb-q2",
            "exam": "rrb-ntpc-mini",
            "section": "Mathematics",
            "subject": "Mathematics",
            "topic": "Multiplication",
            "text":
                "What is 12 multiplied by 5?",
            "options": [
                {"id": "A", "text": "50"},
                {"id": "B", "text": "60"},
                {"id": "C", "text": "70"},
                {"id": "D", "text": "80"},
            ],
            "answer": "B",
            "explanation":
                "12 multiplied by 5 equals 60.",
            "marks": 1,
            "negative": 0.33,
            "order": 2,
        },

        {
            "id": "rrb-q3",
            "exam": "rrb-ntpc-mini",
            "section": "General Intelligence",
            "subject": "Reasoning",
            "topic": "Analogy",
            "text":
                "Bird is to fly as fish is to what?",
            "options": [
                {"id": "A", "text": "Run"},
                {"id": "B", "text": "Swim"},
                {"id": "C", "text": "Jump"},
                {"id": "D", "text": "Climb"},
            ],
            "answer": "B",
            "explanation":
                "A bird flies and a fish swims.",
            "marks": 1,
            "negative": 0.33,
            "order": 3,
        },

        {
            "id": "rrb-q4",
            "exam": "rrb-ntpc-mini",
            "section": "General Intelligence",
            "subject": "Reasoning",
            "topic": "Classification",
            "text":
                "Which item is different from the others?",
            "options": [
                {"id": "A", "text": "Circle"},
                {"id": "B", "text": "Square"},
                {"id": "C", "text": "Triangle"},
                {"id": "D", "text": "Blue"},
            ],
            "answer": "D",
            "explanation":
                "Circle, square and triangle are shapes. Blue is a colour.",
            "marks": 1,
            "negative": 0.33,
            "order": 4,
        },
    ]

    for item in demo_questions:
        existing = (
            db.query(Question)
            .filter(
                Question.id
                == item["id"]
            )
            .first()
        )

        if existing:
            continue

        db.add(
            Question(
                id=
                    item["id"],

                exam_id=
                    item["exam"],

                section=
                    item["section"],

                subject=
                    item["subject"],

                topic=
                    item["topic"],

                difficulty=
                    "easy",

                order_no=
                    item["order"],

                text=
                    item["text"],

                spoken=
                    item["text"],

                options_json=
                    item["options"],

                correct_answer=
                    item["answer"],

                explanation=
                    item["explanation"],

                marks=
                    item["marks"],

                negative=
                    item["negative"],
            )
        )

    db.commit()