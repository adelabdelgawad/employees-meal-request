import os
import logging
import asyncio
from typing import List, Optional

from dotenv import load_dotenv
from exchangelib import (
    Credentials,
    Account,
    Message,
    Mailbox,
    HTMLBody,
    Configuration,
)

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmailSender:
    """A class to handle sending emails via Exchange Web Services (EWS)."""

    def __init__(self):
        """Initialize the EmailSender with Exchange account configuration."""
        self.account = self.create_account()

    @staticmethod
    def get_env_var(var_name: str) -> str:
        """
        Fetch and validate an environment variable.

        Args:
            var_name (str): The name of the environment variable to fetch.

        Returns:
            str: The value of the environment variable.

        Raises:
            ValueError: If the environment variable is missing or empty.
        """
        value = os.getenv(var_name)
        if not value:
            raise ValueError(
                f"Environment variable '{
                             var_name}' is missing or empty."
            )
        return value

    def create_account(self) -> Account:
        """
        Create and return an EWS account instance using environment variables.

        Returns:
            Account: An instance of the EWS account.

        Raises:
            Exception: For any unexpected errors during account creation.
        """
        try:
            username = self.get_env_var("DOMAIN_USER")
            password = self.get_env_var("PASSWORD")
            server = self.get_env_var("SERVER")
            primary_smtp_address = self.get_env_var("PRIMARY_SMTP_ADDRESS")

            credentials = Credentials(username=username, password=password)
            config = Configuration(server=server, credentials=credentials)

            logger.info(
                f"Creating EWS account for '{
                    primary_smtp_address}' on '{server}'."
            )
            return Account(
                primary_smtp_address=primary_smtp_address,
                credentials=credentials,
                config=config,
                autodiscover=False,
                access_type="delegate",
            )
        except Exception as e:
            logger.error(f"Failed to create EWS account: {e}")
            raise

    def create_message(
        self,
        subject: str,
        body: str,
        to_recipient: str,
        cc_recipients: Optional[List[str]] = None,
    ) -> Message:
        """
        Create and return an email message.

        Args:
            subject (str): The subject of the email.
            body (str): The HTML body content of the email.
            to_recipient (str): List of recipient email addresses.
            cc_recipients (Optional[List[str]]): List of CC email addresses.

        Returns:
            Message: The email message object ready to be sent.

        Raises:
            Exception: If message creation fails.
        """
        try:
            message = Message(
                account=self.account,
                subject=subject,
                body=HTMLBody(body),
                to_recipients=[Mailbox(email_address=to_recipient)],
                cc_recipients=(
                    [
                        Mailbox(email_address=recipient)
                        for recipient in cc_recipients
                    ]
                    if cc_recipients
                    else None
                ),
            )
            return message
        except Exception as e:
            logger.error(f"Failed to create email message: {e}")
            raise

    async def send_email(
        self,
        subject: str,
        body: str,
        to_recipient: str,
        cc_recipients: Optional[List[str]] = None,
    ) -> None:
        """
        Asynchronously send an email using the EWS account.

        Args:
            subject (str): The subject of the email.
            body (str): The HTML body content of the email.
            to_recipient (str): List of recipient email addresses.
            cc_recipients (Optional[List[str]]): List of CC email addresses.

        Raises:
            Exception: If email sending fails.
        """
        try:
            message = self.create_message(
                subject=subject,
                body=body,
                to_recipient=to_recipient,
                cc_recipients=cc_recipients,
            )

            # Use asyncio.to_thread to avoid blocking in async context
            await asyncio.to_thread(message.send)

            logger.info("Email sent successfully.")
        except Exception as e:
            logger.error(f"Failed to send email. Error: {e}")
            raise
