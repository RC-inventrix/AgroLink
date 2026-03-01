# AgroLink — Frequently Asked Questions (FAQ)

> **Purpose:** This document serves as the knowledge base for the AgroLink customer support chatbot. It covers platform navigation and user capabilities for **Buyers**, **Farmers (Sellers)**, and **Administrators**.

---

## Table of Contents

1. [General / Getting Started](#1-general--getting-started)
2. [Account Management](#2-account-management)
3. [For Buyers — Browsing & Shopping](#3-for-buyers--browsing--shopping)
4. [For Buyers — Cart & Checkout](#4-for-buyers--cart--checkout)
5. [For Buyers — Orders](#5-for-buyers--orders)
6. [For Buyers — Auctions & Bidding](#6-for-buyers--auctions--bidding)
7. [For Buyers — Bargaining](#7-for-buyers--bargaining)
8. [For Buyers — Crop Requirements](#8-for-buyers--crop-requirements)
9. [For Farmers (Sellers) — Product Listings](#9-for-farmers-sellers--product-listings)
10. [For Farmers (Sellers) — Orders & Fulfilment](#10-for-farmers-sellers--orders--fulfilment)
11. [For Farmers (Sellers) — Auctions](#11-for-farmers-sellers--auctions)
12. [For Farmers (Sellers) — Bargaining & Item Requests](#12-for-farmers-sellers--bargaining--item-requests)
13. [Chat & Messaging](#13-chat--messaging)
14. [Reviews & Ratings](#14-reviews--ratings)
15. [Reporting & Moderation](#15-reporting--moderation)
16. [Admin Panel](#16-admin-panel)
17. [Technical & General Help](#17-technical--general-help)

---

## 1. General / Getting Started

### What is AgroLink?
AgroLink is a farmer-friendly web platform that directly connects local farmers with buyers and vendors, eliminating the need for middlemen. Farmers can list and sell their produce, while buyers gain access to fresh, quality agricultural products. The platform also supports features like live auctions, price bargaining, direct messaging, and crop requirement postings.

### Who can use AgroLink?
There are three types of users on the platform:
- **Buyers** – individuals or businesses who want to purchase agricultural products.
- **Farmers / Sellers** – agricultural producers who want to list and sell their produce.
- **Administrators** – platform staff who oversee moderation, user management, and system health.

### How do I access AgroLink?
Open your web browser and navigate to the AgroLink platform URL. From the home page you can explore features, register a new account, or log in to an existing one.

### What pages are available without logging in?
The following pages are publicly accessible:
- **Home (`/`)** – landing page with a platform overview.
- **Features (`/features`)** – a showcase of all platform capabilities.
- **About (`/about`)** – information about AgroLink and its mission.
- **Login (`/login`)** and **Register (`/register`)** – account access pages.

---

## 2. Account Management

### How do I create an account?
1. Click **Register** on the home page or navigate to `/register`.
2. Choose your account type: **Buyer** or **Farmer**.
3. Fill in your full name, email address, and a secure password.
4. Submit the form. You will be logged in automatically upon successful registration.

### How do I log in?
1. Click **Login** on the navigation bar or go to `/login`.
2. Enter your registered email address and password.
3. Click **Log In**. You will be redirected to your role-specific dashboard.

### I forgot my password. What should I do?
1. On the login page, click **Forgot Password**.
2. Enter your registered email address on the `/forgot-password` page.
3. Follow the instructions sent to your email to reset your password.

### How do I check if my email is already registered?
The platform automatically checks for duplicate emails during registration. If you enter an email that is already in use, you will be prompted to log in instead.

### How do I update my profile?
1. Log in and navigate to your **User Profile** page (accessible via the top navigation or at `/buyer/user-profile` for buyers, `/seller/user-profile` for sellers).
2. Update your name, contact details, or any other information.
3. Click **Save Changes** to apply the updates.

### How do I log out?
Click your avatar or username in the top navigation bar, then select **Logout**. You will be securely signed out and redirected to the home page.

---

## 3. For Buyers — Browsing & Shopping

### How do I browse available products?
After logging in as a buyer, visit your **Buyer Dashboard** (`/buyer/dashboard`) or go to the **Vegetable & Product List** page. You can scroll through all available listings from farmers on the platform.

### Can I search or filter products?
Yes. The product listing page includes search and filter options to help you find specific items by name, category, or other criteria.

### How do I view the details of a product?
Click on any product card to open its detail page. Here you can see the product description, available quantity, images, and the seller's information.

---

## 4. For Buyers — Cart & Checkout

### How do I add a product to my cart?
On the product detail page, select your desired quantity and click **Add to Cart**. You can continue shopping and add more items.

### How do I view my cart?
Click the **Cart** icon in the navigation bar to view all items you have added. You can review item quantities and remove any items you no longer want before proceeding.

### How do I remove an item from my cart?
In your cart, click the **Remove** or **Delete** icon next to the item you want to remove.

### How do I checkout?
1. From your cart, click **Proceed to Checkout**.
2. You will be taken to the checkout page (`/buyer/checkout`), where you can review your order summary.
3. Choose a payment method:
   - **Online Payment (Stripe):** Enter your card details securely via the Stripe payment gateway.
   - **Cash on Delivery (COD):** Select this option to pay when your order arrives.
4. Confirm your order. A success page will confirm your purchase.

### What payment methods are accepted?
AgroLink currently supports two payment methods:
- **Online card payment** via Stripe (secure, encrypted).
- **Cash on Delivery (COD)** for eligible orders.

---

## 5. For Buyers — Orders

### How do I view my orders?
Navigate to **Order History** at `/buyer/order-history` to see all your past and completed orders. For orders that are still being processed, visit **Pending Orders** at `/buyer/pending-orders`.

### How do I track the status of an order?
Open the specific order from your Order History or Pending Orders page. The order detail view shows the current status (e.g., *Pending*, *Confirmed*, *Shipped*, *Delivered*).

### What happens if my order is cancelled?
If a seller cancels your order, you will receive a cancellation notification. You can view all such notifications and their details under your **Buyer Dashboard** or the order notifications section.

### How do I view a cancellation notice?
1. Go to your **Pending Orders** page.
2. Click on the notification or the relevant order to see the full cancellation details, including the reason provided by the seller.
3. You can mark notifications as read once reviewed.

---

## 6. For Buyers — Auctions & Bidding

### What is an auction on AgroLink?
Farmers can list products for time-limited auctions where buyers place competing bids. The highest bid when the auction ends wins the product.

### How do I find active auctions?
Navigate to the **Bids / Auctions** section from your buyer dashboard (`/buyer/bids`). All currently active auctions are listed here.

### How do I place a bid?
1. Open the auction listing you are interested in.
2. Enter your bid amount (it must be higher than the current highest bid).
3. Click **Place Bid** to submit.
4. The top 5 bids for each auction are visible on the auction detail page.

### How do I know if I won an auction?
When an auction ends (either at the scheduled time or when ended early by the farmer), the platform identifies the highest bidder as the winner. You will be notified of the outcome, and an order will be automatically created for the winning bid.

### Can I view my bidding history?
Yes. The **Bids** page (`/buyer/bids`) shows all auctions you have participated in, along with your bid status.

---

## 7. For Buyers — Bargaining

### What is the Bargaining feature?
Bargaining allows buyers to negotiate the price of a product directly with the farmer before placing an order. Instead of paying the listed price, you can propose a price you are comfortable with.

### How do I initiate a bargain?
1. Open the product listing you want to bargain on.
2. Click the **Bargain** or **Negotiate Price** option.
3. Enter your proposed price and submit the request.
4. The farmer will review and either accept or reject your offer.

### Where can I see my bargaining activity?
Visit the **Bargain History** page at `/buyer/bargain-history` to see all bargains you have initiated, along with their current status (pending, accepted, or rejected).

### What happens if the farmer accepts my bargain?
Once a farmer accepts your bargain offer, you can proceed to place an order at the negotiated price.

### What happens if the farmer rejects my bargain?
You will see the rejection in your bargain history. You may choose to purchase the item at the original listed price or negotiate again.

---

## 8. For Buyers — Crop Requirements

### What is the Crop Requirements feature?
This feature lets buyers post a request for a specific agricultural product they need — including details like crop type, quantity, and any special requirements. Farmers who can fulfil the request can then respond with an offer.

### How do I post a crop requirement?
1. Go to **My Requests** at `/buyer/requests`.
2. Click **Post a New Requirement**.
3. Fill in the crop name, quantity needed, and any other relevant details.
4. Submit your requirement. Farmers will be able to see and respond to it.

### How do I manage my posted requirements?
On the `/buyer/requests` page, you can view all your active requirements. You can edit or delete any requirement that has not yet been fulfilled.

### How do I respond to a farmer's offer?
When a farmer submits an offer for your requirement, you will see it listed under the relevant requirement. You can review the offer details and choose to **Accept** or **Reject** it.

---

## 9. For Farmers (Sellers) — Product Listings

### How do I create a product listing?
1. Log in as a Farmer and go to **My Products** at `/seller/my-products`.
2. Click **Add New Product**.
3. Fill in the product name, description, available quantity, and category.
4. Upload product images (stored securely on AWS S3).
5. Set your asking price. The platform may suggest a fair price based on AI analysis.
6. Click **Save / Publish** to make your listing visible to buyers.

### How do I edit an existing product listing?
1. Navigate to **My Products** at `/seller/my-products`.
2. Find the product you want to edit and click the **Edit** button.
3. Update the relevant fields and click **Save Changes**.

### How do I delete a product listing?
On the **My Products** page, click the **Delete** button next to the product you want to remove. Confirm the action when prompted.

### How do I upload product images?
When creating or editing a product, an image upload option is provided. The platform generates a secure, pre-signed URL linked to AWS S3 storage, so your image is uploaded directly and securely.

### What is the AI price suggestion?
When you create a new product listing, the platform can automatically suggest a fair market price based on available data. This is a guide to help you set a competitive and fair price, but you are free to set your own price.

### How do I view all my product listings?
Go to **My Products** (`/seller/my-products`) to see a complete list of all your active and inactive listings.

---

## 10. For Farmers (Sellers) — Orders & Fulfilment

### How do I view orders I have received?
Navigate to **My Orders** at `/seller/orders`. This page displays all orders placed by buyers for your products.

### How do I update an order's status?
1. On the **My Orders** page, find the relevant order.
2. Click on it to open the order details.
3. Use the **Update Status** option to change the status (e.g., from *Confirmed* to *Shipped*, or *Shipped* to *Delivered*).

### How do I view my seller dashboard?
Go to `/seller/dashboard` to see an overview of your sales, recent orders, and other key metrics.

---

## 11. For Farmers (Sellers) — Auctions

### How do I create an auction?
1. Navigate to **My Auctions** at `/seller/auctions`.
2. Click **Create New Auction**.
3. Select the product, set a reserve price (minimum acceptable bid), and choose a start and end time.
4. Submit the auction. It will become visible to buyers when it starts.

### Can I start an auction immediately?
Yes. When creating or managing an auction, you can choose to **Start Now** to make the auction go live immediately without waiting for the scheduled start time.

### Can I change the auction time or reserve price after creating it?
Yes. From the **My Auctions** page, you can:
- Update the auction's **start and end times**.
- Change the **reserve price**.

### Can I cancel an auction?
Yes. You can cancel an auction from the **My Auctions** page as long as it has not yet been completed.

### Can I end an auction early?
Yes. You can choose to **End Early** from the auction management options, which will immediately close the auction and determine the winner based on the highest bid at that time.

### How do I see my past and active auctions?
The **My Auctions** page (`/seller/auctions`) lists all your auctions. You can filter them by status (e.g., *Active*, *Completed*, *Cancelled*).

---

## 12. For Farmers (Sellers) — Bargaining & Item Requests

### How do I view bargain offers from buyers?
Go to **My Bargains** at `/seller/bargains`. All price negotiation requests from buyers are listed here, along with the product and proposed price.

### How do I respond to a bargain offer?
1. On the **My Bargains** page, open the bargain offer you want to respond to.
2. Click **Accept** to agree to the buyer's proposed price, or **Reject** to decline it.

### How do I view buyer crop requirements?
Go to **Item Requests** at `/seller/item-requests`. This page shows all crop requirements posted by buyers that may match what you grow or have available.

### How do I submit an offer for a buyer's requirement?
1. On the **Item Requests** page, find a requirement you can fulfil.
2. Click **Submit Offer** and provide your offer details (quantity available, your price).
3. Submit the offer. The buyer will then review and respond.

---

## 13. Chat & Messaging

### How do I contact a farmer or buyer?
Both buyers and farmers have access to a **Chat** feature:
- Buyers: navigate to `/buyer/chat`.
- Sellers: navigate to `/seller/chat`.

Click on a contact from your conversation list to open the chat window and start messaging.

### Is my chat history saved?
Yes. Your full conversation history with each contact is stored and can be accessed at any time by opening that conversation.

### Are messages private and secure?
Yes. All messages are encrypted end-to-end. Only you and the person you are chatting with can read the messages.

### How do I see my list of conversations?
When you open the Chat page, the left panel shows a list of all your existing conversations, sorted by most recent activity.

### Can I see if someone is online?
Yes. The chat interface displays an **online status indicator** next to each contact so you can see who is currently active on the platform.

### How do I know if I have unread messages?
The navigation bar displays an **unread message count badge** on the Chat icon. You can also see unread counts per conversation in your contacts list.

### Can I delete a conversation?
Yes. You can remove a conversation from your contacts list. This is a **soft delete**, meaning the conversation is hidden from your view but the messages are not permanently destroyed.

---

## 14. Reviews & Ratings

### Can I leave a review for a product or farmer?
Yes. After an order is delivered, buyers can submit a review and star rating for that order from the Order History page.

### How do I submit a review?
1. Go to **Order History** at `/buyer/order-history`.
2. Find the completed order and click **Leave a Review**.
3. Enter your written review and select a star rating (1–5 stars).
4. Submit your review.

### Where can I see a seller's reviews and ratings?
Each seller's profile and product listings display their overall rating and individual reviews submitted by past buyers.

### Can I see all reviews I have written?
Reviews are accessible from the order detail view in your Order History.

---

## 15. Reporting & Moderation

### How do I report a user or inappropriate content?
1. Navigate to the user's profile or the content in question.
2. Click the **Report** option.
3. Select the reason for the report (e.g., Fraud, Inappropriate Content, Spam).
4. Add any additional details and submit.

### Can I see the reports I have submitted?
Yes. You can view all reports you have submitted from your account settings or profile page under the **My Reports** section.

### What happens after I submit a report?
Your report is sent to the AgroLink moderation team. An administrator will review the report and take appropriate action. You will not be notified of the specific outcome, but all reports are taken seriously and investigated.

### What types of issues can I report?
You can report issues including, but not limited to:
- **Fraud** – deceptive listings or scam attempts.
- **Inappropriate Content** – offensive descriptions or images.
- **Spam** – unsolicited or repetitive messages/listings.

---

## 16. Admin Panel

### How do I access the Admin Panel?
The Admin Panel is only available to designated administrators. Access it by navigating to `/admin/login` and entering your admin credentials.

### What can an administrator do on the platform?
Administrators have access to:
- **Admin Dashboard (`/admin/dashboard`):** An overview of platform health, user statistics (total users, active farmers, active buyers), and recent activity.
- **Reports Management:** View all reports submitted by users and resolve or dismiss them after investigation.
- **User Management:** Monitor registered users and their roles across the platform.

### How does an admin resolve a report?
1. Log in to the Admin Panel and navigate to the **Reports** section.
2. Find the open report and click on it for full details.
3. Review the information and click **Resolve** to close the report after taking any necessary action.

---

## 17. Technical & General Help

### What web browsers are supported?
AgroLink is designed to work on all modern web browsers, including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. For the best experience, keep your browser up to date.

### Is AgroLink mobile-friendly?
Yes. The platform uses a responsive design built with TailwindCSS, ensuring a smooth experience on smartphones, tablets, and desktop computers.

### My page is not loading. What should I do?
Try the following steps:
1. Refresh the page (press `F5` or `Ctrl + R`).
2. Clear your browser's cache and cookies, then reload.
3. Check your internet connection.
4. Try a different browser.
5. If the problem persists, please contact support.

### My session expired. What should I do?
AgroLink uses JWT-based authentication with a session timeout. If you are logged out unexpectedly, simply log in again. Your saved data (products, orders, cart) will still be there.

### I uploaded a product image but it is not showing. What should I do?
Image uploads go through a secure pre-signed URL process. Ensure you have a stable internet connection during the upload. If the image still does not appear after refreshing, try uploading again. Contact support if the issue continues.

### How do I contact AgroLink support?
If you cannot find an answer in this FAQ, please reach out through the **Contact** or **Help** section available on the platform, or message the support team directly.

---

*Last updated: March 2026 | AgroLink Platform v1.x*
