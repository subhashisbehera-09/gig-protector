from datetime import datetime
from typing import Optional, Dict, List
from enum import Enum
import uuid
import hashlib


class PaymentGateway(str, Enum):
    RAZORPAY = "razorpay"
    STRIPE = "stripe"
    UPI = "upi"


class PayoutStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class MockPaymentGateway:
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway
        self.transactions = []
    
    def _generate_transaction_id(self) -> str:
        prefix = {
            PaymentGateway.RAZORPAY: "rpay_",
            PaymentGateway.STRIPE: "stripe_",
            PaymentGateway.UPI: "UPI_"
        }[self.gateway]
        return f"{prefix}{uuid.uuid4().hex[:16]}"
    
    def _generate_mock_response(self, amount: float, recipient_id: str) -> Dict:
        timestamp = datetime.utcnow()
        if self.gateway == PaymentGateway.RAZORPAY:
            return {
                "gateway": "razorpay",
                "transaction_id": self._generate_transaction_id(),
                "amount": amount,
                "currency": "INR",
                "status": "captured",
                "recipient": {
                    "account": f"****{recipient_id[-4:]}",
                    "ifsc": "RAZOR0001",
                    "name": "GigProtector Payout"
                },
                "verification": {
                    "mode": "neft",
                    "settled_by": "Razorpay",
                    "settlement_url": f"https://dashboard.razorpay.com/app/settlements/{uuid.uuid4().hex[:12]}"
                },
                "processing_time": "< 30 seconds",
                "timestamp": timestamp.isoformat()
            }
        elif self.gateway == PaymentGateway.STRIPE:
            return {
                "gateway": "stripe",
                "transaction_id": self._generate_transaction_id(),
                "amount": amount,
                "currency": "inr",
                "status": "succeeded",
                "recipient": {
                    "account": f"acct_{recipient_id[:8]}",
                    "bank": "Instant Payout Enabled",
                    "name": "GigProtector Payout"
                },
                "verification": {
                    "type": "stripe_payout",
                    "arrival": "instant",
                    "dashboard_url": f"https://dashboard.stripe.com/payouts/{uuid.uuid4().hex[:12]}"
                },
                "processing_time": "< 60 seconds",
                "timestamp": timestamp.isoformat()
            }
        else:
            return {
                "gateway": "upi",
                "transaction_id": self._generate_transaction_id(),
                "amount": amount,
                "currency": "INR",
                "status": "SUCCESS",
                "recipient": {
                    "vpa": f"gigprotector@{recipient_id[:6]}",
                    "name": "GigProtector"
                },
                "verification": {
                    "upi_ref": uuid.uuid4().hex[:12].upper(),
                    "bank_ref": hashlib.md5(str(timestamp).encode()).hexdigest()[:12].upper()
                },
                "processing_time": "< 10 seconds",
                "timestamp": timestamp.isoformat()
            }


class InstantPayoutService:
    def __init__(self):
        self.gateways = {
            gateway: MockPaymentGateway(gateway) 
            for gateway in PaymentGateway
        }
        self.payout_history: List[Dict] = []
    
    async def initiate_instant_payout(
        self,
        claim_id: int,
        recipient_id: str,
        amount: float,
        gateway: PaymentGateway = PaymentGateway.UPI,
        recipient_name: str = "",
        metadata: Optional[Dict] = None
    ) -> Dict:
        gateway_service = self.gateways[gateway]
        
        payout_record = {
            "payout_id": f"payout_{uuid.uuid4().hex[:12]}",
            "claim_id": claim_id,
            "recipient_id": recipient_id,
            "recipient_name": recipient_name,
            "amount": amount,
            "gateway": gateway.value,
            "status": PayoutStatus.PROCESSING.value,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        
        mock_response = gateway_service._generate_mock_response(amount, recipient_id)
        
        payout_record.update({
            "status": PayoutStatus.COMPLETED.value,
            "transaction_id": mock_response["transaction_id"],
            "gateway_response": mock_response,
            "completed_at": datetime.utcnow().isoformat()
        })
        
        self.payout_history.append(payout_record)
        
        return {
            "success": True,
            "payout_id": payout_record["payout_id"],
            "amount": amount,
            "gateway": gateway.value,
            "status": payout_record["status"],
            "transaction_id": mock_response["transaction_id"],
            "processing_time": mock_response["processing_time"],
            "recipient": mock_response["recipient"],
            "verification": mock_response["verification"],
            "message": f"Payment of ₹{amount:.2f} processed successfully via {gateway.value}"
        }
    
    async def get_payout_status(self, payout_id: str) -> Optional[Dict]:
        for payout in self.payout_history:
            if payout["payout_id"] == payout_id:
                return payout
        return None
    
    async def get_payouts_by_claim(self, claim_id: int) -> List[Dict]:
        return [p for p in self.payout_history if p["claim_id"] == claim_id]
    
    async def get_payouts_by_recipient(self, recipient_id: str) -> List[Dict]:
        return [p for p in self.payout_history if p["recipient_id"] == recipient_id]
    
    async def simulate_failed_payout(self, claim_id: int, reason: str) -> Dict:
        return {
            "success": False,
            "error_code": "PAYOUT_FAILED",
            "error_message": reason,
            "suggestions": [
                "Verify bank account details",
                "Check if account is active",
                "Contact support if issue persists"
            ]
        }
    
    async def get_payment_options(self) -> Dict:
        return {
            "gateways": [
                {
                    "name": "UPI Instant",
                    "code": PaymentGateway.UPI.value,
                    "description": "Fastest payout - money in seconds",
                    "processing_time": "< 10 seconds",
                    "fees": "0%",
                    "limit": "₹1 - ₹1,00,000",
                    "icon": "📱",
                    "recommended": True
                },
                {
                    "name": "Razorpay",
                    "code": PaymentGateway.RAZORPAY.value,
                    "description": "Bank transfer via Razorpay",
                    "processing_time": "< 30 seconds",
                    "fees": "0%",
                    "limit": "₹100 - ₹5,00,000",
                    "icon": "💳",
                    "recommended": False
                },
                {
                    "name": "Stripe",
                    "code": PaymentGateway.STRIPE.value,
                    "description": "Stripe instant payout",
                    "processing_time": "< 60 seconds",
                    "fees": "0%",
                    "limit": "₹100 - ₹10,00,000",
                    "icon": "💰",
                    "recommended": False
                }
            ],
            "demo_mode": True,
            "message": "All transactions are simulated in test mode"
        }
    
    async def get_recent_payouts(self, limit: int = 10) -> List[Dict]:
        return sorted(
            self.payout_history, 
            key=lambda x: x.get("completed_at", x.get("created_at", "")), 
            reverse=True
        )[:limit]


payout_service = InstantPayoutService()
