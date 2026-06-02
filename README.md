Inventory & Order Management System
A full-stack web application designed to manage products, customers, and orders with real-time inventory tracking.

Live Application
Frontend (Dashboard): https://inventory-order-management-l1df.vercel.app/

Backend API Documentation: https://inventory-order-management-e2fi.onrender.com/docs
## Deployment & Containerization
This project is fully containerized to ensure seamless deployment across different environments.
Backend Docker Image : https://hub.docker.com/r/anshika660/inventory-backend

 Tech Stack
Backend: FastAPI, SQLAlchemy, PostgreSQL (Neon)

Frontend: React.js, Axios

Deployment: Vercel (Frontend), Render (Backend)

Containerization: Docker, Docker Compose

Features
Product Management: Add products with unique SKUs.

Customer Registration: Manage customer profiles with unique email validation.

Order Processing: Automated inventory validation and stock reduction.

Responsive UI: User-friendly dashboard for real-time tracking.

How to Run Locally
Prerequisites
Docker installed on your machine.

Steps
Clone the repository:

Bash
git clone https://github.com/anshika660/inventory-order-management.git
cd inventory-order-management
Configure Environment Variables:
Create a .env file in the root directory and add your database URL:

Code snippet
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
Launch the Application:

Bash
docker-compose up --build
The API will be available at http://localhost:8000 and the database will be running on port 5432.
