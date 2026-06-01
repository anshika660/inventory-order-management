from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    sku: str = Field(..., description="Unique product stock-keeping unit")
    name: str
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    stock_quantity: int = Field(..., ge=0, description="Stock cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


# --- CUSTOMER SCHEMAS ---
class CustomerBase(BaseModel):
    name: str
    email: EmailStr  # Automatically validates email formatting structure

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True


# --- ORDER SCHEMAS ---
class OrderCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(..., gt=0, description="Order quantity must be at least 1")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    status: str
    created_at: datetime
    product: Optional[ProductResponse] = None
    customer: Optional[CustomerResponse] = None

    class Config:
        from_attributes = True