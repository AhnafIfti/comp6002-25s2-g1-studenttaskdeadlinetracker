# Student Task Deadline Tracker

This project is a **Student Task Deadline Tracker** application built using **React**, **TypeScript**, and **Vite** on the client side, and **Node.js** with **Express** on the server side. It helps students manage their courses and tasks efficiently by tracking deadlines and providing CRUD functionality for courses and tasks.

## Features

- **Course Management**: Add, edit, delete, and view courses.
- **Task Management**: Add, edit, delete, and view tasks associated with courses.
- **Authentication**: User authentication to ensure data privacy.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

### Client
- **React**: Frontend library for building user interfaces.
- **TypeScript**: Strongly typed JavaScript for better code quality.
- **Vite**: Fast build tool for modern web projects.
- **CSS/SCSS**: Styling for the application.

### Server
- **Node.js**: Backend runtime environment.
- **Express**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing courses and tasks.

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/AhnafIfti/comp6002-25s2-g1-studenttaskdeadlinetracker
   cd student-task-deadline-tracker
   ```

2. Install dependencies for both client and server:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory.
   - Add the following variables:
     ```
     MONGO_URI=your-mongodb-uri
     JWT_SECRET=your-secret-key
     PORT=5000
     ```

4. Start the development servers:
   - Start the server:
     ```bash
     cd server
     npm run dev
     ```
   - Start the client:
     ```bash
     cd client
     npm run dev
     ```

5. Open the application in your browser:
   ```
   http://localhost:5173
   ```

## Scripts

### Client
- `npm run dev`: Start the development server.
- `npm run build`: Build the production-ready app.
- `npm run preview`: Preview the production build.

### Server
- `npm run dev`: Start the development server with hot reload.
- `npm run start`: Start the production server.

## Folder Structure

```
comp6002-25s2-g1-studenttaskdeadlinetracker-feature-task-model/
├── client/               # Frontend code
│   ├── src/              # React components and logic
│   ├── public/           # Static assets
│   └── README.md         # Client README
├── server/               # Backend code
│   ├── src/              # Express controllers, models, and routes
│   └── README.md         # Server README
└── README.md             # Main project README
```

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
