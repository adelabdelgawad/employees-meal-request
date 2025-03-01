import logging
import os
from typing import List, Dict
import pytz
from sqlalchemy.ext.asyncio import AsyncSession
from jinja2 import Environment, FileSystemLoader

from db.crud import read_email_with_role
from db.models import Request, RequestLine
from routers.cruds.request import add_attendance_and_shift_to_request_line
from routers.cruds.request_lines import read_request_lines
from services.mail_sender import EmailSender

# Default timezone
cairo_tz = pytz.timezone("Africa/Cairo")
logger = logging.getLogger(__name__)

from icecream import ic


async def send_email(
    session: AsyncSession,
    to_recipient: str,
    body_html: str,
    subject: str,
    cc_receipients_role_id: int,
) -> None:
    """
    Sends a notification email for the meal request.

    Args:
        session (AsyncSession): SQLAlchemy asynchronous session.
        to_recipient (str): Email address of the recipient.
        body_html (str): HTML content of the email.
        subject (str): Subject of the email.
        cc_receipients_role_id (int): Role ID to fetch emails for CC.

    Raises:
        Exception: Propagates any exception encountered during the email sending process.
    """
    ic(session, to_recipient, body_html, subject, cc_receipients_role_id)
    try:
        email_sender = EmailSender()

        # Fetch emails with the required role to CC
        emails = await read_email_with_role(
            session, role_id=cc_receipients_role_id
        )
        print(emails)
        cc_recipients = [email.address for email in emails] if emails else None
        logger.info("CC recipients fetched: %s", cc_recipients)

        # Send email asynchronously
        await email_sender.send_email(
            subject, body_html, to_recipient, cc_recipients
        )
        logger.info(
            "Email sent successfully to %s with subject '%s'",
            to_recipient,
            subject,
        )
    except Exception as e:
        logger.error(
            "Failed to send email to %s: %s", to_recipient, e, exc_info=True
        )
        raise


def generate_new_request_template(data: dict, file_name: str) -> str:
    """
    Generates an email template with the provided data.

    Args:
        data (dict): Data to render in the template.
        file_name (str): Template file name.

    Returns:
        str: Rendered HTML content.

    Raises:
        Exception: Propagates any exception encountered during template rendering.
    """
    try:
        env = Environment(
            loader=FileSystemLoader(os.path.abspath("templates"))
        )
        template = env.get_template(file_name)
        rendered_template = template.render(data)
        logger.info("Template '%s' rendered successfully.", file_name)
        return rendered_template
    except Exception as e:
        logger.error(
            "Error rendering template '%s': %s", file_name, e, exc_info=True
        )
        raise


async def send_confirmation_notification(
    session: AsyncSession,
    request: Request,
    requester_name: str,
) -> None:
    """
    Sends a confirmation notification email for the given meal request.

    Args:
        session (AsyncSession): SQLAlchemy asynchronous session.
        request (Request): The meal request object.

    Raises:
        Exception: Propagates any exception encountered during the process.
    """
    try:
        request_lines = await read_request_lines(session, request.id)
        ic(request_lines)
        body_html = generate_new_request_template(
            {"request_lines": request_lines}, "confirmation.html"
        )

        subject = f"Meal Request #{request.id} - Confirmed"
        await send_email(
            session=session,
            to_recipient=f"{requester_name}@andalusiagroup.net",
            body_html=body_html,
            subject=subject,
            cc_receipients_role_id=2,
        )
        logger.info(
            "Confirmation notification sent for request id %s", request.id
        )
    except Exception as e:
        logger.error(
            "Failed to send confirmation notification",
            exc_info=True,
        )
        raise


async def create_request_lines_and_confirm(
    session: AsyncSession,
    hris_session: AsyncSession,
    request: Request,
    request_lines: List[Dict],
    request_status_id: int,
    requester: str,
) -> None:
    """
    Creates request lines, adds attendance and shift information (if applicable),
    and sends a confirmation email for the meal request.

    Args:
        session (AsyncSession): SQLAlchemy asynchronous session.
        hris_session (AsyncSession): HRIS asynchronous session.
        request (Request): The meal request object.
        request_lines (List[Dict]): List of dictionaries containing request line details.
        request_status_id (int): Status ID of the request.
        requester (str): Requester's email prefix.

    Raises:
        Exception: Propagates any exception encountered during the process.
    """
    try:
        logger.info(
            "Starting creation of request lines for request id %s", request.id
        )
        new_request_lines = [
            RequestLine(
                request_id=request.id,
                employee_id=line["employee_id"],
                employee_code=line["employee_code"],
                department_id=line["department_id"],
                notes=line["notes"],
                meal_id=request.meal_id,
                is_accepted=True,
            )
            for line in request_lines
        ]
        session.add_all(new_request_lines)
        await session.commit()
        logger.info(
            "Request lines created successfully for request id %s", request.id
        )

        # Add attendance and shift details if the request is pending (status_id == 1)
        if request_status_id == 1:
            logger.info(
                "Adding attendance and shift for pending request id %s",
                request.id,
            )
            await add_attendance_and_shift_to_request_line(
                session=session,
                hris_session=hris_session,
                request_lines=new_request_lines,
            )

        # Prepare and send the notification email
        body_html = generate_new_request_template(
            {"request_lines": len(request_lines)}, "request.html"
        )
        subject = (
            f"Meal Request Submitted #{request.id} - Confirmation Pending"
        )
        logger.info("Sending email notification for request id %s", request.id)
        await send_email(
            session=session,
            to_recipient=f"{requester}@andalusiagroup.net",
            body_html=body_html,
            subject=subject,
            cc_receipients_role_id=1,
        )
        logger.info("Email notification sent for request id %s", request.id)
    except Exception as e:
        logger.error(
            "Error creating request lines and sending confirmation for request id %s: %s",
            request.id,
            e,
            exc_info=True,
        )
        raise
