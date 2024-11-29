# Batikan APP C242-PS436

## Table of Contents
* [Infrastructure Architecture](#infrastructure-architecture)
* [Setup Project](#setup-project)
* [Backend API Documentation](#backend-api-documentation)
  * [Overview](#overview)
  * [API Endpoint Route](#api-endpoint-route)
  * [API Endpoint Data](#api-endpoint-data)
    * [User Authentication Endpoints](#user-authentication-endpoints)
    * [User Profile Management](#user-profile-management)
    * [Batik Items Management](#batik-items-management)
    * [Cart Data Management](#cart-data-management)
    * [Order Data Management](#order-data-management)
    * [Scan Batik Feature](#scan-batik-feature)
  * [Error Handling](#error-handling)
    * [Error Status HTTP Codes](#error-status-http-codes)
    * [General Error Handling](#general-error-handling)
* [Firestore Database Structure](#firestore-database-structure)

---

## Infrastructure Architecture

![infrastructure-schema](https://github.com/user-attachments/assets/4f32b7d0-f464-47ac-9066-944a7da4c6c1)

## Setup Project

This project can be run locally using npm on your `Linux Host` using this step below.
1. Clone Project Repository
   ```bash
   $ # Clone Repository Branch
   $ git clone https://github.com/Batikan-App/batikan-backend-svc.git -b backend-api

   $ # Change directory into batikan-backend-svc
   $ cd batikan-backend-svc
   ```

2. Define `MODEL_URL` in file `.env` that locate file Model ML that used.
   ```bash
   $ # Please replace <bucket_name> with your own Cloud Storage Bucket
   $ echo "MODEL_URL='https://storage.googleapis.com/<bucket_name>/model/model.json'" > .env
   ```

3. Install NodeJS Project Modules that needed using
   ```bash
   $ npm install
   ```

4. Run NodeJS Project
   ```bash
   $ # Use this line below if you want to deploy it in Development Mode
   $ npm run start:dev

   $ # Use this line below if you want to deploy it in Production Mode
   $ npm run start
   ```

   Wait until shown text `Server listening on port 3000` that tell the Backend is ready to use.
   
> [!NOTE]
> If there any error due to connection Firestore, make sure to connect or give permission this Backend APP to the Firestore either login gcloud first if you run it locally or attach Service account into Cloud Run if you run it with Cloud Run.

---

## Backend API Documentation

This document provides information about API endpoints and their functionalities. This documentation focuses on Backend API of Batikan APP uses to GET, PUT, PATCH, POST, and DELETE data who consume by our Batikan Application.

### Overview

* API format is JSON (be nice and include a `Content-type: application/json` header to your request)
* This Backend API uses header `authorization` to identify sessions token, so make sure to fill up the header for make sure success request on all API Endpoint except for login and register process.
* The databases that uses in this Backend API is default databases in firestore named `(default)`. If you use custom firestore database names, make sure to change code to fit your need.

### API Endpoint Route

| Route                           | HTTP Method | Description                                   |
|---------------------------------|-------------|-----------------------------------------------|
| /api/auth/register              | POST        | Register a new user                           |
| /api/auth/login                 | POST        | Log in a user                                 |
| /api/auth/logout                | POST        | Log out a user                                |
| /api/user/profile               | GET         | Get user profile information                  |
| /api/user/profile               | PUT         | Update user profile information inc. password |
| /api/batik                      | GET         | Get all batik items                           |
| /api/batik/{id}                 | GET         | Get specific batik items by it's id           |
| /api/batik/search?q={keyword}   | GET         | Get batik items that match keyword            |
| /api/batik/origin?q={origin}    | GET         | Get batik items that match origin             |
| /api/user/cart                  | GET         | Get user's all cart items                     |
| /api/user/cart                  | POST        | Add batik items into cart                     |
| /api/user/cart                  | PATCH       | Update user's cart items quantity             |
| /api/user/cart                  | DELETE      | Delete user's cart                            |
| /api/user/order                 | GET         | Get user's all orders                         |
| /api/user/order                 | POST        | Add user's cart into order                    |
| /api/user/order                 | PUT         | Update user's order delivery status           |
| /api/batik/scan                 | POST        | Perform scanning image to identify batik      |

### API Endpoint Data

#### User Authentication Endpoints
1. Register a new user
   * **Endpoint**: `/api/auth/register`
   * **Method**: `POST`
   * **Body Parameters**:
     | Field             | Type     | Description                  | Constraints                                 |
     |-------------------|----------|------------------------------|---------------------------------------------|
     | `name`            | `string` | Full name of the user        | Required                                    |
     | `email`           | `string` | Email address of the user    | Required, must be a valid email             |
     | `phone`           | `string` | Phone number                 | Required                                    |
     | `password`        | `string` | Password for the account     | Required                                    |
     | `verify_password` | `string` | Password verification        | Required, must match `password`             |
         
   * **Example Request**:
     ```json
     {
        "name": "Aldi Khan Sakti Alvayadi",
        "email": "aldialvayadi@example.com",
        "phone": "1234567890",
        "password": "inirahasia",
        "verify_password": "inirahasia"
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "User registered successfully"
       }
       ```
     - Email account is already existed.
       ```json
       {
          "status": "failed",
          "message": "Users email is already existed!"
       }
       ```
     - Verify password wrong.
       ```json
       {
          "status": "failed",
          "message": "Verify password is wrong!"
       }
       ```
   
2. Log in a user
   * **Endpoint**: `/api/auth/login`
   * **Method**: `POST`
   * **Body Parameters**:
     | Field             | Type     | Description                  | Constraints                                 |
     |-------------------|----------|------------------------------|---------------------------------------------|
     | `email`           | `string` | Email address of the user    | Required, must be a valid email             |
     | `password`        | `string` | Password for the account     | Required                                    |
     
   * **Example Request**:
     ```json
     {
        "email": "aldialvayadi@example.com",
        "password": "inirahasia"
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Login successful",
          "token": "af2508e6-1687-40a8-9abf-e478aec3dbcc"
       }
       ```
     - Invalid credentials.
       ```json
       {
          "status": "failed",
          "message": "Invalid credentials"
       }
       ```
     
3. Log out a user
   * **Endpoint**: `/api/auth/logout`
   * **Method**: `POST`
   * **Body Parameters**: `none`
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Logged out successfully"
       }
       ```

#### User Profile Management
1. Get user profile information
   * **Endpoint**: `/api/user/profile`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": {
              "name": "Aldi Khan Sakti Alvayadi",
              "email": "aldialvayadi@example.com",
              "phone": "1234567890"
          }
       }
       ```
       
     - User information not found.
       ```json
       {
          "status": "failed",
          "message": "User not found"
       }
       ```
       
2. Update user profile inc. password
   * **Endpoint**: `/api/user/profile`
   * **Method**: `PUT`
   * **Body Parameters**:
     | Field             | Type     | Description                  | Constraints                                 |
     |-------------------|----------|------------------------------|---------------------------------------------|
     | `name`            | `string` | Full name of the user        | Required                                    |
     | `email`           | `string` | Email address of the user    | Required, must be a valid email             |
     | `phone`           | `string` | Phone number                 | Required                                    |
     | `password`        | `string` | Password for the account     | Optional                                    |
     | `verify_password` | `string` | Password verification        | Required if `password` also fill up         |
     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Request**:
     ```json
     {
        "name": "aksa",
        "email": "aldialvayadi@example.com",
        "phone": "123",
        "password": "ini",
        "verify_password": "ini",
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Profile updated successfully"
       }
       ```
     - User information not found.
       ```json
       {
          "status": "failed",
          "message": "User not found"
       }
       ```

#### Batik Items Management
1. Get all batik items
   * **Endpoint**: `/api/batik`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": [
              {
                  "id": "G9F53OHaHpNmDSJv4anr",
                  "data": {
                      "name": "Kawung",
                      "img": "<public_url_image_in_cloud_storage>",
                      "origin": "Yogyakarta",
                      "price": 34000,
                      "desc": "Batik Kawung adalah motif batik tradisional Jawa yang sangat khas. Motifnya berupa bulatan-bulatan yang menyerupai buah kawung (sejenis kelapa) yang disusun secara geometris. Pola ini melambangkan kesempurnaan, kesucian, dan keagungan. Batik kawung memiliki sejarah yang panjang dan erat kaitannya dengan kerajaan-kerajaan di Jawa. Motif ini tidak hanya indah secara visual, tetapi juga sarat akan makna filosofis yang mendalam.",
                      "sold": 30,
                      "stock": 70
                  }
              },
              ....
          ]
       }
       ```

2. Get specific batik items by Id
   * **Endpoint**: `/api/batik/{id}`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example Request Endpoint**: `/api/batik/G9F53OHaHpNmDSJv4anr`     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
         
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": [
              {
                  "id": "G9F53OHaHpNmDSJv4anr",
                  "data": {
                      "name": "Kawung",
                      "img": "<public_url_image_in_cloud_storage>",
                      "origin": "Yogyakarta",
                      "price": 34000,
                      "desc": "Batik Kawung adalah motif batik tradisional Jawa yang sangat khas. Motifnya berupa bulatan-bulatan yang menyerupai buah kawung (sejenis kelapa) yang disusun secara geometris. Pola ini melambangkan kesempurnaan, kesucian, dan keagungan. Batik kawung memiliki sejarah yang panjang dan erat kaitannya dengan kerajaan-kerajaan di Jawa. Motif ini tidak hanya indah secara visual, tetapi juga sarat akan makna filosofis yang mendalam.",
                      "sold": 30,
                      "stock": 70
                  }
              }
          ]
       }
       ```
       
     - Batik not found.
       ```json
       {
          "status": "failed",
          "message": "Batik not found"
       }
       ```
       
3. Get batik items that match keyword
   * **Endpoint**: `/api/batik/search?q={keyword}`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example Request Query Parameters**: `/api/batik/search?q=Kawung`     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
         
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": [
              {
                  "id": "G9F53OHaHpNmDSJv4anr",
                  "data": {
                      "name": "Kawung",
                      "img": "<public_url_image_in_cloud_storage>",
                      "origin": "Yogyakarta",
                      "price": 34000,
                      "desc": "Batik Kawung adalah motif batik tradisional Jawa yang sangat khas. Motifnya berupa bulatan-bulatan yang menyerupai buah kawung (sejenis kelapa) yang disusun secara geometris. Pola ini melambangkan kesempurnaan, kesucian, dan keagungan. Batik kawung memiliki sejarah yang panjang dan erat kaitannya dengan kerajaan-kerajaan di Jawa. Motif ini tidak hanya indah secara visual, tetapi juga sarat akan makna filosofis yang mendalam.",
                      "sold": 30,
                      "stock": 70
                  }
              },
              ....
          ]
       }
       ```
       
     - Query parameter not found.
       ```json
       {
          "status": "failed",
          "message": "Query parameter is required"
       }
       ```

     - Data not found.
       ```json
       {
          "status": "failed",
          "message": "No documents found with keyword \"Trantum\""
       }
       ```

     - Process error while search data.
       ```json
       {
          "status": "error",
          "message": "An error occurred while processing the request"
       }
       ```

4. Get batik items that match origin
   * **Endpoint**: `/api/batik/origin?q={origin}`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example Request Query Parameters**: `/api/batik/origin?q=Yogya`     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
         
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": [
              {
                  "id": "G9F53OHaHpNmDSJv4anr",
                  "data": {
                      "name": "Kawung",
                      "img": "<public_url_image_in_cloud_storage>",
                      "origin": "Yogyakarta",
                      "price": 34000,
                      "desc": "Batik Kawung adalah motif batik tradisional Jawa yang sangat khas. Motifnya berupa bulatan-bulatan yang menyerupai buah kawung (sejenis kelapa) yang disusun secara geometris. Pola ini melambangkan kesempurnaan, kesucian, dan keagungan. Batik kawung memiliki sejarah yang panjang dan erat kaitannya dengan kerajaan-kerajaan di Jawa. Motif ini tidak hanya indah secara visual, tetapi juga sarat akan makna filosofis yang mendalam.",
                      "sold": 30,
                      "stock": 70
                  }
              },
              ....
          ]
       }
       ```
       
     - Query parameter not found.
       ```json
       {
          "status": "failed",
          "message": "Query parameter is required"
       }
       ```

     - Data not found.
       ```json
       {
          "status": "failed",
          "message": "No documents found with origin containing \"Amerika\""
       }
       ```

     - Process error while search data.
       ```json
       {
          "status": "error",
          "message": "An error occurred while processing the request"
       }
       ```

#### Cart Data Management
1. Get user's all cart items
   * **Endpoint**: `/api/user/cart`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": {
              "cartItem": [
                  {
                      "name": "Kawung",
                      "img": "<public_url_image_in_cloud_storage>",
                      "quantity": 30,
                      "price": 50000
                  }
              ],
              "totalPrice": 1500000
          }
       }
       ```

2. Add batik items into cart
   * **Endpoint**: `/api/user/cart`
   * **Method**: `POST`
   * **Body Parameters**:
     | Field             | Type      | Description                  | Constraints                                 |
     |-------------------|-----------|------------------------------|---------------------------------------------|
     | `itemId`          | `string`  | ID of Batik items            | Required                                    |
     | `quantity`        | `integer` | Quantity of Batik items      | Required                                    |
     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Request**:
     ```json
     {
        "itemId": "G9F53OHaHpNmDSJv4anr",
        "quantity": 30
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Item added to cart successfully",
          "cartId": "ca1ac7d8a0a8b8288f122ef36841b628"
       }
       ```
     - Failed to add item into cart.
       ```json
       {
          "status": "failed",
          "message": "Failed to add item to cart"
       }
       ```

3. Update user's cart items quantity
   * **Endpoint**: `/api/user/cart`
   * **Method**: `PATCH`
   * **Body Parameters**:
     | Field             | Type      | Description                  | Constraints                                 |
     |-------------------|-----------|------------------------------|---------------------------------------------|
     | `itemId`          | `string`  | ID of Batik items            | Required                                    |
     | `quantity`        | `integer` | Quantity of Batik items      | Required                                    |
     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Request**:
     ```json
     {
        "itemId": "G9F53OHaHpNmDSJv4anr",
        "quantity": 10
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Item updated to cart successfully",
       }
       ```
     - Failed to update item quantity.
       ```json
       {
          "status": "failed",
          "message": "Failed to update item quantity"
       }
       ```

4. Delete user's cart
   * **Endpoint**: `/api/user/cart`
   * **Method**: `DELETE`
   * **Body Parameters**: `none`
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Cart successfully deleted",
       }
       ```
     - Failed to delete cart.
       ```json
       {
          "status": "failed",
          "message": "Failed to delete cart"
       }
       ```

#### Order Data Management
1. Get user's all orders
   * **Endpoint**: `/api/user/order`
   * **Method**: `GET`
   * **Body Parameters**: `none`
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "data": {
              "userId": "6d3660ad499ac6b1e55cf263b8c912a1",
              "orders": [
                  {
                      "orderId": "TznPrqKGz0uqmlgs8Ydf",
                      "createdAt": {
                          "_seconds": 1732701505,
                          "_nanoseconds": 465000000
                      },
                      "totalPayment": 1020000,
                      "name": "Aldi Khan Sakti Alvayadi",
                      "phone": "0812456987124",
                      "address": "Jl. Kenangan",
                      "status": "Delivered",
                      "userId": "6d3660ad499ac6b1e55cf263b8c912a1",
                      "updatedAt": {
                          "_seconds": 1732701505,
                          "_nanoseconds": 465000000
                      },
                      "items": [
                          {
                              "name": "Kawung",
                              "img": "<public_url_image_in_cloud_storage>",
                              "quantity": 30,
                              "price": 34000
                           }
                      ]
                  }
              ]
          }
       }
       ```

2. Add user's cart into order
   * **Endpoint**: `/api/user/order`
   * **Method**: `POST`
   * **Body Parameters**:
     | Field             | Type      | Description                  | Constraints                                 |
     |-------------------|-----------|------------------------------|---------------------------------------------|
     | `name`            | `string`  | Full name of the user        | Required                                    |
     | `phone`           | `string`  | Phone number                 | Required                                    |
     | `address`         | `string`  | User delivery address        | Required, must be a valid email             |
     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Request**:
     ```json
     {
        "name": "Aldi Khan Sakti Alvayadi",
        "phone": "0812456987124",
        "address": "Jl. Kenangan"
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Order added successfully",
          "data": {
              "orderId": "TznPrqKGz0uqmlgs8Ydf",
              "totalPayment": 1020000
          }
       }
       ```

3. Update user's order delivery status
   * **Endpoint**: `/api/user/order`
   * **Method**: `PUT`
   * **Body Parameters**:
     | Field             | Type      | Description                  | Constraints                                 |
     |-------------------|-----------|------------------------------|---------------------------------------------|
     | `orderId`         | `string`  | Order ID user                | Required                                    |
     | `status`          | `string`  | Delivery status order        | Required                                    |
     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Request**:
     ```json
     {
        "orderId": "TznPrqKGz0uqmlgs8Ydf",
        "status": "Delivered"
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Order updated successfully",
       }
       ```

#### Scan Batik Feature
1. Scan batik image
   * **Endpoint**: `/api/batik/scan`
   * **Method**: `POST`
   * **Body Parameters**:
     | Field             | Type      | Description                  | Constraints                                 |
     |-------------------|-----------|------------------------------|---------------------------------------------|
     | `image`           | `file`    | Photo image of Batik         | Required, maximum size of image is 1 MB     |
     
   * **Example HTTP Headers Authorization**:
     ```curl
     authorization: 8fae42a0-9a0c-4c9d-81e4-19417b409c2e
     ```
     
   * **Example Request**:
     ```json
     {
        "image": <image_file>
     }
     ```
     
   * **Example Response**:
     - Successfull Response.
       ```json
       {
          "status": "success",
          "message": "Model is predicted successfully",
          "data": {
              "batikId": "rRsxZMgPOOIaLQz6RmwC",
              "confidence": "99.98%",
              "data": {
                  "desc": "Motif utama dari batik ini adalah gambar awan yang bergulung-gulung, menyerupai awan mendung. Namun, awan yang digambarkan tidak selalu berwarna gelap dan suram, melainkan sering kali diwarnai cerah dan penuh harapan.",
                  "origin": "Cirebon, Jawa Barat",
                  "img": "<public_url_image_in_cloud_storage>",
                  "name": "Mega Mendung",
                  "price": 55000,
                  "stock": 100,
                  "sold": 0
              }
          }
       }
       ```
       
### Error Handling

#### Error Status HTTP Codes
1. `400 Bad Request`: Invalid input data.
2. `401 Unauthorized`: Missing or invalid authentication token.
3. `404 Not Found`: Resource not found.
4. `500 Internal Server Error`: Server encountered an error.

#### General Error Handling
1. Server error
   * Response Body
     ```json
     {
        "status": "failed",
        "message": "Invalid request data"
     }
     ```

2. Token session is not provided
   * Response Body
     ```json
     {
        "status": "failed",
        "message": "Unauthorized"
     }
     ```

3. Token session is expired
     ```json
     {
        "status": "failed",
        "message": "Session expired"
     }
     ```

4. Token session is invalid
     ```json
     {
        "status": "failed",
        "message": "Invalid session"
     }
     ```

5. Insufficient stock items
     ```json
     {
        "status": "failed",
        "message": "Insufficient stock for item {item_name}."
     }
     ```

6. Order ID that requested is not authorized
     ```json
     {
        "status": "failed",
        "message": "Order ID is not authorized!"
     }
     ```

---

## Firestore Database Structure
### **Overview**

The backend uses **Firestore** as the database to store data. Below is an explanation of the collections, documents, and their fields.

### **Collections and Documents**

#### 1. **`users` Collection**
- **Description**: Stores user information for authentication and profile management.
- **Structure**:
  ```yaml
  users (Collection)
  └── {userId} (Document)
       ├── id: string (Reference to `users/{userId}`)
       ├── name: string
       ├── email: string
       ├── phone: string
       └── password: string
  ```

#### 2. **`sessions` Collection**
- **Description**: Stores user session information for authorization.
- **Structure**:
  ```yaml
  sessions (Collection)
  └── {token} (Document)
       ├── id: string (Reference to `sessions/{token}`)
       ├── userId: string (Reference to `users/{userId}`)
       ├── created_at: timestamp
       └── expired_at: timestamp
  ```

#### 3. **`batik` Collection**
- **Description**: Stores information about batik items.
- **Structure**:
  ```yaml
  batik (Collection)
  └── {batikId} (Document)
       ├── name: string
       ├── desc: string
       ├── origin: string
       ├── img: string
       ├── price: integer
       ├── sold: integer
       └── stock: integer
  ```

#### 4. **`carts` Collection**
- **Description**: Stores carts made by users.
- **Structure**:
  ```yaml
  carts (Collection)
  └── {cartId} (Document) (Reference to `users/{userId}`)
       ├── createdAt: timestamp
       ├── totalPrice: integer
       └── items (Collection)
            └── {batikId} (Document) (Reference to `batik/{batikId}`)
                 ├── img: string
                 ├── name: string
                 ├── price: integer
                 └── quantity: integer
  ```

#### 5. **`orders` Collection**
- **Description**: Stores orders made by users.
- **Structure**:
  ```yaml
  orders (Collection)
  └── {orderId} (Document)
       ├── userId: string (Reference to `users/{userId}`)
       ├── totalPrice: number
       ├── status: string
       ├── createdAt: timestamp
       ├── updatedAt: timestamp
       └── items (Collection)
            └── {batikId} (Document) (Reference to `batik/{batikId}`)
                 ├── img: string
                 ├── name: string
                 ├── price: integer
                 └── quantity: integer
  ```
  
