import asyncio
import logging
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.services.trigger_automation_service import run_trigger_check
from app.services.auto_claim_service import run_auto_claim_process

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def trigger_monitoring_job():
    async with AsyncSessionLocal() as db:
        try:
            await run_trigger_check(db)
        except Exception as e:
            logger.error(f"Trigger monitoring job failed: {e}")


async def auto_claim_job():
    async with AsyncSessionLocal() as db:
        try:
            await run_auto_claim_process(db)
        except Exception as e:
            logger.error(f"Auto-claim job failed: {e}")


def start_scheduler():
    scheduler.add_job(
        trigger_monitoring_job,
        trigger=IntervalTrigger(minutes=15),
        id="trigger_monitoring",
        name="Monitor weather/AQI triggers",
        replace_existing=True
    )
    
    scheduler.add_job(
        auto_claim_job,
        trigger=IntervalTrigger(minutes=15),
        id="auto_claim",
        name="Auto-create claims from triggered alerts",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started - trigger monitoring and auto-claim jobs queued")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
