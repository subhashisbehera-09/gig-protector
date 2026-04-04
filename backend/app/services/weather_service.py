from typing import Optional, Dict
import httpx
from app.config import get_settings

settings = get_settings()


async def get_weather_data(zone_id: str) -> Optional[Dict]:
    if not settings.WEATHER_API_KEY:
        return _get_mock_weather_data(zone_id)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://api.weatherapi.com/v1/current.json",
                params={"key": settings.WEATHER_API_KEY, "q": zone_id},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "temperature": data["current"]["temp_c"],
                    "condition": data["current"]["condition"]["text"],
                    "wind_speed": data["current"]["wind_kph"],
                    "humidity": data["current"]["humidity"],
                    "risk_score": _calculate_weather_risk(data)
                }
        except Exception:
            pass
    
    return _get_mock_weather_data(zone_id)


def _calculate_weather_risk(data: Dict) -> int:
    condition = data.get("current", {}).get("condition", {}).get("text", "").lower()
    wind_kph = data.get("current", {}).get("wind_kph", 0)
    
    score = 0
    if "storm" in condition or "hurricane" in condition:
        score = 4
    elif "heavy rain" in condition or "snow" in condition:
        score = 3
    elif "rain" in condition or "wind" in condition:
        score = 2
    elif "cloudy" in condition:
        score = 1
    
    if wind_kph > 50:
        score = min(score + 2, 4)
    
    return score


def _get_mock_weather_data(zone_id: str) -> Dict:
    return {
        "temperature": 22.0,
        "condition": "Clear",
        "wind_speed": 15.0,
        "humidity": 45,
        "risk_score": 0
    }


async def get_forecast(zone_id: str, days: int = 3) -> list:
    if not settings.WEATHER_API_KEY:
        return []
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://api.weatherapi.com/v1/forecast.json",
                params={"key": settings.WEATHER_API_KEY, "q": zone_id, "days": days},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("forecast", {}).get("forecastday", [])
        except Exception:
            pass
    
    return []