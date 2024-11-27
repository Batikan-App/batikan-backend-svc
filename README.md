# Batikan APP C242-PS436

## Infrastructure Architecture

![infrastructure-schema](https://github.com/user-attachments/assets/4f32b7d0-f464-47ac-9066-944a7da4c6c1)

## API Documentation

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
2. Add batik items into cart
3. Update user's cart items quantity
4. Delete user's cart

#### Order Data Management
1. Get user's all orders
2. Add user's cart into order
3. Update user's order delivery status

#### Scan Batik Feature
1. Scan batik image

### Error Handling

#### Error Status HTTP Codes
1. `400 Bad Request`: Invalid input data.
2. `401 Unauthorized`: Missing or invalid authentication token.
3. `404 Not Found`: Resource not found.
4. `500 Internal Server Error`: Server encountered an error.

#### General Error Handling
1. Server error
2. Token session is not provided
3. Token session is expired
