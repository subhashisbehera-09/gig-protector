from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import razorpay
import qrcode
import io
from app.config import get_settings

router = APIRouter(prefix="/payments", tags=["payments"])

settings = get_settings()


class CreateOrderRequest(BaseModel):
    amount: int
    currency: str = "INR"
    receipt: str = None


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
async def create_order(request: CreateOrderRequest):
    try:
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return {
                'order_id': f'mock_{request.amount}_{request.receipt}',
                'amount': request.amount,
                'currency': request.currency,
                'key_id': 'mock_key',
                'status': 'mock_mode'
            }
        
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        
        order = client.order.create({
            'amount': request.amount,
            'currency': request.currency,
            'receipt': request.receipt,
            'payment_capture': 1
        })
        
        return {
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'key_id': settings.RAZORPAY_KEY_ID
        }
    except Exception as e:
        return {
            'order_id': f'mock_{request.amount}_{request.receipt}',
            'amount': request.amount,
            'currency': request.currency,
            'error': str(e)
        }


@router.post("/verify")
async def verify_payment(request: PaymentVerifyRequest):
    try:
        if not settings.RAZORPAY_KEY_ID:
            return {'status': 'success', 'message': 'Mock payment verified'}
        
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }
        
        client.utility.verify_payment_signature(params_dict)
        
        return {'status': 'success', 'message': 'Payment verified'}
    except Exception as e:
        return {'status': 'failed', 'message': str(e)}


@router.get("/qr-code/{amount}")
async def get_qr_code(amount: int):
    upi_id = settings.RAZORPAY_UPI_ID or "gigprotector@upi"
    order_id = f"ORD{amount}{int(now().timestamp())}"
    
    upi_string = f"upi://pay?pa={upi_id}&pn=GigProtector&am={amount}&cu=INR&tn={order_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(upi_string)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#10b981", back_color="white")
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    
    return {
        'qr_data': upi_string,
        'order_id': order_id,
        'amount': amount,
        'upi_id': upi_id
    }


@router.get("/qr-image/{amount}")
async def get_qr_image(amount: int):
    upi_id = settings.RAZORPAY_UPI_ID or "gigprotector@upi"
    order_id = f"ORD{amount}{int(now().timestamp())}"
    
    upi_string = f"upi://pay?pa={upi_id}&pn=GigProtector&am={amount}&cu=INR&tn={order_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(upi_string)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    
    return FileResponse(
        io.BytesIO(buf.read()),
        media_type='image/png',
        headers={'Content-Disposition': f'inline; filename=qr_{amount}.png'}
    )


from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc)


@router.get("/upi-qr/{amount}")
async def generate_upi_qr(amount: int):
    try:
        upi_id = "gigprotector@upi"
        note = f"GigProtector Premium {amount} INR"
        
        upi_string = f"upi://pay?pa={upi_id}&pn=GigProtector&am={amount}&cu=INR&tn={note}"
        
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=6,
            border=2,
        )
        qr.add_data(upi_string)
        qr.make(fit=True)
        
        img = qr.make_image(image_factory=None)
        
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return FileResponse(
            buffer,
            media_type='image/png',
            headers={'Content-Disposition': f'inline; filename=upi_qr_{amount}.png'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))