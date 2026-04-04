from typing import Optional, Dict
import httpx
from app.config import get_settings

settings = get_settings()


async def get_aqi_data(zone_id: str) -> Optional[Dict]:
    async with httpx.AsyncClient() as client:
        try:
            if settings.AQI_API_KEY:
                response = await client.get(
                    f"https://api.waqi.info/feed/{zone_id}/",
                    params={"token": settings.AQI_API_KEY},
                    timeout=10.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "ok":
                        return _parse_aqi_response(data)
        except Exception:
            pass
    
    return _get_mock_aqi_data(zone_id)


def _parse_aqi_response(data: Dict) -> Dict:
    aqi = data.get("data", {}).get("aqi", 0)
    iaqi = data.get("data", {}).get("iaqi", {})
    
    pollutant = "pm25"
    if "pm25" in iaqi:
        pollutant = "pm25"
    elif "pm10" in iaqi:
        pollutant = "pm10"
    elif "o3" in iaqi:
        pollutant = "o3"
    
    return {
        "aqi": aqi,
        "category": _get_aqi_category(aqi),
        "pollutant": pollutant,
        "dominant": data.get("data", {}).get("dominent", "pm25")
    }


def _get_aqi_category(aqi: int) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


def _get_mock_aqi_data(zone_id: str) -> Dict:
    return {
        "aqi": 45,
        "category": "Good",
        "pollutant": "pm25"
    }


async def get_aqi_forecast(zone_id: str) -> list:
    if not settings.AQI_API_KEY:
        return []
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://api.waqi.info/feed/{zone_id}/forecast/",
                params={"token": settings.AQI_API_KEY},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    return data.get("data", {}).get("forecast", {}).get("daily", {})
        except Exception:
            pass
    
    return []