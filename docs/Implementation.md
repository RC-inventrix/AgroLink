# Implementation

## Preliminary Note: Repository Analysis

### A) Detected Microservices

The following microservices were identified in the `/backend` directory of the repository:

| # | Service Directory | Role | Port |
|---|---|---|---|
| 1 | `service-discovery` | Eureka Server (service registry) | 8761 |
| 2 | `config-server` | Spring Cloud Config Server (centralised config) | 8888 |
| 3 | `api-gateway` | Spring Cloud Gateway (single entry point) | 8080 |
| 4 | `identityAndUser-service` | Authentication, JWT, user management | 8081 |
| 5 | `productCatalog-service` | Product listings, AWS S3 uploads, crop ML proxy | — |
| 6 | `auction-service` | Auction lifecycle, bidding, scheduled tasks | — |
| 7 | `orderPayment-service` | Cart, orders, Stripe payments, bargaining, notifications | 8082 |
| 8 | `chat-service` | Real-time WebSocket/STOMP messaging, AES encryption | 8083 |
| 9 | `moderation-service` | User reports, issue tracking, content moderation | 8084 |
| 10 | `chatbot-service` | AI customer support via Google Gemini API | 8085 |
| 11 | `crop-recommendation-service` | Python Flask ML service (RandomForest crop prediction) | — |

### B) Detected Frontend Framework and Tooling

The frontend resides in the `/frontend` directory and uses the following stack:

- **Framework:** Next.js 16.0.8 (App Router)
- **UI Library:** React 19.2.1
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Component Library:** Radix UI (accordion, dialog, select, tooltip, and more)
- **HTTP Client:** Axios (with native `fetch` also used in some pages)
- **WebSocket:** `@stomp/stompjs` + `sockjs-client`
- **Maps:** `react-leaflet` v4.2.1 + `leaflet` v1.9.4
- **Toasts/Notifications:** `sonner`
- **Date Utilities:** `date-fns` v4.1.0
- **Icons:** `lucide-react`
- **Markdown:** `react-markdown` v10.1.0
- **Build Tool / Bundler:** Next.js built-in (Turbopack / Webpack)

---

## 1. Implementation Overview

### 1.1 High-Level Architecture

AgroLink is built on a **microservices architecture** in which each business domain is encapsulated in its own independently deployable service. All client requests — whether from a web browser or any external consumer — are routed through a single **API Gateway** (Spring Cloud Gateway, port 8080). The gateway performs routing and load balancing by consulting the **Service Discovery** registry (Netflix Eureka, port 8761). A centralised **Config Server** (Spring Cloud Config, port 8888) distributes configuration to every service at startup, enabling environment-specific settings without code changes.

The **Next.js frontend** communicates exclusively with the API Gateway using HTTPS/REST for data operations and a direct WebSocket connection to the Chat Service for real-time messaging. JSON Web Tokens (JWT) are used for stateless authentication across all services.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                                     │
│                                                                         │
│    ┌──────────────────────────────────────────────────────────────┐     │
│    │          Next.js Frontend  (browser, port 3000)              │     │
│    │   React 19 · TypeScript · Tailwind CSS · Radix UI            │     │
│    └───────────────┬──────────────────────────────┬───────────────┘     │
│                    │  REST / HTTP                 │ WebSocket (STOMP)   │
└────────────────────┼──────────────────────────────┼─────────────────────┘
                     │                              │
         ┌───────────▼─────────────┐    ┌──────────▼──────────┐
         │     API Gateway         │    │    Chat Service      │
         │  Spring Cloud Gateway   │    │  Spring Boot + STOMP │
         │      port 8080          │    │     port 8083        │
         └───────────┬─────────────┘    └─────────────────────┘
                     │ (routes via Eureka)
     ┌───────────────┼───────────────────────────────────────────┐
     │               │                                           │
     ▼               ▼               ▼              ▼            ▼
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  ┌──────────┐
│Identity │   │ Product  │   │ Auction  │   │  Order/  │  │Moderatn. │
│& User   │   │ Catalog  │   │ Service  │   │ Payment  │  │ Service  │
│ :8081   │   │ Service  │   │ Service  │   │ :8082    │  │  :8084   │
└────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘  └────┬─────┘
     │             │              │               │              │
     │        ┌────▼──────┐  ┌───▼──────┐        │         ┌────▼──────┐
     │        │  AWS S3   │  │  Order/  │        │         │ Chatbot   │
     │        │ (images)  │  │ Payment  │        │         │ :8085     │
     │        └───────────┘  │ Service  │        │         │ (Gemini)  │
     │                       └──────────┘        │         └───────────┘
     │                                           │
     └──────────────────┬────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │   PostgreSQL 15    │
              │  (single instance, │
              │ multiple schemas)  │
              └────────────────────┘

INFRASTRUCTURE LAYER
┌──────────────────┐   ┌──────────────────┐
│  Service Discovery│   │  Config Server   │
│  (Eureka) :8761  │   │  (Spring Cloud)  │
│                  │   │     :8888        │
└──────────────────┘   └──────────────────┘
     ↑ All services register and query here
```

### 1.2 Inter-Service Communication

Services communicate through two mechanisms:

1. **Synchronous REST calls:** The Auction Service uses a `RestTemplate` (configured with Eureka-aware load balancing) to call the Order/Payment Service when an auction concludes. The Product Catalog Service delegates crop recommendation requests to the Python Flask service.
2. **API Gateway routing:** The gateway maps path prefixes to logical service names registered in Eureka (e.g., `/auth/**` → `identity-service`, `/api/auctions/**` → `auction-service`). Timeout values are set to 30 seconds (response) and 5 seconds (connection).

### 1.3 Key Technologies

| Layer | Technology | Version / Note |
|---|---|---|
| Service registry | Netflix Eureka (Spring Cloud) | `spring-cloud-starter-netflix-eureka-*` |
| API gateway | Spring Cloud Gateway | Reactive, path-based routing |
| Centralised config | Spring Cloud Config Server | `native` profile; reads from classpath |
| Backend framework | Spring Boot | 3.3.5 (most); 4.0.1 (chat); 4.0.2 (moderation) |
| ORM / persistence | Spring Data JPA + Hibernate | Automatic DDL (`update`) |
| Relational database | PostgreSQL 15 | Single instance; multiple schemas |
| Security | Spring Security + JWT (HMAC-SHA256) | Stateless; BCrypt password hashing |
| File storage | AWS S3 SDK v2 | Presigned PUT URLs (10-min expiry) |
| Payments | Stripe Java SDK | Checkout sessions + webhook verification |
| Real-time messaging | WebSocket, STOMP, SockJS | AES-encrypted message content |
| AI chatbot | Google Gemini API | Stateless; `google-generativeai` library |
| ML recommendation | Python Flask, scikit-learn | `model.pkl`, `minmaxscaler.pkl` |
| Containerisation | Docker + Docker Compose | Multi-stage builds |
| Frontend framework | Next.js 16 (App Router) | React 19, TypeScript 5 |
| Frontend styling | Tailwind CSS 4 + Radix UI | `cn()` utility via `clsx`/`tailwind-merge` |
| Email (SMTP) | JavaMailSender (Gmail SMTP) | OTP delivery; STARTTLS on port 587 |

---

## 2. Backend Implementation (Java / Spring Boot Microservices)

### 2.1 Microservice Responsibilities

| Service | Package Root | Primary Responsibility |
|---|---|---|
| `identityAndUser-service` | `com.identityanduser` | User registration/login, JWT issuance and validation, password recovery via email OTP, admin management |
| `productCatalog-service` | `com.productcatalog` | Product CRUD, multi-image uploads via AWS S3 presigned URLs, vegetable catalogue, crop recommendation proxy |
| `auction-service` | `com.auction` | Auction creation and lifecycle (DRAFT → ACTIVE → COMPLETED/CANCELLED), real-time bidding, scheduled status transitions, optimistic locking |
| `orderPayment-service` | `com.orderpayment` | Shopping cart, Stripe-based and cash-on-delivery (COD) checkout, order status tracking, bargaining, buyer requirements, seller notifications, order reviews |
| `chat-service` | `com.agrochat` | Persistent one-to-one messaging over WebSocket/STOMP, message read receipts, soft-delete, AES content encryption |
| `moderation-service` | `com.moderation` | User and product report submission, risk classification, admin review |
| `chatbot-service` | `com.chatbot` | Stateless AI response generation via Google Gemini API |
| `crop-recommendation-service` | `app.py` (Flask) | RandomForest crop prediction from soil/climate sensor inputs |
| `service-discovery` | `com.servicediscovery` | Eureka server; registers all other services |
| `config-server` | `com.configserver` | Distributes `application.properties` to services; `native` profile reads files from classpath |
| `api-gateway` | `com.apigateway` | Single ingress point; reactive routing; CORS; circuit-breaker-ready |

### 2.2 Module / Folder Structure

Every Java microservice follows the standard Maven project layout and a consistent internal package structure:

```
<service-name>/
├── pom.xml                          # Maven build descriptor
├── Dockerfile                       # Multi-stage container image
└── src/main/
    ├── java/com/<package>/
    │   ├── <Service>Application.java  # @SpringBootApplication entry point
    │   ├── controller/               # @RestController classes (HTTP handlers)
    │   ├── service/                  # @Service classes (business logic)
    │   ├── repository/               # @Repository interfaces (JpaRepository)
    │   ├── model/                    # @Entity JPA classes
    │   ├── dto/                      # Request/Response DTO records and classes
    │   ├── config/                   # @Configuration (Security, WebSocket, AWS, etc.)
    │   └── exception/                # Custom @ResponseStatus exceptions
    └── resources/
        └── application.properties   # Service-specific configuration
```

The Python `crop-recommendation-service` has a simpler structure:

```
crop-recommendation-service/
├── app.py           # Flask application and route definitions
├── model.pkl        # Trained RandomForest model
├── minmaxscaler.pkl # Min-max feature scaler
└── standscaler.pkl  # Standard scaler
```

### 2.3 API Design: Key REST Endpoints

#### 2.3.1 Identity and User Service (`/auth`, `/api/admin`, `/forgotPassword`)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/auth/register` | POST | Register a new Buyer or Farmer account | Public |
| `/auth/login` | POST | Authenticate and receive a JWT | Public |
| `/auth/logout` | POST | Invalidate session (stateless; clears client token) | Public |
| `/auth/validate` | GET | Validate a JWT; used by services for token verification | Public |
| `/auth/me` | GET | Retrieve the currently authenticated user's profile | Authenticated |
| `/auth/profile/update` | PUT | Update name, address, phone, avatar, and business details | Authenticated |
| `/auth/user/{id}` | GET | Fetch a user record by ID (inter-service use) | Public |
| `/auth/fullnames` | GET | Bulk-fetch full names by a list of user IDs | Public |
| `/auth/check-email` | GET | Check whether an email is already registered | Public |
| `/auth/count` | GET | Total registered user count | Public |
| `/auth/count/farmers` | GET | Count of registered Farmer accounts | Public |
| `/auth/count/buyers` | GET | Count of registered Buyer accounts | Public |
| `/auth/total-users` | GET | Alias for total user count | Public |
| `/api/admin/register` | POST | Create an Admin account | Public |
| `/api/admin/login` | POST | Authenticate as Admin | Public |
| `/forgotPassword/verifyMail/{email}` | POST | Send OTP to the registered email address | Public |
| `/forgotPassword/verifyOtp/{otp}/{email}` | POST | Validate the OTP against the stored hash | Public |
| `/forgotPassword/changePassword/{email}` | POST | Reset the password after OTP verification | Public |

#### 2.3.2 Product Catalog Service (`/products`, `/api/crop`, `/api/usersProducts`)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/products` | GET | Retrieve all active product listings | Public |
| `/products/farmer/{farmerId}` | GET | List all products belonging to a farmer | Public |
| `/products/{id}` | GET | Retrieve a single product by ID | Public |
| `/products` | POST | Create a new product listing | Farmer |
| `/products/{id}` | PUT | Update a product listing | Farmer |
| `/products/{id}` | DELETE | Remove a product listing | Farmer |
| `/products/presigned-url` | GET | Generate an AWS S3 presigned PUT URL for image upload | Authenticated |
| `/api/crop/recommend` | POST | Submit soil and climate parameters to receive a crop recommendation | Authenticated |
| `/api/usersProducts/{id}/address` | GET | Retrieve a farmer's pickup address by user ID | Authenticated |

#### 2.3.3 Auction Service (`/api/auctions`)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/api/auctions` | POST | Create a new auction in DRAFT status | Farmer |
| `/api/auctions/active` | GET | List all currently ACTIVE auctions | Public |
| `/api/auctions/{id}` | GET | Retrieve auction details including current bids | Public |
| `/api/auctions/farmer/{farmerId}` | GET | List all auctions created by a farmer | Farmer |
| `/api/auctions/buyer/{buyerId}` | GET | List all auctions where the buyer has placed a bid | Buyer |
| `/api/auctions/{id}/start-now` | POST | Manually activate a DRAFT auction immediately | Farmer |
| `/api/auctions/{id}/cancel` | POST | Cancel an auction | Farmer |
| `/api/auctions/{id}/end-early` | POST | Close an active auction before the scheduled end time | Farmer |
| `/api/auctions/{id}/bids` | POST | Place a bid on an active auction | Buyer |

#### 2.3.4 Order and Payment Service (`/api/buyer/orders`, `/api/seller/orders`, `/cart`, `/api/payment`, `/api/bargains`, `/api/requirements`, `/api/reviews`)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/cart/add` | POST | Add an item to the shopping cart | Buyer |
| `/cart/{userId}` | GET | Retrieve all cart items for a user | Buyer |
| `/cart/delete/{id}` | DELETE | Remove a single cart item | Buyer |
| `/cart/user/{userId}` | DELETE | Clear an entire cart | Buyer |
| `/api/payment/create-checkout-session` | POST | Initiate a Stripe checkout session | Buyer |
| `/api/payment/cod` | POST | Place a cash-on-delivery order | Buyer |
| `/api/webhook` | POST | Receive and process Stripe payment events | Stripe (unsigned) |
| `/api/buyer/orders/{userId}` | GET | Retrieve order history for a buyer | Buyer |
| `/api/buyer/orders/create` | POST | Create an order record (used internally post-payment) | Buyer |
| `/api/buyer/orders/notifications/{buyerId}` | GET | Retrieve cancellation notifications for a buyer | Buyer |
| `/api/buyer/orders/notifications/{id}/read` | PUT | Mark a notification as read | Buyer |
| `/api/seller/orders` | GET | Retrieve all orders assigned to the authenticated seller | Farmer |
| `/api/seller/orders/{sellerId}` | GET | Retrieve orders by seller ID | Farmer |
| `/api/orders` | POST | Create an auction-derived order after auction completion | Internal / Auction Service |
| `/api/bargains` | POST | Submit a price bargain offer for a product | Buyer |
| `/api/bargains/{bargainId}` | GET | Retrieve bargain details | Authenticated |
| `/api/bargains/{bargainId}/accept` | PUT | Accept a bargain offer | Farmer |
| `/api/bargains/{bargainId}/reject` | PUT | Reject a bargain offer | Farmer |
| `/api/requirements/create` | POST | Post a crop purchase requirement | Buyer |
| `/api/requirements/buyer/{buyerId}` | GET | List requirements posted by a buyer | Buyer |
| `/api/requirements/{id}` | GET | Retrieve a specific requirement | Authenticated |
| `/api/requirements/{id}` | PUT | Update a requirement | Buyer |
| `/api/requirements/{id}` | DELETE | Delete a requirement | Buyer |
| `/api/requirements/status/{status}` | GET | List requirements filtered by status | Authenticated |
| `/api/reviews` | POST | Submit a post-delivery review | Buyer |
| `/api/reviews/order/{orderId}` | GET | Retrieve the review for a specific order | Authenticated |

#### 2.3.5 Chat Service (`/api/chat` + WebSocket)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/api/chat/contacts` | GET | List all users with whom the current user has a conversation | Authenticated |
| `/api/chat/history/{recipientId}` | GET | Retrieve message history with a specific contact | Authenticated |
| `/api/chat/conversation/{contactId}` | DELETE | Soft-delete (hide) a conversation | Authenticated |
| `/api/chat/read/{senderId}/{recipientId}` | PUT | Mark all messages from a sender as read | Authenticated |
| `/api/chat/unread-count/{senderId}` | GET | Count unread messages from a sender | Authenticated |
| `/api/chat/total-unread` | GET | Count total unread messages for the current user | Authenticated |
| `/api/chat/status/{userId}` | GET | Retrieve a user's online/offline status | Authenticated |
| `WS /ws` (STOMP `/app/sendMessage`) | WebSocket | Send a real-time chat message | Authenticated (JWT header) |

#### 2.3.6 Moderation Service (`/api/v1/moderation`)

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/api/v1/moderation/user/report` | POST | Submit a report against a user | Authenticated |
| `/api/v1/moderation/user/my-reports/{userId}` | GET | List all reports submitted by a user | Authenticated |
| `/api/v1/moderation/report` | POST | Submit a product or transaction report | Authenticated |
| `/api/v1/moderation/all` | GET | Retrieve all reports (admin review dashboard) | Admin |
| `/api/v1/moderation/issues` | GET | List all available issue type options | Authenticated |

#### 2.3.7 Chatbot and Crop Recommendation Services

| Endpoint | Method | Purpose | Auth / Role |
|---|---|---|---|
| `/api/chatbot/chat` | POST | Send a user message and receive an AI-generated agricultural support response | Authenticated |
| `/api/crop/recommend` | POST | Submit soil and weather parameters and receive a recommended crop | Authenticated |

### 2.4 Authentication and Authorisation

AgroLink uses **stateless JWT-based authentication** implemented in the `identityAndUser-service` and replicated as a filter in each service that requires access control.

#### Token Issuance

The `JwtService` class issues tokens upon successful login:

- **Algorithm:** HMAC-SHA256 (`HS256`)
- **Secret:** Injected via the `${JWT_KEY}` environment variable
- **Expiry:** 10 hours from issuance
- **Claims embedded:** `role` (e.g., `"Farmer"`), `userId` (the user's numeric database ID), `sub` (email address)

#### Token Validation Filter

Every protected service includes a `JwtAuthenticationFilter` that extends `OncePerRequestFilter`:

1. Extracts the `Authorization: Bearer <token>` header.
2. Validates the token's signature using the shared secret.
3. Extracts the `email`, `role`, and `userId` claims.
4. Stores `userId` in the `HttpServletRequest` attribute (`request.setAttribute("userId", userId)`) for downstream use in controllers.
5. Populates the Spring `SecurityContextHolder` with a fully authenticated `UsernamePasswordAuthenticationToken`.

#### Security Configuration (`SecurityConfig.java`)

Each service declares a `SecurityConfig` that:

- Disables CSRF (stateless architecture).
- Sets session management to `SessionCreationPolicy.STATELESS`.
- Registers the `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`.
- Declares public endpoints (e.g., `/auth/register`, `/auth/login`, `/auth/validate`) that bypass the filter.

#### Roles

The `Role` enumeration (defined in `identityAndUser-service`) has three values:

| Role | Description |
|---|---|
| `Buyer` | Can browse, cart, order, bid, bargain, post requirements, review, and chat |
| `Farmer` | Can create product listings, run auctions, fulfil orders, and chat |
| `Admin` | Can view all reports, manage users, and access the administrative dashboard |

#### Password Security

All passwords are hashed with **BCrypt** (`BCryptPasswordEncoder`), producing `$2a$` format hashes. Plain-text passwords are never stored.

#### Password Recovery

The `ForgotPassword` entity stores a one-time passcode (OTP) and its expiry timestamp. The flow is: (1) request OTP via email, (2) verify OTP, (3) submit new password. The OTP email is sent using `JavaMailSender` over Gmail SMTP with STARTTLS.

### 2.5 Database Design

AgroLink uses a single **PostgreSQL 15** instance with schema isolation per service. The `postgres-init/` directory contains initialisation SQL scripts executed at container start. Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update`, which automatically creates or updates tables based on entity mappings.

#### 2.5.1 Schema Allocation

| Service | Schema |
|---|---|
| `identityAndUser-service` | `public` (default) |
| `productCatalog-service` | `public` (default) |
| `auction-service` | `public` (default) |
| `orderPayment-service` | `public` (default) |
| `chat-service` | `chat_schema` |
| `moderation-service` | `moderation_schema` |

#### 2.5.2 Entity–Relationship Overview

The following describes the key entities and their relationships across all services:

**User Domain (`identityAndUser-service`)**

- `users` — Stores all registered users. Fields include: `id` (PK), `fullname`, `email` (unique), `phone`, `password` (BCrypt), `address`, `district`, `zipcode`, `province`, `city`, `businessName` (farmers only), `nic` (National ID), `avatarUrl`, `latitude`, `longitude`, and `role` (enum: `Buyer`, `Farmer`, `Admin`).
- `forgot_password` — Linked to `users` via a `@OneToOne` relationship. Stores `otp` and `expiryTime` for the password-reset flow.
- `admin` — Separate entity for administrators with `email`, `password`, and `adminRole`.

**Product Domain (`productCatalog-service`)**

- `products` — Core listing entity. Fields include: `id`, `farmerId`, `vegetableName`, `category`, `quantity`, `pricingType` (enum: `FIXED`, `BIDDING`), `fixedPrice`, `biddingPrice`, `biddingStartDate`, `biddingEndDate`, `description`, `deliveryAvailable`, `deliveryFeeFirst3Km`, `deliveryFeePerKm`, `pickupAddress`, `pickupLatitude`, `pickupLongitude`.
- `product_images` — Associated with `products` via a `@ManyToOne` relationship. Stores `imageUrl` and `uploadedAt`.
- `vegetables` — Reference table for vegetable types. Fields: `id`, `name`, `description`, `healthBenefits`.

**Auction Domain (`auction-service`)**

- `auctions` — Entity with optimistic locking (`@Version`). Fields include: `id`, `farmerId`, `farmerName`, `productId`, `productName`, `productQuantity`, `productImageUrl`, `description`, `status` (enum: `DRAFT`, `ACTIVE`, `COMPLETED`, `CANCELLED`), `startTime`, `endTime`, `reservePrice`, `startingPrice`, `currentHighestBidAmount`, `highestBidderId`, `winningBidId`, `isDeliveryAvailable`, `baseDeliveryFee`, `extraFeePer3Km`, `pickupAddress`, `isOrderCreated`, `createdAt`, `updatedAt`.
- `bids` — Associated with `auctions` via `@ManyToOne`. Fields: `id`, `bidderId`, `bidderName`, `bidderEmail`, `bidAmount` (BigDecimal precision 10,2), `bidTime`, `deliveryAddress` (embedded).

**Order and Payment Domain (`orderPayment-service`)**

- `shop_orders` — Central order table. Fields: `id`, `userId`, `stripeId` (unique), `amount` (integer cents), `currency`, `customerEmail`, `customerName`, `itemsJson` (TEXT, serialised line items), `status` (enum: `CREATED`, `PAID`, `COD_CONFIRMED`, `DELIVERED`, `CANCELLED`), `createdAt`, `sellerId`, `otp`.
- `order_reviews` — `@OneToOne` with `shop_orders`. Fields: `rating`, `comment`, `createdAt`.
- `cart_items` — Fields: `id`, `userId`, `productId`, `quantity`, `addedAt`.
- `bargains` — Fields: `id`, `productId`, `buyerId`, `sellerId`, `proposedPrice`, `status` (enum: `PENDING`, `ACCEPTED`, `REJECTED`), `createdAt`, `respondedAt`.
- `requirements` — Buyer crop demand postings. Fields: `id`, `buyerId`, `productType`, `quantity`, `budget`, `location`, `deadline`, `status` (enum: `OPEN`, `CLOSED`, `FULFILLED`), `createdAt`.
- `buyer_offers` — Farmer responses to requirements. Fields: `id`, `requirementId`, `farmerId`, `offerPrice`, `message`, `createdAt`.
- `notifications` — Seller notifications for new orders. Fields: `id`, `userId` (seller), `message`, `isRead`, `createdAt`.
- `cancelled_orders` — Audit record for cancellations. Fields: `id`, `orderId`, `reason`, `cancelledAt`.
- `cancelled_order_notifications` — Buyer-facing cancellation alerts. Fields: `id`, `buyerId`, `orderId`, `message`, `isRead`, `createdAt`.

**Chat Domain (`chat-service`, schema: `chat_schema`)**

- `chat_messages` — Stores encrypted messages. Fields: `id`, `senderId`, `recipientId`, `content` (AES-encrypted), `timestamp` (auto-set by `@PrePersist`), `isRead`, `deletedBySender`, `deletedByRecipient`.

**Moderation Domain (`moderation-service`, schema: `moderation_schema`)**

- `user_reports` — Fields: `id`, `reporterId`, `reportedUserId`, `issueType` (enum: `FAKE_OR_MISLEADING_PRODUCE`, `INCORRECT_WEIGHT_OR_QUANTITY`, `UNFAIR_PRICE_MANIPULATION`, `HARASSMENT_OR_ABUSE`, `FRAUD`, and others), `description`, `severity` (enum: `LOW`, `MEDIUM`, `HIGH`), `resolved`, `createdAt`, `resolvedAt`.

### 2.6 Error Handling, Validation, Logging, and Configuration Management

#### Error Handling

Each service defines domain-specific exception classes (e.g., `ResourceNotFoundException`, `InvalidTokenException`) annotated with `@ResponseStatus` to return appropriate HTTP status codes. Spring Boot's default `BasicErrorController` handles uncaught exceptions by returning a structured JSON error body. The API Gateway applies a default 30-second response timeout, after which a 504 Gateway Timeout is returned to the client.

#### Validation

Request body validation uses Jakarta Bean Validation annotations (e.g., `@NotNull`, `@Email`, `@Size`) on DTO fields. Violations are surfaced as `400 Bad Request` responses with a field-level error map.

#### Logging

All services inherit Spring Boot's default SLF4J + Logback logging. Log levels follow the standard Spring Boot default (`INFO` for application classes, `WARN` for framework). Application-level events (e.g., failed payment, auction state transition) are recorded using `Logger` instances. No external log aggregator was detected in the repository at the time of this writing.

#### Configuration Management

Configuration is centralised in the **Spring Cloud Config Server** (port 8888). Each service declares `spring.application.name` in its `application.properties`, and the Config Server resolves the matching configuration file at startup. Sensitive values (database credentials, API keys, JWT secret) are never hard-coded; instead, they are injected from the Docker Compose `env_file: .env` mechanism into container environment variables, which Spring Boot reads via `${ENV_VAR_NAME}` placeholders. Key environment variables are listed below:

| Variable | Used By | Purpose |
|---|---|---|
| `JWT_KEY` | All services | HMAC secret for JWT signing and verification |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | All data services | PostgreSQL connection parameters |
| `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | `identityAndUser-service` | Gmail SMTP credentials for OTP emails |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` | `productCatalog-service` | AWS S3 file storage |
| `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | `orderPayment-service` | Stripe payment processing |
| `GEMINI_API_KEY` | `chatbot-service` | Google Gemini AI API |
| `CHAT_AES_KEY` | `chat-service` | AES symmetric key for message encryption |
| `secret_key` | `orderPayment-service` | Secondary signing secret |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend gateway base URL |
| `NEXT_PUBLIC_CHAT_URL` | Frontend | Chat service WebSocket URL |
| `NEXT_PUBLIC_S3_HOSTNAME` | Frontend | S3 hostname for `next/image` remote patterns |

### 2.7 Special Features in Coding

#### 2.7.1 Optimistic Locking (Auction Service)

The `Auction` entity uses JPA's `@Version` annotation to prevent concurrent bid conflicts. If two buyers attempt to update the same auction row simultaneously, Hibernate detects the version mismatch and throws an `OptimisticLockException`, which is handled gracefully to return a conflict response.

#### 2.7.2 Scheduled Tasks

Two services use Spring's `@Scheduled` annotation for background processing:

- **`AuctionScheduler`** (auction-service): Runs every 60 seconds. It (a) activates DRAFT auctions whose `startTime` has been reached, (b) marks ACTIVE auctions as COMPLETED when `endTime` passes and identifies the winning bid, and (c) retries failed order-creation calls to the Order/Payment Service to guarantee eventual consistency.
- **`RequirementCleanupService`** (orderPayment-service): Runs every hour. Removes CLOSED requirements older than 30 days to manage database growth.

#### 2.7.3 File Upload via AWS S3 Presigned URLs

Product image uploads follow a two-step pattern that offloads bandwidth from the backend:

1. The frontend calls `GET /products/presigned-url?fileName=&contentType=` to obtain a time-limited (10-minute) presigned PUT URL from `S3Service`.
2. `S3Service` generates a unique filename using `UUID.randomUUID()` prefixed to the original filename and produces the presigned URL using AWS SDK v2 (`S3Presigner`).
3. The frontend uploads the binary file directly to S3 using the presigned URL.
4. The public object URL is then stored in the `product_images` table.

#### 2.7.4 WebSocket Messaging and Encryption

The Chat Service configures a STOMP message broker with the following endpoints:

- HTTP upgrade: `/ws` (SockJS fallback enabled)
- Application destination prefix: `/app`
- Broker destinations: `/topic`, `/queue`, `/user`

A `UserInterceptor` extracts and validates the JWT from the WebSocket connection handshake headers, establishing user identity in the STOMP session. Chat message content is encrypted with AES before persistence and decrypted upon retrieval, using a symmetric key stored in `${CHAT_AES_KEY}`.

#### 2.7.5 Stripe Payment Integration

The `PaymentService` class creates a Stripe Checkout Session containing line items derived from the buyer's cart. Upon successful payment, Stripe sends a webhook `POST` to `/api/webhook`. The `StripeWebhookController` verifies the event signature using `${STRIPE_WEBHOOK_SECRET}`, then updates the `shop_orders` record to `PAID` status and triggers seller notifications. Cash-on-delivery orders bypass Stripe and are recorded immediately with `COD_CONFIRMED` status.

#### 2.7.6 Email OTP Service

The `EmailService` (identityAndUser-service) uses Spring's `JavaMailSender` to send HTML-formatted OTP emails via Gmail SMTP (port 587, STARTTLS). The generated OTP is stored in the `forgot_password` table with a configurable expiry timestamp.

#### 2.7.7 AI Crop Recommendation

The `crop-recommendation-service` (Python Flask) loads a serialised `RandomForest` model and `MinMaxScaler` from disk at startup. On each `POST /api/crop/recommend` request, it scales the input features and returns the predicted crop label. The Java Product Catalog Service proxies the request from `/api/crop/recommend` to the Python service URL.

#### 2.7.8 Transactional Integrity

Critical operations — order creation, payment confirmation, auction completion, cart clearance — are annotated with `@Transactional` to ensure atomicity. If any step in a multi-table write operation fails, the transaction is rolled back, preventing partial writes.

#### 2.7.9 Inter-Service Resilience (Auction → Order)

The `OrderIntegrationService` in the Auction Service wraps outbound order-creation calls in a try-catch block. If the Order/Payment Service is temporarily unavailable, the auction is flagged (`isOrderCreated = false`). The `AuctionScheduler` retries unflagged completed auctions every 60 seconds until the order is successfully created.

---

## 3. Frontend Implementation (TypeScript)

### 3.1 Application Structure

The frontend is a Next.js 16 application using the **App Router** paradigm. All pages live inside the `app/` directory, following Next.js file-system routing conventions.

```
frontend/
├── app/
│   ├── layout.tsx               # Root layout (global fonts, providers)
│   ├── page.tsx                 # Public home / landing page
│   ├── login/                   # Login page (delegates to LoginPage component)
│   ├── register/                # Multi-step user registration
│   ├── forgot-password/         # OTP-based password recovery
│   ├── about/                   # Platform overview page
│   ├── features/                # Feature showcase page
│   ├── VegetableList/           # Public product browsing
│   ├── crop/                    # Crop recommendation tool
│   ├── cart/                    # Shopping cart
│   │
│   ├── buyer/                   # Buyer-role pages (protected)
│   │   ├── dashboard/           # Buyer dashboard
│   │   ├── bids/                # Auction bid history
│   │   ├── bargain/             # Active bargain management
│   │   ├── bargain-history/     # Past bargain records
│   │   ├── chat/                # Messaging interface
│   │   ├── checkout/            # Order checkout
│   │   ├── order-history/       # Past orders
│   │   ├── order-success/       # Post-payment confirmation
│   │   ├── pending-orders/      # Orders awaiting fulfilment
│   │   ├── requests/            # Crop requirement management
│   │   └── user-profile/        # Buyer profile settings
│   │
│   ├── seller/                  # Farmer/Seller-role pages (protected)
│   │   ├── dashboard/           # Seller dashboard
│   │   ├── auctions/            # Auction management
│   │   ├── bargains/            # Incoming bargain offers
│   │   ├── chat/                # Messaging interface
│   │   ├── item-requests/       # Buyer crop requirements
│   │   ├── my-products/         # Product listing management
│   │   ├── orders/              # Order fulfilment
│   │   └── user-profile/        # Seller profile settings
│   │
│   ├── admin/                   # Admin-role pages (protected)
│   │   ├── login/               # Admin login
│   │   └── dashboard/           # Admin control panel
│   │
│   ├── chat/                    # Shared chat page
│   └── user-profile/            # Shared profile page
│
├── components/
│   ├── ui/                      # Radix UI primitive wrappers (30+ components)
│   ├── login-form.tsx           # Login form with validation and redirect logic
│   ├── login-page.tsx           # Login page layout
│   ├── vegetable-form.tsx       # Product creation / edit form
│   ├── auction-bid-popup.tsx    # Bid placement modal
│   ├── auction-details-modal.tsx# Auction detail overlay
│   ├── auction-card.tsx         # Auction list item card
│   ├── checkout-page.tsx        # Checkout flow component
│   ├── order-card.tsx           # Order summary card
│   ├── cart-item.tsx            # Cart line item
│   ├── cart-summary.tsx         # Cart totals and actions
│   ├── product-card.tsx         # Product listing card
│   ├── admin-sidebar.tsx        # Admin navigation sidebar
│   ├── admin-dashboard.tsx      # Admin overview component
│   ├── dashboard-header.tsx     # Authenticated user header
│   ├── sidebar.tsx              # General navigation sidebar
│   ├── ChatbotWidget.tsx        # Floating AI chat assistant
│   ├── protected-route.tsx      # HOC for role-based route protection
│   ├── LocationPicker.tsx       # Map-based location picker
│   ├── LocationPickerMap.tsx    # Leaflet map wrapper
│   └── role-select.tsx          # Role selection during registration
│
├── hooks/
│   ├── use-mobile.ts            # Responsive viewport detection
│   └── use-toast.ts             # Toast notification hook
│
├── lib/
│   ├── utils.ts                 # `cn()` Tailwind class utility
│   └── geo-utils.ts             # Distance calculation utilities
│
├── data/                        # Static data files
├── styles/                      # Additional CSS modules
├── next.config.ts               # Next.js configuration (rewrites, image domains)
├── tailwind.config.ts           # Tailwind CSS customisation
└── tsconfig.json                # TypeScript compiler options
```

### 3.2 Routing

Next.js App Router uses the file system for routing. Segments under `app/buyer/`, `app/seller/`, and `app/admin/` are logically restricted by role. The `protected-route.tsx` component enforces role checks by reading the `userRole` value stored in `sessionStorage`; users without the correct role are redirected to the login page.

Route rewrites in `next.config.ts` transparently proxy all `/api/**` and `/auth/**` requests to the API Gateway:

```typescript
async rewrites() {
    return [
        { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` },
        { source: '/auth/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/auth/:path*` },
    ];
}
```

This means the frontend can call `/api/payment/cod` and Next.js will forward the request to `http://localhost:8080/api/payment/cod` during development, avoiding cross-origin issues.

### 3.3 Backend API Integration

#### HTTP Client

Page components make API calls using the browser's native `fetch` API as well as `axios` for more complex request scenarios. Both are used throughout the codebase.

#### Token Storage and Injection

Upon successful login, the `login-form.tsx` component stores the following values in the browser's `sessionStorage`:

| Key | Value |
|---|---|
| `token` | The raw JWT string |
| `userRole` | The user's role (e.g., `"Farmer"`) |
| `userEmail` | The authenticated user's email |
| `id` | The user's numeric database ID |

Every subsequent authenticated API call reads the token and appends it as a bearer header:

```typescript
const token = sessionStorage.getItem("token");
fetch("/api/buyer/orders/" + userId, {
    headers: { "Authorization": `Bearer ${token}` }
});
```

#### Error Handling

API call failures are caught in `try/catch` blocks. Error messages from the response body are surfaced to the user via `sonner` toast notifications (e.g., `toast.error("Failed to load orders")`). Loading states are managed with local `useState` boolean flags (`isLoading`, `isFetching`), which toggle skeleton loaders or spinner elements.

### 3.4 Forms and Validation

Forms are implemented as controlled React components with local `useState` hooks. The product creation form (`vegetable-form.tsx`) validates fields before submission (e.g., required fields, numeric range checks for price). The multi-step registration form (`app/register/`) persists intermediate step data in `sessionStorage` under the key `registerDataStep1` to survive navigation between steps.

UX patterns include:

- **Toast notifications** (`sonner`): Used for success, error, and info feedback throughout the application.
- **Modals / Dialogs**: Radix UI `Dialog` components are used for bid placement, auction details, and confirmation prompts.
- **Loading states**: Boolean state variables toggle spinner icons or skeleton placeholders during data fetching.
- **Confirmation dialogs**: Destructive actions (e.g., cancelling an auction, deleting a product) display a Radix UI `AlertDialog` requiring explicit confirmation.

### 3.5 Special Frontend Features

#### 3.5.1 Role-Based Route Protection

The `protected-route.tsx` component wraps page content. It reads `userRole` from `sessionStorage` and compares it against the required role prop. If the check fails, the user is immediately redirected to `/login`. Admin pages additionally verify the `adminToken` key.

#### 3.5.2 Real-Time WebSocket Chat

The chat interface (`app/buyer/chat/`, `app/seller/chat/`) connects directly to the Chat Service WebSocket endpoint (`${NEXT_PUBLIC_CHAT_URL}/ws`) using `sockjs-client` for transport and `@stomp/stompjs` for messaging protocol. The JWT token is passed in the STOMP connection headers. Messages are received on subscription channel `/user/{userId}/queue/messages` and sent to `/app/sendMessage`.

#### 3.5.3 Map Integration

The `LocationPicker.tsx` and `LocationPickerMap.tsx` components use `react-leaflet` and `leaflet` to render an interactive map. Farmers can drag a map marker to set the pickup coordinates for their product listings. Distance calculations between buyer and seller are performed in `lib/geo-utils.ts` using the Haversine formula, enabling delivery fee estimation.

#### 3.5.4 AI Chatbot Widget

The `ChatbotWidget.tsx` component renders a floating chat bubble on every authenticated page. On user input, it posts to `/api/chatbot/chat` and renders the Gemini API response using `react-markdown`, which supports formatted agricultural advice with headings and lists.

#### 3.5.5 Auction Bidding Interface

The `auction-bid-popup.tsx` component displays real-time bid information (current highest bid, reserve price, remaining time) and contains a validated input form for placing a new bid. It is rendered as a Radix UI Dialog overlay on the auction listing page.

#### 3.5.6 Reusable UI Components

All Radix UI primitives (button, card, dialog, select, tooltip, badge, accordion, etc.) are wrapped and re-exported from `components/ui/` with consistent Tailwind-based styling, allowing every page to consume them uniformly.

---

## 4. User Interface Design (Optimised for System Users)

### 4.1 Identified User Roles

The system serves three distinct user roles, each with dedicated navigational flows:

| Role | Entry Path | Dashboard | Primary Capabilities |
|---|---|---|---|
| **Buyer** | `/login` → `/buyer/dashboard` | Buyer overview | Browse products, cart, checkout, auctions, bargaining, requirements, order tracking, messaging |
| **Farmer (Seller)** | `/login` → `/seller/dashboard` | Seller overview | Product management, auction control, order fulfilment, bargain responses, item request review, messaging |
| **Admin** | `/admin/login` → `/admin/dashboard` | Admin control panel | User management, moderation, platform statistics |

### 4.2 Role Workflows and UI Screens

#### 4.2.1 Buyer Workflows

**Product Discovery and Purchase**

1. The buyer lands on the public home page or navigates to the product listing (`/VegetableList`).
2. Product cards (`product-card.tsx`) display the vegetable image, name, price, availability, and farmer location on a map.
3. The buyer adds items to the cart (`/cart`), where `cart-item.tsx` displays the quantity selector and line total. `cart-summary.tsx` shows the overall total and checkout button.
4. Checkout (`/buyer/checkout`) offers two payment paths: Stripe online payment (redirects to Stripe-hosted page) and Cash on Delivery (COD). On success, the buyer is redirected to `/buyer/order-success`.
5. Order history is accessible at `/buyer/order-history` via `order-history-client.tsx` in a sortable card list.

**Auction Participation**

1. Active auctions are listed on the buyer dashboard or the public auction feed.
2. The `auction-card.tsx` shows the product image, current bid, reserve price, and countdown timer.
3. Clicking an auction opens `auction-details-modal.tsx`, which displays full auction details and allows the buyer to enter a bid amount in the `auction-bid-popup.tsx` dialog.
4. Won auction orders appear in the buyer's order history.

**Bargaining**

1. From a product listing, the buyer can submit a counter-price using the bargain form.
2. The `/buyer/bargain` page lists active bargain negotiations, and `/buyer/bargain-history` shows concluded ones.
3. The `horizontal-bargain-card.tsx` component displays status badges (`PENDING`, `ACCEPTED`, `REJECTED`) with colour coding for quick scanning.

**Crop Requirements**

1. Buyers post specific crop demands at `/buyer/requests/new-request`.
2. The requirements list at `/buyer/requests` displays all open and closed requirements. Farmer offer responses are shown inline.

**Direct Messaging**

1. A buyer can initiate a conversation from any product card or navigate to `/buyer/chat`.
2. The chat interface renders a contact list on the left and the message thread on the right, with unread counts displayed as notification badges.

#### 4.2.2 Farmer (Seller) Workflows

**Product Management**

1. The seller's `/seller/my-products` page lists all product cards with edit and delete actions.
2. The `vegetable-form.tsx` component handles both creation and editing: it includes validated fields for name, category, pricing type (fixed or bidding), quantity, delivery options, and multi-image upload via S3 presigned URLs.
3. The `LocationPickerMap.tsx` allows the farmer to pin the exact pickup location on a Leaflet map.

**Auction Management**

1. The `/seller/auctions` page lists all auctions with their current status.
2. The farmer can create a new auction, set start/end times, starting price, and reserve price.
3. Actions available per auction: start immediately, cancel, end early, or view bids.

**Order Fulfilment**

1. `/seller/orders` lists incoming orders grouped by status with quick-action buttons.
2. The seller receives in-app notifications (notification badge on the header) when a new order is placed.
3. Order cards show buyer details, item list, delivery/pickup preference, and OTP for COD verification.

**Bargain and Item Request Handling**

1. `/seller/bargains` shows incoming counter-price offers with accept/reject buttons.
2. `/seller/item-requests` lists buyer crop requirements where the farmer can submit offers.

#### 4.2.3 Admin Workflows

**Platform Statistics**

1. The `/admin/dashboard` renders the `admin-dashboard.tsx` component, which fetches aggregate user, farmer, and buyer counts from the Identity Service and displays them in `statistics-cards.tsx` stat cards.

**User Management**

1. The `user-management.tsx` and `user-management-section.tsx` components provide a searchable data table of all registered users.
2. Admins can view user details and take moderation actions.

**Report Management**

1. The `reports-section.tsx` component displays all moderation reports submitted via the Moderation Service, filterable by risk level and issue type.

### 4.3 Design Choices that Optimise User Experience

**Navigation:** Each role has a dedicated sidebar (`admin-sidebar.tsx`, `sidebar.tsx`) with icon-and-label navigation links. The active page is highlighted. On small screens, the sidebar collapses to a hamburger menu (via the `use-mobile.ts` hook).

**Dashboards:** Role-specific dashboards surface the most time-sensitive information first: pending orders, unread messages, active auctions, and platform statistics.

**Quick Actions:** Common operations (place bid, add to cart, accept bargain) are accessible directly from list cards without navigating to a separate detail page.

**Table Layouts and Filtering:** Order, product, and report lists use card-based layouts with status badges, making the current state immediately visible without opening detail pages. Risk-level badges on the moderation dashboard use colour coding (green = LOW, amber = MEDIUM, red = HIGH).

**Feedback Messages:** Every write operation (form submission, order placement, auction bid) triggers a `sonner` toast notification confirming success or describing the error, ensuring the user always knows the outcome of their action.

**Confirmation Prompts:** Irreversible actions (auction cancellation, product deletion) require confirmation through Radix UI `AlertDialog` overlays, preventing accidental data loss.

**Responsiveness:** Tailwind CSS utility classes with responsive prefixes (`md:`, `lg:`) are applied throughout, and the `use-mobile.ts` hook is used to conditionally render mobile-friendly layouts.

**Map-Based Location UX:** The `LocationPicker` component eliminates address-entry friction for farmers by allowing them to drop a pin on a map, automatically filling latitude/longitude fields. The map is also used to display farmer pickup locations to buyers on product cards.

---

## 5. UI Screenshots

The following figures document the key screens of the AgroLink application. Images are to be inserted at the indicated placeholders.

---

[FIGURE 1: Login screen]

**(a)** Shows the centralised login form with AgroLink branding, email and password fields, a "Forgot password?" link, and a "Register" link for new users.
**(b)** The user enters their registered email and password and clicks "Login". On success, they are redirected to their role-specific dashboard; on failure, a toast error is displayed.
**(c)** The single-column layout reduces cognitive load. The prominent branding reinforces platform identity. Inline field validation and toast notifications eliminate ambiguity about login failures.
**(d)** Separate Admin Login is accessible via `/admin/login`, keeping administrative access distinct from general users.
**(e)** The forgot-password link initiates the OTP flow without leaving the page, minimising navigation overhead.

---

[FIGURE 2: User Registration screen]

**(a)** Shows the multi-step registration form: Step 1 collects name, email, phone, and role selection (Buyer or Farmer). Step 2 collects address, business name (farmers), and National ID.
**(b)** The user selects their role using the `role-select.tsx` dropdown, fills in personal details, and proceeds through steps. `sessionStorage` preserves Step 1 data while navigating to Step 2.
**(c)** Progressive disclosure (multi-step form) reduces initial form complexity, improving completion rates. Role selection at registration allows the system to redirect users to the correct dashboard immediately.

---

[FIGURE 3: Public product listing / Vegetable browsing page]

**(a)** Shows a responsive grid of `product-card.tsx` components, each displaying a product image, name, price, farmer name, and an "Add to Cart" or "View Details" button.
**(b)** Unauthenticated users can browse products. Authenticated buyers can add items to the cart directly. A category filter bar at the top allows narrowing by crop type.
**(c)** Card-based grid layout allows visual comparison of products. Farmer location and price are immediately visible without entering a detail page, accelerating the purchase decision.

---

[FIGURE 4: Buyer dashboard]

**(a)** Shows the buyer dashboard with summary cards for active orders, pending bargains, unread messages, and open requirements. A quick-link navigation panel provides access to all buyer functions.
**(b)** The buyer can monitor all activity in one view and navigate to any functional area with a single click.
**(c)** The dashboard aggregates cross-service data (orders, bargains, messages) into a single entry point, reducing the time needed to understand platform activity.

---

[FIGURE 5: Shopping cart and checkout]

**(a)** Shows the cart page with a list of `cart-item.tsx` line items (product image, name, quantity selector, line price) and a `cart-summary.tsx` panel with total amount and checkout options (Stripe / COD).
**(b)** The buyer adjusts quantities, removes items, and proceeds to checkout. The Stripe button redirects to the Stripe-hosted payment page; the COD button places the order immediately.
**(c)** Separating cart management from checkout into distinct UI zones reduces accidental purchases. The COD option increases accessibility for users without credit cards.

---

[FIGURE 6: Active auction listing page]

**(a)** Shows a list of active auctions using `auction-card.tsx`, displaying product image, current highest bid, reserve price, time remaining, and a "Bid Now" button.
**(b)** Buyers can click "Bid Now" to open the `auction-bid-popup.tsx` dialog and enter a bid amount greater than the current highest bid.
**(c)** Countdown timers on each card create urgency. The current bid and reserve price are prominently displayed to help buyers make informed decisions. The modal dialog keeps the user on the listing page, reducing navigation overhead.

---

[FIGURE 7: Auction bid placement dialog]

**(a)** Shows the `auction-bid-popup.tsx` overlay with auction details (product name, image, end time, current bid), a validated bid amount input, and a delivery address section.
**(b)** The buyer enters a bid amount and confirms the delivery preference before submitting. Validation ensures the bid exceeds the current highest bid.
**(c)** Combining bid amount and delivery details in one dialog reduces the number of steps to complete a bid. Inline validation feedback prevents invalid submissions.

---

[FIGURE 8: Seller dashboard]

**(a)** Shows the seller dashboard with summary cards for total products, active auctions, pending orders, and unread messages. A notification badge on the header indicates new order alerts.
**(b)** The seller can navigate to product management, auction control, and order fulfilment from the dashboard.
**(c)** The notification badge ensures new orders are never missed. Quick-access cards for each module reflect the daily workflow of a farmer.

---

[FIGURE 9: Product creation / Edit form (Seller)]

**(a)** Shows the `vegetable-form.tsx` component with fields for vegetable name, category, pricing type (fixed price or bidding), quantity, description, delivery options, and a map-based pickup location picker.
**(b)** The farmer fills in product details, uploads multiple images (directly to S3 via presigned URL), and pins the pickup location on the Leaflet map.
**(c)** The map-based location picker eliminates manual coordinate entry. The multi-image upload with progress indicators provides visual confirmation that images were received. Conditional fields (bidding dates appear only when "Bidding" pricing type is selected) reduce form length.

---

[FIGURE 10: Order management screen (Seller)]

**(a)** Shows a list of incoming orders with buyer name, item summary, payment method, status badge, and action buttons (mark as delivered, cancel).
**(b)** The seller can update order status and view OTP for COD verification. In-app notifications (via the notification panel) alert the seller to new orders.
**(c)** Status badges with colour coding (amber for pending, green for delivered, red for cancelled) allow rapid triage without reading each order in detail.

---

[FIGURE 11: Bargain management page (Buyer and Seller)]

**(a)** Shows a list of `horizontal-bargain-card.tsx` components, each displaying the product, original price, proposed price, and current status badge.
**(b)** Sellers see accept/reject action buttons on each card. Buyers see the outcome and can initiate new bargains from product listings.
**(c)** The horizontal card layout allows side-by-side comparison of original versus proposed price, making the bargaining decision straightforward.

---

[FIGURE 12: Direct messaging / Chat interface]

**(a)** Shows a two-panel chat layout: a contact list on the left (with unread message counts) and the active conversation thread on the right, with message bubbles, timestamps, and a text input field.
**(b)** Users can send messages in real time (via WebSocket) and navigate between conversations without page reloads. Delivered messages appear instantly.
**(c)** The two-panel layout is consistent with familiar messaging conventions (similar to WhatsApp Web), minimising learning overhead. Unread message counts in the contact list eliminate the need to open each conversation to check for new messages.

---

[FIGURE 13: Crop recommendation tool]

**(a)** Shows the crop recommendation input form with sliders or number fields for rainfall, temperature, humidity, soil pH, nitrogen, phosphorus, and potassium values.
**(b)** The farmer inputs current soil and climate measurements and submits the form to receive a recommended crop type from the ML model.
**(c)** Providing contextual labels and measurement unit indicators next to each input field reduces data-entry errors. The single-screen layout with immediate output keeps the interaction fast.

---

[FIGURE 14: Admin dashboard]

**(a)** Shows the `admin-dashboard.tsx` component with platform-level statistics (total users, total farmers, total buyers), a user management table, and a moderation reports section.
**(b)** The admin can view aggregate platform metrics, search and manage registered users, and review flagged content reports.
**(c)** A sidebar (`admin-sidebar.tsx`) provides single-click access to each admin module. Statistics cards at the top give an immediate health check of the platform without requiring drill-down.

---

[FIGURE 15: Moderation / Reports section (Admin)]

**(a)** Shows the `reports-section.tsx` component with a table of user and product reports, each row displaying reporter ID, reported entity, issue type, risk level badge, description, and resolution status.
**(b)** The admin can filter reports by risk level and mark reports as resolved.
**(c)** Risk-level colour coding (green/amber/red) enables priority-based triage at a glance. The table layout with sortable columns supports efficient bulk review of reports.

---

## 6. Implementation Steps (How to Run / Deploy)

### 6.1 Prerequisites

Before running AgroLink locally, ensure the following are installed on the development machine:

| Tool | Minimum Version | Notes |
|---|---|---|
| Java JDK | 17 | Required for Spring Boot services |
| Maven | 3.9+ | `mvn` command must be on `PATH` |
| Node.js | 18 LTS | Required for Next.js frontend |
| npm | 9+ | Bundled with Node.js 18 |
| Python | 3.9+ | Required for crop-recommendation-service |
| pip | 22+ | For Python dependencies |
| Docker | 24+ | For containerised deployment |
| Docker Compose | v2.x | `docker compose` (v2 CLI) |
| PostgreSQL client | (optional) | For manual DB inspection |

### 6.2 Environment Configuration

1. Copy or create a `.env` file in the repository root (same directory as `docker-compose.yml`). All variables below are required:

```dotenv
# Database
DB_USER=agrolink_user
DB_PASSWORD=your_db_password
DB_NAME=agrodb

# Authentication
JWT_KEY=your_jwt_hmac_secret_at_least_256_bits

# Email (Gmail SMTP — use an App Password, not the account password)
SPRING_MAIL_USERNAME=your_gmail@gmail.com
SPRING_MAIL_PASSWORD=your_gmail_app_password

# AWS S3 (for product image uploads)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-s3-bucket-name
NEXT_PUBLIC_S3_HOSTNAME=your-bucket.s3.ap-south-1.amazonaws.com

# Stripe (payment processing)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
secret_key=your_order_service_secret

# AI / ML
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Chat encryption
CHAT_AES_KEY=your_32_byte_aes_key

# Frontend (used at build time)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CHAT_URL=http://localhost:8083
```

### 6.3 Running with Docker Compose (Recommended)

Docker Compose orchestrates all services in the correct startup order. The `docker-compose.yml` includes health checks to ensure that PostgreSQL is ready before any service that depends on it starts.

**Step 1 — Build and start all services:**

```bash
# From the repository root
docker compose up --build
```

This command builds Docker images for all Spring Boot services (using multi-stage Maven builds) and the Next.js frontend, then starts them in dependency order.

**Step 2 — Verify services are running:**

After all services reach a healthy state, the following ports should be accessible:

| Service | URL |
|---|---|
| API Gateway (main entry) | `http://localhost:8080` |
| Identity Service | `http://localhost:8081` |
| Order/Payment Service | `http://localhost:8082` |
| Chat Service (HTTP + WS) | `http://localhost:8083` |
| Moderation Service | `http://localhost:8084` |
| Chatbot Service | `http://localhost:8085` |
| Eureka Service Discovery | `http://localhost:8761` |
| Spring Cloud Config Server | `http://localhost:8888` |
| PostgreSQL (external) | `localhost:5435` |
| Adminer (DB GUI) | `http://localhost:8090` |
| Next.js Frontend | `http://localhost:3000` |

**Step 3 — Access the application:**

Open `http://localhost:3000` in a browser. The frontend is pre-configured to proxy API calls to `http://localhost:8080`.

**Step 4 — Stop services:**

```bash
docker compose down
```

To also remove volumes (database data):

```bash
docker compose down -v
```

### 6.4 Running Services Individually (Development Mode)

#### 6.4.1 Start the Database

```bash
# Start only PostgreSQL and Adminer
docker compose up postgres adminer -d
```

PostgreSQL is available at `localhost:5435`. Use Adminer at `http://localhost:8090` to inspect the database. Connect using: Server = `postgres`, Username = `${DB_USER}`, Password = `${DB_PASSWORD}`, Database = `${DB_NAME}`.

#### 6.4.2 Start Infrastructure Services

Infrastructure services must start first. Start them in this order:

```bash
# 1. Service Discovery (Eureka)
cd backend/service-discovery
mvn spring-boot:run

# 2. Config Server (in a new terminal)
cd backend/config-server
EUREKA_HOST=localhost mvn spring-boot:run
```

Wait until both services report `Started` in the console before proceeding.

#### 6.4.3 Start Core Microservices

Start each service in a separate terminal, exporting environment variables from the `.env` file first (or using `export $(cat ../../.env | xargs)` from the service directory):

```bash
# Identity Service
cd backend/identityAndUser-service
mvn spring-boot:run

# Product Catalog Service
cd backend/productCatalog-service
mvn spring-boot:run

# Auction Service
cd backend/auction-service
mvn spring-boot:run

# Order/Payment Service
cd backend/orderPayment-service
mvn spring-boot:run

# Chat Service
cd backend/chat-service
mvn spring-boot:run

# Moderation Service
cd backend/moderation-service
mvn spring-boot:run

# Chatbot Service
cd backend/chatbot-service
mvn spring-boot:run
```

#### 6.4.4 Start the API Gateway

```bash
cd backend/api-gateway
mvn spring-boot:run
```

#### 6.4.5 Start the Crop Recommendation Service (Python Flask)

```bash
cd backend/crop-recommendation-service

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask scikit-learn numpy pandas

# Run the service
python app.py
```

The service runs on its configured port and is called internally by the Product Catalog Service.

#### 6.4.6 Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend runs at `http://localhost:3000`.

For a production build:

```bash
npm run build
npm run start
```

### 6.5 Recommended Service Startup Order

```
1. PostgreSQL (database — must be healthy before any data service)
2. Service Discovery (Eureka — must be running before other services register)
3. Config Server (optional if services use local properties)
4. Identity Service
5. Product Catalog Service
6. Auction Service
7. Order/Payment Service
8. Chat Service
9. Moderation Service
10. Chatbot Service
11. Crop Recommendation Service (Python)
12. API Gateway (starts after all upstream services are registered in Eureka)
13. Frontend (Next.js)
```

### 6.6 Production Deployment

The repository includes a `docker-compose.production.yml` for production deployments. The key differences from the development compose file are optimised container resource constraints, non-root users in Dockerfiles, and production-specific environment variable overrides.

To deploy in production:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

The Next.js frontend Dockerfile uses a three-stage build: (1) dependency installation, (2) production build (`next build` with `output: 'standalone'`), and (3) a minimal Alpine-based runtime image running as a non-root user. The `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_CHAT_URL` build arguments must point to the externally accessible API Gateway and Chat Service URLs (e.g., a domain name or load balancer URL) at Docker build time.

---

## Clarifications Needed

The following items could not be definitively confirmed from the repository files at the time of this writing. Clarification from the project team would allow this chapter to be completed with full accuracy:

1. **Exact port of `productCatalog-service` and `auction-service`** — No explicit port declaration was found in their `application.properties`. The Docker Compose file also does not expose a host port for these services (they are internal). Please confirm the internal server port for each.
2. **Crop recommendation service port** — The Flask app port is not shown here. Please confirm whether it runs on the default Flask port (5000) or another.
3. **Database initialisation scripts** — The `postgres-init/` directory contains initialisation SQL. Please clarify whether these create schemas, seed data, or both.
4. **`OPENAI_API_KEY` usage** — The environment variable is present in the `productCatalog-service` configuration. However, no explicit OpenAI SDK call was identified in the reviewed code. Please clarify its purpose (potential future feature or AI-assisted description generation).
5. **Frontend deployment target** — The problem statement mentions a web application, but the deployment target (AWS, Vercel, self-hosted VPS, etc.) is not declared in the repository. Please specify.
6. **Kubernetes/orchestration** — The README references Kubernetes (AWS EKS) as an intended orchestration platform, but no Kubernetes manifests (`.yaml` files) were found in the repository. Please clarify whether this is a planned feature or if manifests are stored elsewhere.
7. **Pagination** — No `Pageable`/`Page<T>` usage was detected in any repository. All list endpoints return unbounded collections. Please confirm whether pagination is in scope or planned.
8. **Caching** — No `@Cacheable` or Redis integration was detected. The README mentions Redis as a planned technology. Please confirm whether it has been implemented or is a future item.
9. **Auction service inter-service call URL** — The `OrderIntegrationService` constructs the URL for creating auction-derived orders. Please confirm the exact base URL or Eureka service name used for this call.
10. **Admin capabilities** — The admin dashboard is confirmed in the frontend, but no dedicated admin microservice was found in the backend. Please clarify whether admin operations (banning users, approving listings) are served by the `identityAndUser-service` or are planned as a separate service.
