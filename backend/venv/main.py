from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List
from sqlalchemy.orm import Session

# Database utilities aur models ko import karna
import models
from database import engine, get_db

# Tables ko database mein physically create karne ke liye trigger rule
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Database Integrated Inventory System")

# CORS Middleware for Frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Validations Schema ---
class ProductCreate(BaseModel):
    sku: str
    name: str
    price: float
    stock: int

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr

class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemSchema]


# --- API Routes & PostgreSQL Operations ---

# 1. Product Management Routes
@app.post("/products/", status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Business Rule 1: Unique SKU checking in DB
    db_product = db.query(models.Product).filter(models.Product.sku.get_backend() == product.sku.get_backend()).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product SKU already exists in database.")
    
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


# 2. Customer Management Routes
@app.post("/customers/", status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    # Business Rule 2: Unique Email checking in DB
    db_customer = db.query(models.Customer).filter(models.Customer.email.get_backend() == customer.email.get_backend()).first()
    if db_customer:
        raise HTTPException(status_code=400, detail="Customer email already exists in database.")
    
    new_customer = models.Customer(**customer.dict())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@app.get("/customers/")
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


# 3. Order Processing & Atomic Inventory Reduction Route
@app.post("/orders/", status_code=201)
def place_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Customer validation lookup
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer record not found.")

    items_to_process = []
    
    # Inventory Verification Phase
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} does not exist.")
        
        # Business Rule 3: Insufficient stock barrier
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock short for {product.name}. Available: {product.stock}, Requested: {item.quantity}"
            )
        items_to_process.append((product, item.quantity))
    
    # Database Transaction Phase
    # New order registration
    new_order = models.Order(customer_id=order.customer_id, status="Completed")
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Business Rule 4: Loop blocks and automatically updates/deducts active inventory
    for product, quantity in items_to_process:
        product.stock -= quantity  # Automatic stock decrement
        order_item = models.OrderItem(order_id=new_order.id, product_id=product.id, quantity=quantity)
        db.add(order_item)
    
    db.commit()
    return {"message": "Order placed successfully!", "order_id": new_order.id}

@app.get("/orders/")
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()