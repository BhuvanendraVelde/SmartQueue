# SmartQueue
# SmartQueue – QR-Based Online Queue Management System

## Overview

SmartQueue is a QR-Based Online Queue Management System developed for the College Examination Branch. The system enables students to join a queue digitally by scanning a QR code and submitting their service requests online. It reduces waiting time, eliminates manual queue management, and improves service efficiency.

## Problem Statement

In many colleges, students must stand in long queues at the examination branch for services such as fee payment, hall ticket collection, certificate collection, and query resolution. Manual queue management leads to crowding, delays, and inconvenience.

SmartQueue addresses this problem by providing a digital queue management solution that allows students to generate tokens online and receive notifications when their turn arrives.

## Objectives

* Eliminate physical queues in the examination branch.
* Provide online token generation through QR code scanning.
* Enable administrators to manage student requests efficiently.
* Notify students when their token is being served.
* Improve transparency and reduce waiting time.

## Features

### Student Features

* QR Code Based Access
* Online Queue Registration
* Token Generation
* Queue Position Tracking
* Estimated Waiting Time
* Email Notifications
* Mobile-Friendly Interface

### Admin Features

* Secure Admin Login
* View Student Queue
* Filter Requests by Service Type
* Serve Students Token-Wise
* Send Email Notifications
* Manage Queue Status

## Services Supported

* Paying Examination Fee
* Hall Ticket Collection
* Certificate Collection
* Student Queries and Consultation

## System Architecture

Student → QR Code → Online Form → Token Generation → Queue Management → Admin Dashboard → Email Notification

## Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Data Storage

* JSON File Storage

### Additional Tools

* SendGrid Email Service
* QR Code Generator API
* Git & GitHub

## Project Modules

### 1. QR Display Module

Displays a QR code that redirects students to the registration form.

### 2. Student Registration Module

Collects student information and service requests.

### 3. Token Management Module

Generates unique queue tokens and maintains token sequence.

### 4. Queue Tracking Module

Shows queue position and estimated waiting time.

### 5. Admin Dashboard Module

Allows administrators to monitor and manage the queue.

### 6. Notification Module

Sends email notifications when a student's turn arrives.

## Benefits

* Reduces waiting time
* Eliminates overcrowding
* Improves service efficiency
* Provides real-time queue tracking
* Enhances student experience

## Future Enhancements

* SMS Notifications
* Database Integration (MySQL/MongoDB)
* Multi-Department Queue Management
* AI-Based Wait Time Prediction
* Mobile Application Support

## Screenshots

### QR Code Home Page

<img width="1882" height="854" alt="QRCode" src="https://github.com/user-attachments/assets/66d33674-ce2d-4ab4-ac85-a1be7477e8dd" />


### Student Registration Form

<img width="738" height="1600" alt="StudentRegistrationForm" src="https://github.com/user-attachments/assets/bad64daf-38cd-4723-a5e8-e3ca527fd65e" />


### Token Generation & Queue Status

<img width="739" height="695" alt="TokenGeneration" src="https://github.com/user-attachments/assets/f50c54a7-66fa-4234-86b5-00e3a621a24f" />


### Admin Login

<img width="1403" height="801" alt="AdminLogin" src="https://github.com/user-attachments/assets/0659d20d-bec5-451d-a95e-ddefcd810a26" />


### Admin Dashboard

<img width="1600" height="640" alt="AdminDashBoard" src="https://github.com/user-attachments/assets/cc6a4ad1-5ad0-44ad-a9fd-399f463d816b" />



### Email Notification

<img width="1302" height="672" alt="WhatsApp Image 2026-06-18 at 00 29 26 (1)" src="https://github.com/user-attachments/assets/cb9e6009-ba35-4bef-a424-cf386e62fe05" />



## Author

Bhuvanendra Velde

## License

This project was developed for academic and educational purposes.
