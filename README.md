# RTROM - Restaurant & Table Real-time Operations Management

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.x-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

RTROM is a comprehensive, enterprise-grade restaurant management system designed for real-time table reservations, order processing, and administrative oversight. Built with a robust Spring Boot backend and a dynamic React frontend, it provides a seamless experience for customers, waiters, kitchen staff, and administrators.

## 🚀 Key Features

- **Dynamic Table Management**: Real-time table status updates (Available, Occupied, Reserved) powered by logic-based state management.
- **Role-Based Dashboards**:
  - **Admin Dashboard**: Analytics, menu management, order history, and staff oversight.
  - **Waiter Interface**: Quick order entry and table status tracking.
  - **Kitchen Display System (KDS)**: Real-time order queue with status updates.
  - **Customer Portal**: Interactive menu browsing and table reservations.
- **Real-time Synchronization**: Powered by WebSockets for instant updates across all service touchpoints.
- **Secure Payments**: Integrated Stripe Hosted Checkout for seamless transactions.
- **Notification System**: Automated email confirmations for reservations and orders.
- **JWT Authentication**: Secure, stateless authentication for all users.

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL (JPA/Hibernate)
- **Messaging**: WebSockets (STOMP)
- **Integrations**: Stripe API, JavaMail (SMTP)

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router 6
- **Data Fetching**: Axios

---

## 📋 Getting Started

### Prerequisites
- **JDK 21** or higher
- **Node.js** (v18+) & **npm**
- **Maven** 3.x
- **PostgreSQL** instance (or use the provided environment configuration)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Restaurant-and-table-management/RTROM.git
   cd RTROM
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   # Ensure you have your .env file configured
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   *The API will be available at `http://localhost:8081`*

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *The application will be available at `http://localhost:5173`*

---

## 🔐 Configuration

Both the frontend and backend require environment variables. Create a `.env` file in each directory:

### Backend (`/backend/.env`)
```env
SERVER_PORT=8081
DB_URL=jdbc:postgresql://your-db-url
DB_USERNAME=your-username
DB_PASSWORD=your-password
JWT_SECRET=your-secure-secret
STRIPE_SECRET_KEY=sk_test_...
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-app-password
```

### Frontend (`/frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 👥 Default Access
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@rtrom.com` | `admin123` |

---

## 🏗 Project Structure

```text
RTROM/
├── backend/               # Spring Boot Application
│   ├── src/main/java/     # Core logic, Controllers, Services
│   └── pom.xml            # Dependencies & Build config
├── frontend/              # React Application (Vite)
│   ├── src/components/    # Reusable UI components
│   ├── src/pages/         # Dashboard & Feature pages
│   └── package.json       # Frontend dependencies
└── README.md              # Project Documentation
```

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed with ❤️ for the Restaurant Industry.*
