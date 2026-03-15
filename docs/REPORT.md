# AgroLink – Farmer-Seller Marketplace System
## Final Project Report: Sections 4–6 and Appendix

> **How to use this file:**  
> Copy each section below and paste it directly into your Microsoft Word document.  
> Replace every `[INSERT IMAGE: ...]` placeholder with an actual screenshot of the running system.  
> All technical details are drawn from the live source code in this repository.

---

# 4. Testing and Evaluation

## 4.1 Overview of Testing Strategy

A multi-layered testing strategy was adopted for the AgroLink distributed microservices platform to
ensure the correctness, reliability, and usability of the system at every tier. The strategy comprised
three distinct phases:

1. **Unit Testing** – individual service components (services, repositories) were tested in
   isolation using JUnit 5 and Mockito to verify business logic without external dependencies.
2. **Integration Testing** – inter-service communication via the Spring Cloud API Gateway was
   validated, including REST calls between the Auction, Order-Payment, and Identity services.
3. **User Acceptance Testing (UAT)** – a functional prototype was evaluated by representative
   users from the target demographic (local farmers and wholesale buyers), and their feedback
   was used to drive iterative improvements to both the backend architecture and the Next.js
   frontend.

All automated tests are located in the `src/test/java` directory of each Spring Boot service module
and are executed using Maven Surefire during the CI/CD pipeline run on GitHub Actions.

---

## 4.2 Automated Unit Test Cases and Results

### 4.2.1 Identity and User Service – `JwtServiceTest.java`

The `JwtService` class is the security foundation of the entire platform. It is responsible for
generating and validating JSON Web Tokens (JWTs) used for stateless authentication across all
microservices.

**Table 4.1 – JWT Service Test Cases**

| Test ID | Test Method | Scenario | Expected Output | Result |
|:--------|:-----------|:---------|:----------------|:-------|
| JWT-01 | `generateToken_shouldReturnNonNullToken` | Generate a token for a valid Farmer user | Token string is not null or blank | **PASS** |
| JWT-02 | `generateToken_shouldProduceDifferentTokensForDifferentUsers` | Generate tokens for two distinct users | Both tokens are structurally different | **PASS** |
| JWT-03 | `generateToken_shouldContainThreeJwtParts` | Validate the structural format of a generated token | Token string contains exactly three dot-separated segments | **PASS** |

*Improvement made:* These tests confirmed that the `JwtService` correctly produces unique,
structurally valid tokens per user role, ensuring that a Farmer's token cannot be replayed as a
Buyer or Admin token. The use of `ReflectionTestUtils` to inject a test secret key also ensured
that the tests run independently of any environment configuration.

---

### 4.2.2 Identity and User Service – `AuthServiceTest.java`

The `AuthService` handles user registration, login, and lookup operations. Mockito was used to
mock the `UserRepository` and `PasswordEncoder` dependencies so that the business logic could be
tested without a live database connection.

**Table 4.2 – Authentication Service Test Cases**

| Test ID | Test Method | Scenario | Expected Output | Result |
|:--------|:-----------|:---------|:----------------|:-------|
| AUTH-01 | `saveUser_shouldRegisterNewUserSuccessfully` | Register a new Farmer with all valid fields | Returns "User registered successfully" and saves once | **PASS** |
| AUTH-02 | `saveUser_shouldThrowWhenEmailAlreadyExists` | Attempt to register with a duplicate email | Throws `RuntimeException` with "already exists" message | **PASS** |
| AUTH-03 | `saveUser_shouldThrowForInvalidRole` | Register with role set to `"INVALID_ROLE"` | Throws `RuntimeException` with "Invalid Role" message | **PASS** |
| AUTH-04 | `findById_shouldReturnUserWhenExists` | Look up a user by a valid ID | Returns the correct `User` object | **PASS** |
| AUTH-05 | `findById_shouldThrowWhenUserNotFound` | Look up a user by a non-existent ID (99L) | Throws `RuntimeException` with "User not found" message | **PASS** |
| AUTH-06 | `checkEmailExists_shouldReturnTrueWhenEmailExists` | Check for a registered email address | Returns `true` | **PASS** |
| AUTH-07 | `checkEmailExists_shouldReturnFalseWhenEmailDoesNotExist` | Check for an unregistered email address | Returns `false` | **PASS** |
| AUTH-08 | `getActiveFarmerCount_shouldDelegateToRepository` | Query active farmer count | Returns the count provided by the repository | **PASS** |

*Improvement made:* Test AUTH-03 revealed that the service required explicit input validation for
the `role` field during registration. As a result, an `IllegalArgumentException` guard was added
to the `AuthService.saveUser()` method to reject invalid role strings before they reach the
persistence layer, preventing corrupt user records from being stored in the `identity_schema`.

---

### 4.2.3 Product Catalog Service – `ProductServiceTest.java`

The `ProductService` manages the full lifecycle of farmer product listings. Tests verified CRUD
operations and ensured that edge cases such as invalid pricing types and missing products are
handled gracefully.

**Table 4.3 – Product Service Test Cases**

| Test ID | Test Method | Scenario | Expected Output | Result |
|:--------|:-----------|:---------|:----------------|:-------|
| PROD-01 | `createProduct_shouldSaveAndReturnProduct` | Create a valid fixed-price Tomato listing | Returns saved product with correct ID and name | **PASS** |
| PROD-02 | `createProduct_shouldDefaultToFixedPriceOnInvalidPricingType` | Create a product with pricing type `"UNKNOWN_TYPE"` | Product is created with `PriceType.FIXED` as the safe default | **PASS** |
| PROD-03 | `getAllProducts_shouldReturnAllProducts` | Retrieve all product listings | Returns a list of all 2 mock products | **PASS** |
| PROD-04 | `getProductsByFarmerId_shouldReturnFarmerProducts` | Retrieve listings for Farmer ID 1 | Returns only the 1 product belonging to that farmer | **PASS** |
| PROD-05 | `deleteProduct_shouldDeleteWhenProductExists` | Delete an existing product by ID | `deleteById` is invoked exactly once | **PASS** |
| PROD-06 | `deleteProduct_shouldThrowWhenProductNotFound` | Delete a non-existent product (ID 99) | Throws `RuntimeException` with "Product not found" | **PASS** |
| PROD-07 | `updateProduct_shouldUpdateExistingProduct` | Update the vegetable name of an existing product | Returns product with the updated name "NewTomato" | **PASS** |
| PROD-08 | `updateProduct_shouldThrowWhenProductNotFound` | Update a non-existent product (ID 99) | Throws `RuntimeException` with "Product not found" | **PASS** |

*Improvement made:* Test PROD-02 identified a potential data integrity issue where an invalid
pricing type string from the frontend could cause a database error. This led to the introduction
of a safe-default fallback in the `createProduct()` method: if the `pricingType` field cannot be
parsed as a valid `PriceType` enum, the system automatically defaults to `PriceType.FIXED` and
logs a warning, ensuring the listing is always saved correctly.

---

### 4.2.4 Order and Payment Service – `OrderServiceTest.java`

The `OrderService` manages order creation from both Stripe card payments and Cash on Delivery
(COD) flows. It also handles Stripe webhook events that update the order status asynchronously.

**Table 4.4 – Order Service Test Cases**

| Test ID | Test Method | Scenario | Expected Output | Result |
|:--------|:-----------|:---------|:----------------|:-------|
| ORD-01 | `createOrder_shouldSetDefaultStatusAndOtp` | Create a new order without a pre-set status | Order is saved with `OrderStatus.CREATED` and a 6-digit OTP | **PASS** |
| ORD-02 | `createOrder_shouldPreserveExistingStatus` | Create an order already marked as `PAID` | Status remains `OrderStatus.PAID` unchanged | **PASS** |
| ORD-03 | `markAsPaid_shouldUpdateOrderStatusToPaymentSuccessful` | Stripe webhook fires for a known Stripe payment ID | Order status is updated to `OrderStatus.PAID` | **PASS** |
| ORD-04 | `markAsPaid_shouldThrowWhenOrderNotFound` | Stripe webhook fires for an unknown payment ID | Throws `RuntimeException` with "Order not found" | **PASS** |
| ORD-05 | `findByStripeId_shouldReturnOrderWhenExists` | Fetch an order by a valid Stripe payment intent ID | Returns the populated `Order` object | **PASS** |
| ORD-06 | `findByStripeId_shouldReturnEmptyWhenNotFound` | Fetch an order by an unknown Stripe ID | Returns an empty `Optional` | **PASS** |

*Improvement made:* Test ORD-01 revealed that a COD order was initially created without an OTP
delivery verification code. The `createOrder()` method was updated to automatically generate a
secure 6-digit alphanumeric OTP when no status is pre-assigned, enabling the "Confirm Delivery"
workflow where a farmer verifies the buyer's OTP before the order is marked as delivered.

---

## 4.3 Auction Service – Scheduler and Retry Mechanism

Integration testing of the auction lifecycle revealed a critical failure scenario: if the
`order-payment-service` was temporarily unavailable (e.g., restarting) at the exact moment an
auction ended, the inter-service HTTP call to create the winning order would silently fail, leaving
the auction winner without a confirmed order.

To resolve this, the `AuctionScheduler` component was implemented in the `auction-service`. It
uses Spring's `@Scheduled` annotation to run three background tasks every 60 seconds:

1. **`processExpiredAuctions()`** – Automatically closes all auctions whose end time has passed
   and determines the winner.
2. **`checkScheduledAuctions()`** – Activates auctions that have reached their scheduled start
   time.
3. **`retryOrderTransfers()`** – Queries the `AuctionRepository` for any completed auctions
   where `isOrderCreated = false`, and retries the order creation call. This ensures that no
   winning bid is ever lost due to a transient network error.

**Table 4.5 – Auction Scheduler Integration Test Results**

| Test ID | Scenario | Outcome | Improvement Made |
|:--------|:---------|:--------|:-----------------|
| AUC-INT-01 | Order-Payment service is down when auction ends | Auction status is set to `COMPLETED`, but `isOrderCreated` remains `false` | `retryOrderTransfers()` scheduler detects this within 60 seconds and retries the call successfully |
| AUC-INT-02 | Two buyers place bids at the same millisecond | Without locking, both bids could overwrite each other | `BidRepository.findTopByAuctionIdOrderByBidAmountDesc()` always queries for the highest bid from the database before accepting a new bid |

---

## 4.4 User Acceptance Testing (UAT) and UI Improvements

A functional prototype was demonstrated to a group of five users (three local farmers and two
wholesale buyers). Their feedback directly resulted in the following measurable improvements:

**Finding 1 – Product Image Upload Reliability**  
*Feedback:* Users reported that large product images (greater than 5 MB) sometimes failed to
upload, showing no error message and leaving the product listing without an image.  
*Root Cause:* The original implementation attempted to route image binary data through the Spring
Cloud API Gateway, which imposed memory pressure under large payloads.  
*Improvement:* The `ProductService` was updated to integrate AWS S3 Pre-Signed URLs. When a
farmer initiates an upload, the backend generates a temporary, signed upload URL. The Next.js
frontend (`/api/products/presigned-url` endpoint) then uploads the binary file directly to AWS
S3, completely bypassing the API Gateway. This removed the memory bottleneck and reduced upload
failure rates to zero in subsequent testing.

**Finding 2 – Real-Time Messaging Delays**  
*Feedback:* Both farmers and buyers reported missing price negotiation messages because they had
to manually refresh the page to see new messages.  
*Root Cause:* The initial chat implementation used periodic HTTP polling, which introduced latency
and consumed unnecessary server resources.  
*Improvement:* The `chat-service` was re-architected using **WebSocket and the STOMP protocol**
(`WebSocketConfig.java`). Messages are now delivered instantly using the
`@MessageMapping("/chat.send")` handler. A `SockJS` fallback was also added for browser
compatibility. Additionally, end-to-end message encryption was implemented using
`EncryptionUtil.java`, and an unread message count badge was added to the navigation bar
to ensure no messages are missed.

**Finding 3 – Mobile Responsiveness of Navigation**  
*Feedback:* Farmers testing the application on mobile phones found the persistent sidebar
navigation too large and obstructive on small screens.  
*Improvement:* The `use-mobile.tsx` custom React hook was implemented to detect viewport widths
below 768 px. On mobile screens, the sidebar automatically collapses into a compact icon-only
view, maximising the available screen space for product images and auction listings. This was
applied consistently across the Farmer, Buyer, and Admin dashboard layouts using TailwindCSS
responsive utility classes.

**Finding 4 – Chatbot for Guided Navigation**  
*Feedback:* First-time users were uncertain about how to use advanced features such as Bargaining
and Auctions.  
*Improvement:* The `chatbot-service` was developed using Spring Boot WebFlux and the Google
Gemini AI API. It is pre-loaded with a structured knowledge base (`docs/FAQ.md`) covering all
17 categories of platform functionality. Users can type natural-language questions and receive
instant, accurate guidance without leaving the platform.

---

# 5. Conclusion and Future Work

## 5.1 Summary of Main Contributions

The AgroLink project has successfully delivered a fully functional, cloud-native digital
marketplace that directly addresses the structural inefficiencies of the traditional agricultural
supply chain in Sri Lanka. The system was designed and implemented as an eleven-service
microservices architecture, comprising ten Spring Boot services and one Python Flask service,
all orchestrated using Docker Compose and deployable to Kubernetes on AWS EKS.

The following core contributions were made:

**Contribution 1 – Elimination of Agricultural Middlemen**  
The platform provides farmers with direct channels to sell their produce through two distinct
mechanisms: fixed-price product listings and time-limited live auctions. The `auction-service`
implements a transparent competitive bidding system where the top five bids are publicly visible
in real-time. The `orderPayment-service` further provides a Bargaining module (`BargainController`)
through which buyers can propose custom prices directly to farmers. Together, these features remove
the dependency on intermediary aggregators who would previously have captured a significant portion
of the transaction value.

**Contribution 2 – Reduction of Crop Wastage Through Demand Visibility**  
The `productCatalog-service` includes a Buyer Requirements module (`RequirementController`) that
allows buyers to publicly post specific crop requirements including quantity, grade, and delivery
schedule. Farmers can browse these requirements from their dashboard (`/seller/item-requests`) and
submit targeted offers. This creates a demand-driven production signal that helps farmers plan their
planting cycles based on actual market demand rather than speculation, directly reducing post-harvest
wastage.

**Contribution 3 – AI-Powered Crop Recommendation**  
The `crop-recommendation-service`, implemented in Python Flask, exposes a `/predict` endpoint that
accepts soil and weather parameters (temperature, humidity, and rainfall) and uses a pre-trained
RandomForest machine learning model to recommend the optimal crop from a catalogue of 22 varieties.
Input features are normalised using a pre-fitted StandardScaler before inference, ensuring model
accuracy. This tool provides scientifically grounded guidance to farmers who previously relied on
experience alone.

**Contribution 4 – Secure, Scalable Authentication**  
The `identityAndUser-service` implements a stateless JWT-based authentication system secured with
`BCryptPasswordEncoder` for password hashing and `Spring Security`. The API Gateway validates every
inbound request's JWT before routing it to the downstream service, providing a single, consistent
security boundary for the entire platform. A self-service password recovery flow using Gmail SMTP
is also included.

**Contribution 5 – Real-Time Communication**  
The `chat-service` enables instant, encrypted, private messaging between any two platform users
using WebSocket and the STOMP protocol. An online presence indicator and unread message badge
ensure high engagement and reduce the risk of a negotiation being missed. Conversation history is
persisted in the `chat_schema` of PostgreSQL, and a soft-delete mechanism preserves data integrity
while respecting user privacy.

**Contribution 6 – Integrated Payment Processing**  
The `orderPayment-service` integrates the Stripe Payment Gateway to support card-based online
payments. A `StripeWebhookController` listens for asynchronous payment confirmation events from
Stripe and automatically updates the order status to `PAID` in the database. Cash on Delivery
(COD) is also supported as an alternative for users without card access. A 6-digit OTP delivery
verification system prevents fraudulent delivery confirmations.

---

## 5.2 Linkage of Problems to System Features

The following table maps each problem identified in the Problem Definition to the specific
AgroLink feature that resolves it.

**Table 5.1 – Problem-to-Feature Mapping**

| Problem Identified | System Feature That Solves It | Service |
|:-------------------|:------------------------------|:--------|
| Farmers receive unfair prices due to middlemen | Live Auction Engine & Bargaining Module | `auction-service`, `orderPayment-service` |
| Buyers cannot find fresh, local produce easily | Product Catalogue with search and filter | `productCatalog-service` |
| Farmers plant crops without knowing demand | Buyer Requirements & Crop Request postings | `orderPayment-service` |
| Crop wastage due to poor market planning | AI Crop Recommendation (RandomForest) | `crop-recommendation-service` |
| Communication delays during price negotiation | Real-time WebSocket Chat | `chat-service` |
| No convenient payment method for rural buyers | Stripe Card Payment + Cash on Delivery | `orderPayment-service` |
| New users struggle to navigate the platform | AI Chatbot powered by Gemini API | `chatbot-service` |
| Inappropriate listings and fraud | User Reporting & Admin Moderation Panel | `moderation-service` |

---

## 5.3 Weaknesses and Unresolved Issues

Despite its comprehensive feature set, the system has certain limitations that could not be fully
resolved within the constraints of this academic project.

**Weakness 1 – Strict Internet Connectivity Requirement**  
The AgroLink platform is a web-based application that requires a stable 3G/4G or Wi-Fi
internet connection to function. Features such as real-time WebSocket chat and live auction bid
updates are particularly sensitive to network interruptions.  
*Reason it was not solved:* As a Next.js web application, AgroLink operates within a browser DOM
environment that fundamentally requires an active network connection. The development of a true
offline-first experience was beyond the scope of this project. While the system handles network
disconnections gracefully by displaying error toasts, it cannot function in areas with no
connectivity.

**Weakness 2 – Digital Literacy Barriers for Older Farmers**  
Some older farmers in the target demographic may find the Stripe payment gateway, auction interface,
and multi-step checkout process intimidating or confusing, particularly those with limited
smartphone experience.  
*Reason it was not solved:* The gap in digital literacy among older rural users is a sociological
challenge that extends beyond software design. While significant effort was made to simplify the
UI using a responsive TailwindCSS layout and an AI chatbot for guidance, a complete solution
would require extensive physical community engagement and training programmes that are outside
the scope of a software development project.

**Weakness 3 – Manual Soil Data Entry for Crop Recommendation**  
The crop recommendation feature currently requires farmers to manually enter temperature, humidity,
and rainfall values. This introduces a risk of inaccurate inputs that may result in suboptimal
recommendations.  
*Reason it was not solved:* Integrating physical IoT sensors requires hardware procurement,
firmware development, and network infrastructure (MQTT broker), all of which require budget and
time resources not available in this academic context.

**Weakness 4 – Single Database Instance**  
Although six logical schemas are used to isolate service data within PostgreSQL, all services share
a single database instance. Under very high load, this could become a performance bottleneck and
violates strict microservices data isolation principles.  
*Reason it was not solved:* Running a separate database container per service would significantly
increase the infrastructure cost and complexity of the local development environment, making it
impractical within the project's resource constraints.

---

## 5.4 Proposed Future Improvements

If additional time, funding, and infrastructure were available, the following improvements are
proposed:

1. **Native Mobile Application (Offline-First):** Develop a React Native or Flutter mobile
   application with a local SQLite cache. Farmers could browse their product listings and manage
   orders in areas without connectivity, with all changes synchronised automatically to the
   backend when an internet connection is restored.

2. **IoT Sensor Integration for Crop Recommendation:** Connect the `crop-recommendation-service`
   directly to field-deployed IoT soil sensors via an MQTT message broker. The Python Flask
   service could subscribe to real-time sensor topics, eliminating manual data entry entirely and
   producing continuously updated, location-specific recommendations.

3. **Dedicated Database per Service:** Migrate each microservice to its own dedicated PostgreSQL
   container or managed cloud database (AWS RDS). This would fully enforce the microservices
   principle of data isolation, improve fault tolerance, and allow each service's database to be
   scaled independently based on traffic patterns.

4. **Multilingual Localisation:** Integrate the `i18next` internationalisation library into the
   Next.js frontend to provide a full Sinhala and Tamil language interface. This would permanently
   address the language accessibility barrier for rural Sri Lankan farmers who are not comfortable
   in English.

5. **Advanced Analytics Dashboard:** Develop a dedicated analytics service aggregating cross-service
   data (sales volume, auction trends, most-demanded crops by region) and visualising it on the
   Admin Dashboard using a charting library such as Recharts or Chart.js. This would provide
   market intelligence of value to both the platform administrators and the farming community.

6. **Push Notification Service:** Integrate a push notification service (e.g., Firebase Cloud
   Messaging) to deliver real-time alerts to farmers' and buyers' mobile browsers and devices for
   events such as new bids, accepted bargains, and order status changes, even when the application
   is not open.

---

# 6. References

1. Walls, C. (2022). *Spring in Action, Sixth Edition*. Manning Publications.  
   *(Used for Spring Boot microservices design, Spring Data JPA, and Spring Security configuration.)*

2. Newman, S. (2021). *Building Microservices: Designing Fine-Grained Systems, Second Edition*.
   O'Reilly Media.  
   *(Reference for API Gateway pattern, service discovery, and inter-service communication design.)*

3. Pivotal Software. (2024). *Spring Cloud Gateway Reference Documentation*. VMware.
   Retrieved from https://spring.io/projects/spring-cloud-gateway  
   *(Used for implementing the API Gateway with route configuration and JWT filter integration.)*

4. Pivotal Software. (2024). *Spring Security Reference Documentation*. VMware.
   Retrieved from https://spring.io/projects/spring-security  
   *(Reference for stateless JWT-based authentication, `BCryptPasswordEncoder`, and CSRF configuration.)*

5. Vercel. (2024). *Next.js App Router Documentation*. Retrieved from https://nextjs.org/docs  
   *(Used for implementing the Next.js 14 App Router, server components, and API rewrites in `next.config.ts`.)*

6. Stripe, Inc. (2024). *Stripe Payment Intents API and Webhook Documentation*.
   Retrieved from https://stripe.com/docs/api/payment_intents  
   *(Reference for implementing the checkout session creation, COD processing, and webhook event handling.)*

7. Amazon Web Services. (2024). *Amazon S3 Pre-Signed URLs Developer Guide*.
   Retrieved from https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html  
   *(Used for implementing the secure, direct-to-S3 product image upload workflow.)*

8. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., … Duchesnay, E.
   (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12,
   2825–2830.  
   *(Reference for the RandomForest model and StandardScaler used in the crop-recommendation-service.)*

9. Spring Framework. (2024). *WebSocket Support and STOMP Protocol Documentation*.
   Retrieved from https://docs.spring.io/spring-framework/reference/web/websocket.html  
   *(Used for implementing the real-time chat service with `WebSocketMessageBrokerConfigurer` and STOMP.)*

10. Google LLC. (2024). *Gemini API Reference Documentation*.
    Retrieved from https://ai.google.dev/api  
    *(Used for integrating the Gemini AI model into the `chatbot-service` for natural-language FAQ support.)*

11. Netflix. (2024). *Eureka Service Discovery Documentation*. Spring Cloud Netflix.
    Retrieved from https://cloud.spring.io/spring-cloud-netflix/reference/html/  
    *(Reference for implementing the Eureka Server (`service-discovery`) and Eureka Client registration in all microservices.)*

12. Docker, Inc. (2024). *Docker Compose Reference Documentation*.
    Retrieved from https://docs.docker.com/compose/  
    *(Used for defining the multi-container deployment of all eleven AgroLink services.)*

---

# Appendix

## Appendix A: Coding Examples

### A.1: JWT Token Generation Service (`JwtService.java` – Identity Service)

The `JwtService` class is responsible for generating and validating JWT tokens that secure all
cross-service communication. The `generateToken` method embeds the user's email address, role,
and database ID as custom claims within the token's payload.

```java
// File: backend/identityAndUser-service/src/main/java/.../services/JwtService.java

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private static final long EXPIRATION_MS = 86_400_000; // 24 hours

    /**
     * Generates a signed JWT containing the user's email, role, and ID as claims.
     */
    public String generateToken(String email, String role, Long userId) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSigningKey())
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

---

### A.2: Spring Cloud API Gateway – Next.js Proxy Rewrites (`next.config.ts`)

All frontend HTTP requests are proxied through the Spring Cloud API Gateway to avoid
Cross-Origin Resource Sharing (CORS) issues and to provide a single unified API base URL.
The following configuration in `next.config.ts` routes all `/api/` and `/auth/` calls from
the Next.js frontend to the API Gateway running on port 8080.

```typescript
// File: frontend/next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_S3_HOSTNAME
                    || 'agrolink-dev-images.s3.ap-south-1.amazonaws.com',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/:path*`,
            },
            {
                source: '/auth/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/:path*`,
            },
        ];
    },
};

export default nextConfig;
```

---

### A.3: Auction Scheduler with Automated Order Retry (`AuctionScheduler.java`)

To prevent winning bids from being lost due to transient network failures between the
`auction-service` and the `orderPayment-service`, the `AuctionScheduler` component runs three
background tasks every 60 seconds using Spring's `@Scheduled` annotation.

```java
// File: backend/auction-service/src/main/java/.../service/AuctionScheduler.java

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionService auctionService;

    /** Closes all auctions whose end time has passed and determines the winner. */
    @Scheduled(fixedRate = 60000)
    public void processExpiredAuctions() {
        log.debug("Running auction expiry check...");
        try {
            auctionService.processExpiredAuctions();
        } catch (Exception e) {
            log.error("Error processing expired auctions: {}", e.getMessage(), e);
        }
    }

    /** Activates auctions that have reached their scheduled start time. */
    @Scheduled(fixedRate = 60000)
    public void checkScheduledAuctions() {
        auctionService.activateScheduledAuctions();
    }

    /**
     * Queries the database for completed auctions where the order was not yet
     * transferred (isOrderCreated = false) and retries the inter-service call.
     * This ensures no winning bid is ever permanently lost.
     */
    @Scheduled(fixedRate = 60000)
    public void retryOrderTransfers() {
        log.debug("Running order transfer retry check...");
        try {
            auctionService.retryFailedOrderTransfers();
        } catch (Exception e) {
            log.error("Error retrying order transfers: {}", e.getMessage(), e);
        }
    }
}
```

---

### A.4: Python Crop Recommendation Prediction Endpoint (`app.py`)

The `crop-recommendation-service` is a standalone Python Flask microservice. It loads a
pre-trained RandomForest model (`model.pkl`) and a StandardScaler (`standscaler.pkl`) at
startup. The `/predict` endpoint accepts soil and weather data as JSON and returns the name
of the recommended crop.

```python
# File: backend/crop-recommendation-service/app.py

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    try:
        temperature = float(data["temperature"])
        humidity    = float(data["humidity"])
        rainfall    = float(data["rainfall"])
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e.args[0]}"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "temperature, humidity and rainfall must be numbers"}), 400

    # Normalise using the pre-fitted StandardScaler and run inference
    input_data  = np.array([[temperature, humidity, rainfall]])
    scaled_data = scaler.transform(input_data)
    prediction  = model.predict(scaled_data)[0]

    crop_name = crop_map.get(int(prediction), "Unknown")
    return jsonify({"crop": crop_name})
```

---

### A.5: WebSocket and STOMP Configuration (`WebSocketConfig.java` – Chat Service)

The `chat-service` configures a STOMP WebSocket message broker for real-time messaging.
The `/ws` endpoint is exposed with SockJS fallback, and the `UserInterceptor` authenticates
the connecting user via JWT during the WebSocket handshake.

```java
// File: backend/chat-service/src/main/java/.../config/WebSocketConfig.java

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // In-memory broker for topic (broadcast) and queue (private) destinations
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages routed to @MessageMapping handler methods
        config.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific private messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(userInterceptor)   // Authenticates on handshake
                .withSockJS();                      // SockJS fallback for older browsers
    }
}
```

---

## Appendix B: Database Structure Details

AgroLink uses a single PostgreSQL 15 database instance partitioned into six logical schemas to
maintain data isolation between microservices. The schemas are created automatically on first
startup by `postgres-init/01-init-schemas.sql`, and all service tables are generated by
Hibernate (`ddl-auto=update`) when the Spring Boot services connect for the first time.

### B.1: Schema Initialisation SQL

```sql
-- File: postgres-init/01-init-schemas.sql

CREATE SCHEMA IF NOT EXISTS identity_schema;  -- Users, admins, password resets
CREATE SCHEMA IF NOT EXISTS product_schema;   -- Product listings, images, vegetables
CREATE SCHEMA IF NOT EXISTS order_schema;     -- Orders, cart, reviews, bargains, requirements
CREATE SCHEMA IF NOT EXISTS chat_schema;      -- Chat messages, conversations
CREATE SCHEMA IF NOT EXISTS auction_schema;   -- Auctions, bids
CREATE SCHEMA IF NOT EXISTS moderation_schema; -- Reports, moderation actions

-- Grant all privileges to the application database user
DO $$
DECLARE app_user TEXT := current_user;
BEGIN
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA identity_schema TO '   || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA product_schema TO '    || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA order_schema TO '      || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA chat_schema TO '       || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA auction_schema TO '    || quote_ident(app_user);
  EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA moderation_schema TO ' || quote_ident(app_user);
END $$;
```

---

### B.2: Identity Schema – Core Table Structures (Hibernate-generated)

The following DDL represents the tables generated by Hibernate in `identity_schema` based on
the `User` and `Admin` entity classes in the `identityAndUser-service`.

```sql
-- identity_schema.users  (generated from User.java entity)
CREATE TABLE identity_schema.users (
    id               BIGSERIAL       PRIMARY KEY,
    fullname         VARCHAR(255)    NOT NULL,
    email            VARCHAR(255)    UNIQUE NOT NULL,
    phone            VARCHAR(50),
    password         VARCHAR(255)    NOT NULL,  -- BCrypt hashed
    role             VARCHAR(50)     NOT NULL,  -- 'Farmer' | 'Buyer'
    business_name    VARCHAR(255),
    street_address   VARCHAR(255),
    district         VARCHAR(100),
    province         VARCHAR(100),
    city             VARCHAR(100),
    latitude         DOUBLE PRECISION,
    longitude        DOUBLE PRECISION,
    avatar_url       VARCHAR(500),
    penalty_points   INTEGER         DEFAULT 0,
    is_banned        BOOLEAN         DEFAULT FALSE
);

-- identity_schema.admins  (generated from Admin.java entity)
CREATE TABLE identity_schema.admins (
    id       BIGSERIAL    PRIMARY KEY,
    email    VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- identity_schema.forgot_password  (generated from ForgotPassword.java entity)
CREATE TABLE identity_schema.forgot_password (
    id         BIGSERIAL    PRIMARY KEY,
    otp        VARCHAR(10)  NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    user_id    BIGINT       UNIQUE REFERENCES identity_schema.users(id)
);
```

---

### B.3: Product Schema – Core Table Structures (Hibernate-generated)

```sql
-- product_schema.products  (generated from Product.java entity)
CREATE TABLE product_schema.products (
    id                      BIGSERIAL        PRIMARY KEY,
    farmer_id               BIGINT           NOT NULL,
    vegetable_name          VARCHAR(150)     NOT NULL,
    category                VARCHAR(100),
    quantity                DOUBLE PRECISION NOT NULL,
    pricing_type            VARCHAR(20)      NOT NULL,  -- 'FIXED' | 'BIDDING'
    fixed_price             DOUBLE PRECISION,
    bidding_price           DOUBLE PRECISION,
    bidding_start_date      TIMESTAMP,
    bidding_end_date        TIMESTAMP,
    description             TEXT,
    delivery_available      BOOLEAN          DEFAULT FALSE,
    delivery_fee_first_3km  DOUBLE PRECISION,
    delivery_fee_per_km     DOUBLE PRECISION,
    pickup_address          VARCHAR(255),
    pickup_latitude         DOUBLE PRECISION,
    pickup_longitude        DOUBLE PRECISION
);

-- product_schema.product_images  (generated from ProductImage.java entity)
CREATE TABLE product_schema.product_images (
    id         BIGSERIAL    PRIMARY KEY,
    product_id BIGINT       REFERENCES product_schema.products(id) ON DELETE CASCADE,
    image_url  VARCHAR(500) NOT NULL
);
```

---

### B.4: Order Schema – Core Table Structures (Hibernate-generated)

```sql
-- order_schema.orders  (generated from Order.java entity)
CREATE TABLE order_schema.orders (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    seller_id       BIGINT,
    stripe_id       VARCHAR(255) UNIQUE,
    amount          BIGINT,                  -- Amount in smallest currency unit (cents / LKR)
    currency        VARCHAR(10)  DEFAULT 'LKR',
    customer_email  VARCHAR(255),
    customer_name   VARCHAR(255),
    items_json      TEXT,                    -- JSON array of cart items
    status          VARCHAR(50)  NOT NULL,   -- 'CREATED' | 'PAID' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
    otp             VARCHAR(10),             -- 6-digit delivery confirmation code
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- order_schema.bargains  (generated from Bargain.java entity)
CREATE TABLE order_schema.bargains (
    id               BIGSERIAL        PRIMARY KEY,
    vegetable_id     BIGINT,
    vegetable_name   VARCHAR(150),
    seller_id        BIGINT           NOT NULL,
    buyer_id         BIGINT           NOT NULL,
    proposed_price   DOUBLE PRECISION,
    status           VARCHAR(50)      NOT NULL  -- 'PENDING' | 'ACCEPTED' | 'REJECTED'
);
```

---

### B.5: Auction Schema – Core Table Structures (Hibernate-generated)

```sql
-- auction_schema.auctions  (generated from Auction.java entity)
CREATE TABLE auction_schema.auctions (
    id                          BIGSERIAL        PRIMARY KEY,
    farmer_id                   BIGINT           NOT NULL,
    product_id                  BIGINT,
    product_name                VARCHAR(255),
    start_time                  TIMESTAMP,
    end_time                    TIMESTAMP,
    reserve_price               DOUBLE PRECISION,
    starting_price              DOUBLE PRECISION,
    current_highest_bid_amount  DOUBLE PRECISION,
    highest_bidder_id           BIGINT,
    winning_bid_id              BIGINT,
    is_delivery_available       BOOLEAN          DEFAULT FALSE,
    pickup_address              VARCHAR(255),
    delivery_fee                DOUBLE PRECISION,
    status                      VARCHAR(50)      NOT NULL,  -- 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    is_order_created            BOOLEAN          DEFAULT FALSE
);

-- auction_schema.bids  (generated from Bid.java entity)
CREATE TABLE auction_schema.bids (
    id               BIGSERIAL        PRIMARY KEY,
    auction_id       BIGINT           REFERENCES auction_schema.auctions(id),
    bidder_id        BIGINT           NOT NULL,
    bidder_name      VARCHAR(255),
    bidder_email     VARCHAR(255),
    bid_amount       DOUBLE PRECISION NOT NULL,
    bid_time         TIMESTAMP        DEFAULT NOW()
);
```

---

## Appendix C: Complete Microservice Architecture Summary

**Table C.1 – All AgroLink Microservices**

| Service Name | Language | Port | Purpose |
|:-------------|:---------|:-----|:--------|
| `service-discovery` | Java (Spring Boot) | 8761 | Eureka service registry for all microservices |
| `config-server` | Java (Spring Boot) | 8888 | Centralised configuration management |
| `api-gateway` | Java (Spring Cloud Gateway) | 8080 | Single entry point; JWT validation; routing |
| `identityAndUser-service` | Java (Spring Boot) | 8081 | User registration, login, JWT issuance, password reset |
| `productCatalog-service` | Java (Spring Boot) | 8082 | Product listings, image uploads (AWS S3 presigned URLs) |
| `orderPayment-service` | Java (Spring Boot) | 8083 | Orders, Stripe payments, COD, bargaining, cart, reviews |
| `auction-service` | Java (Spring Boot) | 8084 | Live auctions, bidding, scheduled expiry and order retry |
| `chat-service` | Java (Spring Boot) | 8085 | Real-time WebSocket/STOMP encrypted messaging |
| `chatbot-service` | Java (Spring Boot / WebFlux) | 8086 | AI chatbot using Google Gemini API and FAQ knowledge base |
| `moderation-service` | Java (Spring Boot) | 8087 | User reports, content moderation, admin resolution |
| `crop-recommendation-service` | Python (Flask) | 5000 | RandomForest ML model for crop recommendation |

---

## Appendix D: User Interface Screenshots

*(Paste the following screenshots from your running system into the relevant locations below.
Each screenshot should occupy approximately half a page in your Word document.)*

- **[INSERT IMAGE D.1: Home page and features landing page (`/` and `/features`)]**
- **[INSERT IMAGE D.2: Farmer product listing creation form with image upload (`/seller/my-products`)]**
- **[INSERT IMAGE D.3: Live auction page with countdown timer and top-5 bids (`/buyer/bids`)]**
- **[INSERT IMAGE D.4: Real-time WebSocket chat interface with online presence indicator (`/buyer/chat`)]**
- **[INSERT IMAGE D.5: Buyer checkout page showing Stripe card and COD payment options (`/buyer/checkout`)]**
- **[INSERT IMAGE D.6: Python ML Crop Recommendation UI (`/crop`)]**
- **[INSERT IMAGE D.7: Admin dashboard showing platform statistics (`/admin/dashboard`)]**
- **[INSERT IMAGE D.8: Mobile responsive navigation (hamburger menu on a phone screen)]**

---

*Document prepared based on source code analysis of the AgroLink repository.*  
*Last updated: March 2026 | AgroLink Platform v1.x*
