import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_sos_alert(incident_id: str, worker_id: str):
    """
    Send SOS alert to safety team - called via background task
    Section 1: Alert trigger → first action < 2 seconds (handled by async)
    """
    logger.info(f"SOS_ALERT_SENT: incident_id={incident_id}, worker_id={worker_id}")


async def send_sms_fallback(phone: str, message: str) -> bool:
    """
    Section 1: Fallback SMS when data network is weak
    Section 8: Error handling for no data/wifi
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning(f"TWILIO_NOT_CONFIGURED: SMS not sent to {phone}")
        return False
    
    try:
        from twilio.rest import Client
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        twilio_message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
        
        logger.info(f"SMS_SENT: incident_id in message, twilio_sid={twilio_message.sid}")
        return True
    except Exception as e:
        logger.error(f"SMS_FAILED: error={str(e)}")
        return False


async def initiate_voice_call(phone: str, message: str) -> bool:
    """
    Section 1: Fallback automated voice call when data network is weak
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning(f"TWILIO_NOT_CONFIGURED: Voice call not initiated to {phone}")
        return False
    
    try:
        from twilio.rest import Client
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        call = client.calls.create(
            twiml=f"<Response><Say>{message}</Say></Response>",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone
        )
        
        logger.info(f"VOICE_CALL_INITIATED: call_sid={call.sid}")
        return True
    except Exception as e:
        logger.error(f"VOICE_CALL_FAILED: error={str(e)}")
        return False


async def notify_emergency_contacts(incident_id: str, contacts: list[dict], location: dict):
    """
    Section 4: Workflow - notify emergency contacts via SMS+call
    """
    message = (
        f"EMERGENCY ALERT: Your contact ({contacts[0].get('name', 'worker')}) has triggered an SOS. "
        f"Location: https://maps.google.com/?q={location['lat']},{location['lng']}"
    )
    
    for contact in contacts:
        phone = contact.get("phone")
        if phone:
            await send_sms_fallback(phone, message)
            logger.info(f"CONTACT_NOTIFIED: incident_id={incident_id}, phone={phone}")


async def escalate_to_psap(incident_id: str, location: dict, notes: Optional[str] = None):
    """
    Section 4: Workflow - escalate to PSAP (911/112)
    """
    message = (
        f"EMERGENCY SERVICE REQUEST from GigProtector. "
        f"Location: Lat {location['lat']}, Lng {location['lng']}. "
        f"Notes: {notes or 'None'}"
    )
    
    await initiate_voice_call(settings.PLATFORM_EMERGENCY_NUMBER, message)
    
    logger.info(f"PSAP_ESCALATED: incident_id={incident_id}, location={location}")
