# GoviLink - A Farmer-Friendly Web Application

> **Project Status:** In Development

[cite_start]GoviLink is a farmer-friendly web platform designed to connect local farmers directly with buyers, vendors, and markets[cite: 72]. [cite_start]The system aims to eliminate middlemen, allowing farmers to sell their harvest at fair prices while buyers gain access to fresh, quality produce[cite: 73].

[cite_start]With a simple, intuitive, and mobile-friendly design, the application ensures that even farmers with minimal technical knowledge can easily manage their products, view orders, and track sales[cite: 74].

---

## 📚 Full Documentation

For a detailed breakdown of our system architecture, database schema, API design, and user stories, please see our **[Project Wiki](https://github.com/RC-inventrix/AgroLink/wiki)**.

---

## ✨ Key Features

This platform is being built with a microservices architecture and includes the following core features:

* [cite_start]**Farmer Module:** Farmers can register, log in, and manage their profiles [cite: 77-78]. [cite_start]They can create, edit, and delete product listings with images, prices, and quantities [cite: 82-83].
* [cite_start]**Buyer Module:** Buyers can browse products by category or location [cite: 86][cite_start], add items to a cart, and place orders[cite: 87].
* [cite_start]**Order & Payment:** A full system for managing orders, tracking payments (simulated), and viewing order history [cite: 92-94].
* **AI Integration:**
    * [cite_start]**Price Prediction:** An AI model suggests a fair price to farmers when they create a listing[cite: 410].
    * [cite_start]**Crop Recommendation:** Recommends crops to farmers based on sensor data and weather[cite: 412, 368].
* [cite_start]**Sensor Data Ingestion:** A dedicated service for ingesting real-time data from IoT sensors [cite: 263-264, 412].
* [cite_start]**Dashboards & Analytics:** Simple dashboards for farmers to view their sales and top-selling items[cite: 97, 408].
* [cite_start]**Admin Panel:** A dashboard for administrators to manage users (approve/ban) and monitor the platform [cite: 105-106].

---

## 🚀 Technology Stack

This project uses a modern, cloud-native technology stack.

| Component | Technology |
| :--- | :--- |
| **Architecture** | [cite_start]Microservices [cite: 216] |
| **Backend Services** | [cite_start]Java & Spring Boot [cite: 216] |
| **AI Services** | [cite_start]Python (Flask/FastAPI) [cite: 217, 269] |
| **API Gateway** | [cite_start]Spring Cloud Gateway [cite: 228] |
| **Authentication** | [cite_start]Spring Security with JWT [cite: 231] |
| **Primary Database** | [cite_start]PostgreSQL [cite: 280] |
| **Timeseries Database**| [cite_start]TimescaleDB (for sensor data) [cite: 283] |
| **File Storage** | [cite_start]AWS S3 [cite: 285] |
| **Caching** | [cite_start]Redis [cite: 284] |
| **Containerization** | [cite_start]Docker [cite: 218] |
| **Orchestration** | [cite_start]Kubernetes (AWS EKS) [cite: 218] |
| **CI/CD Pipeline** | [cite_start]GitHub Actions [cite: 396] |

---

## 🎯 Minimal Viable Product (MVP)

Our initial demo will focus on proving the core end-to-end functionality. The MVP includes:

1.  [cite_start]User registration & login (JWT)[cite: 405].
2.  [cite_start]Farmer creates a product listing (with image upload to S3)[cite: 406].
3.  [cite_start]Buyer browses products and places an order (COD simulation)[cite: 407].
4.  [cite_start]Seller dashboard: view orders + basic sales graph[cite: 408].
5.  [cite_start]Rating & review under products[cite: 409].
6.  [cite_start]AI price suggestion when farmer creates a listing[cite: 410].
7.  [cite_start]Delivery cost calculation[cite: 411].
8.  [cite_start]Basic sensor data ingestion demo (simulated via Postman)[cite: 412].

---

## 🛠️ How to Run Locally

*(This section will be updated once the Docker Compose file is finalized.)*

```bash
# Clone the repository
git clone [https://github.com/your-username/govilink.git](https://github.com/your-username/govilink.git)
cd govilink

# (Instructions to be added)
