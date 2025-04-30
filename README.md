# Client Feedback Portal 📝

A full-stack web application for managing and collecting feedback from clients. This project includes:

- A **React frontend** (deployed on Vercel)
- A **Node.js/Express backend** with MongoDB (deployed on Render)
- Support for **user authentication**, **admin control**, and **feedback submission**
- Unit testing with **Jest** and **Supertest**

---

## 🚀 Live Demo

- **Live Link**: (https://client-feedbacak-portal.vercel.app/)

---

## 🛠 Tech Stack

### Frontend
- React
- React Router
- Axios
- Vercel Deployment

### Backend
- Node.js
- Express
- MongoDB & Mongoose
- JWT Authentication
- Multer (for file uploads)
- Jest & Supertest (for unit testing)
- Render Deployment

---

## 📂 Project Structure

### Frontend
```
src/
├── context/          # Auth context
├── pages/            # Page components
├── components/       # Reusable components
├── utils/            # Axios config
└── App.js            # Routes and layout
```

### Backend
```
src/
├── controllers/      # Business logic
├── routes/           # Express routes
├── middleware/       # Error handling, auth
├── models/           # Mongoose models
├── tests/            # Unit and API tests
├── utils/            # Utility functions
├── db.js             # MongoDB connection
└── server.js         # App entry point
```

---

## 🔐 Features

- **User registration/login** with JWT
- **Role-based access** (admin/user)
- **Protected routes** for dashboard and admin
- **Feedback form** with optional file upload
- **Admin view** to manage/view all feedbacks
- **Admin auto-reply suggestions** based on feedback content
- **Unit testing** with Jest + Supertest

---

## 🤖 Admin AI Reply Suggestions

To enhance feedback handling efficiency, the Admin Panel includes AI-generated reply suggestions:

- When viewing a client’s feedback, admins can click **"Suggest Reply"**.
- The system uses an integrated AI service to generate a contextual response, helping admins save time on routine replies.
- Suggestions can be edited or used directly.
- Improves consistency and professionalism in communication.

### 🧠 Tech Behind It:
- Integrated with **HugginFace API**
- **Admin-facing only**

---

## 🧪 Running Tests

Backend unit and API tests are written using **Jest** and **Supertest**.

### Run all tests:

```bash
npm run test
```

Tests use an **in-memory MongoDB server** (`mongodb-memory-server`) to isolate test data.

---

## 🖥 Deployment

### Frontend (Vercel)
- Connect GitHub repo
- Set `VITE_API_BASE_URL` in Vercel Environment Variables
- Deploy automatically on every push

### Backend (Render)
- Connect GitHub repo
- Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in Render's environment tab
- Auto-deploy on push
- Configure CORS in Express based on `CLIENT_URL`

---


## 👨‍💻 Author

Made with 💻 by Mohd Ubaidullah

---

## 📝 License

This project is licensed under the MIT License.
