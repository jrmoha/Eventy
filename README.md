<p align="center">
    <h1 align="center">Eventy</h1>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Eventy-1.0.0-blue" alt="Eventy">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

<p align="center">
	<em>Developed with the software and tools below.</em>
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white" alt="Redis">
    <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white" alt="Sequelize">
    <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white" alt="Socket.IO">
    <img src="https://img.shields.io/badge/PM2-2B037A?style=flat&logo=pm2&logoColor=white" alt="PM2">
    <img src="https://img.shields.io/badge/nodemailer-339933?style=flat&logo=nodemailer&logoColor=white" alt="nodemailer">
    <img src="https://img.shields.io/badge/Stripe-008CDD?style=flat&logo=stripe&logoColor=white" alt="Stripe">
    <img src="https://img.shields.io/badge/Cloudinary-0174DF?style=flat&logo=cloudinary&logoColor=white" alt="Cloudinary">
</p>

<hr>

## Quick Links

- [Project Overview](#project-overview)
- [Motivation](#motivation)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Demo](#demo)
- [Roadmap](#roadmap)
- [Overall System Architecture](#overall-system-architecture)
- [License](#license)
- [Contributing](#contributing)

---

## Project Overview

## Eventy is a web-based social media platform that connects individuals through shared interests in local and global events. It modernizes event venue access with an e-ticketing system, providing a seamless platform for event discovery, engagement, and experience sharing.

## Motivation

Despite widespread digitization, the event industry still relies heavily on paper tickets. Eventy aims to bridge this gap by offering a digital solution for event creation, ticket purchasing, and validation. Our goal is to enhance user experience and promote sustainability by reducing paper usage.

---

## Key Features

- **Login and Signup**: Users can create accounts and log in securely.
- **Event Creation**: Organizers can create and manage events, displaying all relevant information.
- **E-Ticketing**: Users can purchase and validate e-tickets via QR codes.
- **Follow and Block Users**: Users can follow others to see their updates and block users as needed.
- **News Feed**: Aggregates posts from followed users, events, and ads, with filters for price, distance, and interests.
- **Send Reminders**: Users receive email reminders for upcoming events.
- **Ratings and Reviews**: Users can rate events, and organizers receive ratings based on their events.
- **Advertisements**: Organizers can create advertisements for events, with costs based on packages or impressions.
- **RSVP**: Users can respond to event invitations and receive reminders.
- **Chat and Community Creation**: Provides private chat and event-specific forums for attendees and organizers.
- **Book and Validate Tickets**: Users can buy e-tickets and organizers can validate them using QR codes.

---

## Tech Stack

- **Server-Side**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL, Redis
- **ORM**: Sequelize
- **Authentication**: JWT
- **WebSockets**: Socket.IO
- **Load Balancing**: PM2
- **Email**: nodemailer
- **Payment Gateway**: Stripe
- **Media Storage**: Cloudinary

---

## Installation

To set up the Eventy project, follow these steps:

1. **Prerequisites**:

   - Ensure you have **Node.js (version 17 or higher)** installed. You can download it from [nodejs.org](https://nodejs.org/).
   - Install **Yarn** if you don't already have it. You can install it globally using npm:
     ```sh
     npm install -g yarn
     ```
   - Install **TypeScript** and **PM2** globally:
     ```sh
     npm install -g typescript pm2
     ```

2. **Clone the Repository**:

   - Clone the repository to your local machine:
     ```sh
     git clone https://github.com/jrmoha/Eventy
     cd Eventy
     ```

3. **Install Dependencies**:

   - Install the project dependencies using Yarn:
     ```sh
     yarn install
     ```
   - Initialize the project with TypeScript:
     ```sh
     tsc --init
     ```

4. **Set Up the Database**:

   - Ensure you have **Redis** and **PostgreSQL (or any SQL database)** installed and running.
   - Configure your database connection settings in the project configuration file (e.g., `.env`) find example in **.env.example** file.

5. **Start the Development Server**:

   - For development, you can start the server with:
     ```sh
     yarn dev
     ```

6. **Build and Start the Production Server**:

   - Build the project:
     ```sh
     yarn build
     ```
   - Start the application using Node:
     ```sh
     yarn start
     ```
   - Alternatively, you can use PM2 to manage the load balancing and monitoring of the application in production mode:
     ```sh
     yarn dev:pm2
     ```

7. **Access the Application**:
   - Open your web browser and navigate to `http://localhost:3000` to access the Eventy platform.

Great! Here’s the **Usage** section for your README based on the provided details:

---

## Usage

Once you have installed and set up Eventy, you can start using the platform as either a regular user or an organizer. Here are the primary actions you can take:

### 1. Sign Up

- Create an account by providing your details and verifying your email address.
- Follow the prompts on the sign-up page to complete your registration.
- Confirm your email address by clicking the verification link sent to your inbox and choose at least 5 favorite categories you want to see in recommendation.

### 2. Log In

- Log in using your email and password.
- Navigate to the login page and enter your credentials to access your account.

### 3. Create an Event (Organizer)

- If you are an organizer, you can create an event by providing all the necessary details.
- Go to the "Create Event" section and fill out the event form with information such as event name, date, location, description, and ticket prices.

### 4. Purchase Tickets

- Users can purchase tickets for events using the e-ticketing system.
- Browse events, select the one you wish to attend, and follow the prompts to purchase tickets.

### 5. Validate Tickets (Organizer)

- Organizers can validate tickets using the QR code scanner.
- At the event, use the Eventy QR code scanner to validate each attendee's ticket.

### User Roles and Functionality

- **Regular User**: Can sign up, log in, browse events, and purchase tickets.
- **Organizer**: Can sign up, log in, create events, and validate tickets. Any user can become an organizer by creating an event.

---

## Demo

**Below is a video demo of the Eventy platform:**

https://github.com/jrmoha/Eventy/assets/94176787/7cfc7b33-857d-4cb7-841d-670643c32c47

**Here's mobile version of ticket scanning:**

https://github.com/jrmoha/Eventy/assets/94176787/bc3fc893-70b3-4d1a-9a19-9c4cad73817b

---

## Roadmap

The future development of Eventy will focus on the following key features:

1.  Deploying the System.
    In the upcoming stage, the entire system will be deployed and tested in a production environment.
2.  Improve Advertisements retrieval algorithm.
    Collaborate with the recommendation system to personalize advertisements for each user.
3.  Provide mobile application.
    Develop and launch a mobile application to increase accessibility and convenience for users.
4.  Include Maps and directions to ease access to Event.
    Integrate maps and provide directions to events to facilitate easier access for users.
5.  Implement End-to-End encryption in chat service.
    Enhance security by implementing end-to-end encryption for both private and public chats between users and within communities.
6.  Integrate Video Streaming.
    Allow event organizers to stream events live and provide a seamless experience for remote attendees.

---

## Overall System Architecture

 

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contributing

We welcome contributions from the community to enhance the Eventy platform. If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/yourfeature`).
3. Make changes and commit them (`git commit -am 'Add new feature'`).
4. Push the changes to your branch (`git push origin feature/yourfeature`).
5. Create a new Pull Request.
