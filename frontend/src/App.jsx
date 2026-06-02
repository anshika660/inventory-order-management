import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'const API_BASE_URL = 'https://inventory-order-management-e2fi.onrender.com';';

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [productForm, setProductForm] = useState({ sku: '', name: '', price: '', stock_quantity: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', email: '' });
  const [orderForm, setOrderForm] = useState({ customer_id: '', product_id: '', quantity: '' });

  const [message, setMessage] = useState({ text: '', isError: false });

  const fetchAllData = async () => {
    try {
      const [prodRes, custRes, ordRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/customers`),
        axios.get(`${API_BASE_URL}/orders`),
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const triggerNotification = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 4000);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/products`, {
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity),
      });
      triggerNotification(`Product "${productForm.name}" added successfully!`);
      setProductForm({ sku: '', name: '', price: '', stock_quantity: '' });
      fetchAllData();
    } catch (err) {
      triggerNotification(err.response?.data?.detail || "Failed to add product.", true);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/customers`, customerForm);
      triggerNotification(`Customer "${customerForm.name}" registered successfully!`);
      setCustomerForm({ name: '', email: '' });
      fetchAllData();
    } catch (err) {
      triggerNotification(err.response?.data?.detail || "Registration failed.", true);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/orders`, {
        customer_id: parseInt(orderForm.customer_id),
        product_id: parseInt(orderForm.product_id),
        quantity: parseInt(orderForm.quantity),
      });
      triggerNotification("Order processed and stock updated!");
      setOrderForm({ customer_id: '', product_id: '', quantity: '' });
      fetchAllData();
    } catch (err) {
      triggerNotification(err.response?.data?.detail || "Order submission failed.", true);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>📦 Inventory & Order Management Dashboard</h1>

      {message.text && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '20px',
          backgroundColor: message.isError ? '#fadbd8' : '#d4efdf',
          color: message.isError ? '#c0392b' : '#27ae60',
          border: `1px solid ${message.isError ? '#f5b7b1' : '#a9dfbf'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Add Product Form */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#2980b9' }}>➕ Add New Product</h3>
          <form onSubmit={handleCreateProduct}>
            <input type="text" placeholder="Unique SKU (e.g., SKU-101)" required value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} style={inputStyle} />
            <input type="text" placeholder="Product Name" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={inputStyle} />
            <input type="number" step="0.01" placeholder="Price ($)" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Initial Stock Qty" required value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} style={inputStyle} />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#2980b9' }}>Save Product</button>
          </form>
        </div>

        {/* Add Customer Form */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#27ae60' }}>👤 Register Customer</h3>
          <form onSubmit={handleCreateCustomer}>
            <input type="text" placeholder="Full Name" required value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} style={inputStyle} />
            <input type="email" placeholder="Email Address" required value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} style={inputStyle} />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#27ae60' }}>Register</button>
          </form>
        </div>

        {/* Place Order Form */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#8e44ad' }}>🛒 Create New Order</h3>
          <form onSubmit={handlePlaceOrder}>
            <select required value={orderForm.customer_id} onChange={e => setOrderForm({...orderForm, customer_id: e.target.value})} style={inputStyle}>
              <option value="">Select Purchasing Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
            <select required value={orderForm.product_id} onChange={e => setOrderForm({...orderForm, product_id: e.target.value})} style={inputStyle}>
              <option value="">Select Item to Order</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} [Stock: {p.stock_quantity}]</option>)}
            </select>
            <input type="number" placeholder="Quantity Desired" required value={orderForm.quantity} onChange={e => setOrderForm({...orderForm, quantity: e.target.value})} style={inputStyle} />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#8e44ad' }}>Submit Order Transaction</button>
          </form>
        </div>

      </div>

      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', color: '#2c3e50' }}>📊 Active Inventory Stocks & Orders</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginTop: '20px' }}>
          
          <div>
            <h3>📦 Current Product Catalog</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>ID</th><th style={thStyle}>SKU</th><th style={thStyle}>Name</th><th style={thStyle}>Price</th><th style={thStyle}>Available Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>{p.id}</td><td style={tdStyle}><code>{p.sku}</code></td><td style={tdStyle}>{p.name}</td><td style={tdStyle}>${p.price.toFixed(2)}</td>
                    <td style={{ ...tdStyle, color: p.stock_quantity === 0 ? '#e74c3c' : '#2c3e50', fontWeight: 'bold' }}>{p.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3>📋 Transactional Order Logs</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>Order ID</th><th style={thStyle}>Cust. ID</th><th style={thStyle}>Prod. ID</th><th style={thStyle}>Qty Ordered</th><th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>#{o.id}</td><td style={tdStyle}>Customer #{o.customer_id}</td><td style={tdStyle}>Product #{o.product_id}</td><td style={tdStyle}>{o.quantity}</td>
                    <td style={tdStyle}><span style={{ background: '#d4efdf', color: '#196f3d', padding: '3px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold' }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', margin: '8px 0', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' };
const btnStyle = { width: '100%', color: 'white', padding: '12px', margin: '10px 0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' };
const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#718096' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #edf2f7' };

export default App;