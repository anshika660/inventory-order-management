from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db
import models
import schemas

# Safeguard table creation
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database sync warning: {e}")

app = FastAPI(title="Inventory & Order Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Online", "system": "Inventory & Order Management System API"}


# ==========================================
# 📦 PRODUCT ENDPOINTS
# ==========================================

@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    existing_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Product with SKU '{product.sku}' already exists."
        )
    
    # Clean conversion of Pydantic model to Python dictionary
    product_data = product.dict() if hasattr(product, 'dict') else product.model_dump()
    db_product = models.Product(**product_data)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products", response_model=List[schemas.ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


# ==========================================
# 👥 CUSTOMER ENDPOINTS
# ==========================================

@app.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing_customer = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Customer with email '{customer.email}' is already registered."
        )
    
    customer_data = customer.dict() if hasattr(customer, 'dict') else customer.model_dump()
    db_customer = models.Customer(**customer_data)
    
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@app.get("/customers", response_model=List[schemas.CustomerResponse])
def get_all_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


# ==========================================
# 🛒 ORDER ENDPOINTS & LOGIC
# ==========================================

@app.post("/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    product = db.query(models.Product).filter(models.Product.id == order.product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    # Core Business Validation: Check stock levels safely
    if product.stock_quantity < order.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Insufficient stock. Available: {product.stock_quantity}, Requested: {order.quantity}"
        )

    # Automatic inventory reduction
    product.stock_quantity -= order.quantity

    db_order = models.Order(
        customer_id=order.customer_id,
        product_id=order.product_id,
        quantity=order.quantity,
        status="Completed"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()