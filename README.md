# 📈 HealthOps – Smart Health Monitoring App
(Personal Health Data Logging System)

**HealthOps** is a full-stack web application that helps users track health metrics, receive fitness recommendations, set health reminders, and manage medical records. The app is built for reliability, security, and real-time insight.

---

## 🔗 Live Demo

* Frontend: [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
* Backend (Google Cloud Run / App Engine): [https://api.healthops.example.com](https://api.healthops.example.com)

*Note: Full functionality available when both frontend and backend are active.*

---

## 🛠️ Tech Stack (MERN)

* **Frontend**: React 19, React Router, Chart.js, FullCalendar
* **Backend**: Node.js, Express.js, MongoDB Atlas
* **Authentication**: Google OAuth2, Sessions
* **Deployment**:

  * Vercel (Frontend)
  * Google Cloud (Backend)
  * Firebase Hosting (Static React preview only)
* **CI/CD**: GitHub Actions + Docker + Lighthouse

---

## 🚀 Key Features

* 👤 User login, registration & session auth
* 📅 Google Calendar integration for reminders
* 📈 Dynamic health and fitness dashboards
* 📄 Medical records stored in MongoDB Atlas
* ✨ Community review system
* 🔧 Admin control panel

---

## 📂 Project Structure

```
healthops-phds/
├── client/               # React app (Vercel)
│   ├── src/pages/        # Page-level components
│   ├── src/components/   # Reusable widgets
│
├── server/               # Express API (Google Cloud)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Auth, health, review APIs
│   └── server.js         # Express entry point
├── .github/workflows/    # GitHub CI/CD
```

---

## ⚙️ Environment Variables

### Server

```
PORT=4000
MONGO_URI=<MongoAtlasURI>
SESSION_SECRET=<your-session-secret>
GOOGLE_CLIENT_ID=<OAuthClientID>
GOOGLE_CLIENT_SECRET=<OAuthSecret>
GOOGLE_REDIRECT_URI=<RedirectURL>
```

---


## 🧪 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repo

```bash
git clone https://github.com/dicoder4/healthops-phds.git
cd healthops-phds
```

### 2. Set Up Environment Variables

* Create a `.env` file inside the `server/` folder:

```env
PORT=4000
MONGO_URI=<your-mongodb-uri>
SESSION_SECRET=<your-session-secret>
GOOGLE_CLIENT_ID=<your-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-oauth-secret>
GOOGLE_REDIRECT_URI=http://localhost:4000/oauth2callback
```

### 3. Create a MongoDB Cluster Collection:
```bash
Create Database-health_checker
Add food,reviews,exercise and diseases .json files- available in the root folder-MongoJsonFiles
```
Also, create an empty `user.json` file manually in your `folder-mongo-json/` directory:

### 4. Start the App

Open two terminals:

**Terminal 1 – Backend**

```bash
cd server
npm install
npm start
```

**Terminal 2 – Frontend**

```bash
cd client
npm install
npm start
```

The app will be live at [http://localhost:3000](http://localhost:3000)

---



## 🔮 Testing

* `server`: Jest + Supertest

```bash
# Backend integration tests
cd server && npm run test
```

---

## 🚪 Deployment

### Frontend (Vercel)

* Automatically deployed from `main` branch
* `.vercel/project.json` tracks config

### Backend (Google Cloud)

* Deployed as Docker container to Cloud Run
* MongoDB via Atlas

### CI/CD (GitHub Actions)

* Linting, audits, testing, Docker build
* Lighthouse CI for performance budget

---
## 📄 License

MIT License © 2025 Meghmilan Enterprises

---

## 👨‍💻 Developers

* Aditri B Ray
* Diya D Shah
* Contributions welcome via pull requests!

---
