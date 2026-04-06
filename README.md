# BuddyScript — Social Media App

A full-stack social media web application built as a monorepo with
React.js (frontend), Node.js + Express.js (backend), and MongoDB (database).

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios        |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB via Mongoose                    |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| Styling   | Existing CSS templates (no Tailwind)    |
| Images    | Base64 strings stored in MongoDB        |

---

## Project Structure

/social-app-monorepo
├── /backend
│   ├── /config
│   │   └── db.js                  # Mongoose connection
│   ├── /controllers
│   │   ├── authController.js      # register, login
│   │   ├── postController.js      # createPost, getFeed, togglePostLike
│   │   └── commentController.js   # addComment, getComments,
│   │                              #   toggleCommentLike, addReply
│   ├── /middleware
│   │   └── authMiddleware.js      # JWT verification → req.user
│   ├── /models
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── /routes
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── commentRoutes.js
│   ├── .env
│   └── server.js
│
├── /frontend
│   ├── /public                    # CSS/image assets from template
│   └── /src
│       ├── /api
│       │   └── axios.js           # Preconfigured Axios instance
│       ├── /components
│       │   ├── Navbar.js
│       │   ├── CreatePost.js
│       │   └── PostItem.js        # Includes CommentItem + LikesPopover
│       ├── /context
│       │   └── AuthContext.js
│       ├── /pages
│       │   ├── Login.js
│       │   ├── Register.js
│       │   └── Feed.js
│       ├── App.js
│       └── main.js
│
└── README.md   

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A MongoDB connection string (MongoDB Atlas free tier works)

### Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here

Start the backend:
```bash
node server.js
# or with auto-reload:
npx nodemon server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Vite
# or
npm start        # CRA
```

Place your CSS/image assets from the template zip into `frontend/public/assets/`.

---

## API Reference

### Auth
| Method | Endpoint             | Auth | Body                                      |
|--------|----------------------|------|-------------------------------------------|
| POST   | /api/auth/register   | —    | firstName, lastName, email, password      |
| POST   | /api/auth/login      | —    | email, password                           |

Both return `{ token, user: { id, firstName, lastName, email } }`.

### Posts
| Method | Endpoint                   | Auth | Notes                                  |
|--------|----------------------------|------|----------------------------------------|
| POST   | /api/posts                 | ✅   | content, image (base64), visibility    |
| GET    | /api/posts                 | ✅   | All public + own private, newest first |
| POST   | /api/posts/:id/like        | ✅   | Toggle; returns { liked, likeCount }   |
| POST   | /api/posts/:id/comments    | ✅   | content                                |
| GET    | /api/posts/:id/comments    | ✅   | Returns array with nested replies      |

### Comments
| Method | Endpoint                   | Auth | Notes                                  |
|--------|----------------------------|------|----------------------------------------|
| POST   | /api/comments/:id/like     | ✅   | Toggle; returns { liked, likeCount }   |
| POST   | /api/comments/:id/reply    | ✅   | content; returns new reply object      |

---

## Key Design Decisions

### Optimistic UI for Likes
Both post likes and comment likes update local state immediately before
the API call resolves. If the API call fails, state is reverted to the
last known server value. This keeps the UI feeling instant while staying
consistent with the backend.

### No Refetch on Post Create
When a new post is successfully created, the `Feed` component prepends
it to its local `posts` state via the `onPostCreated` callback. No
second `GET /api/posts` call is made — the response from `POST /api/posts`
already returns the fully-populated post object.

### Lazy Comment Loading
Comments are fetched from the API only on the first time the user
expands them (clicks "Comment" or the count). A `commentsFetched` flag
prevents duplicate requests on subsequent toggles.

### Images as Base64
Images are converted to base64 using the browser's `FileReader` API and
stored as strings directly in MongoDB. File size is capped at 5 MB on
the frontend and the Express `json` limit is set to `10mb` on the
backend to accommodate the base64 overhead (~33% larger than binary).

### JWT Storage
The JWT is stored in `localStorage` and attached to every Axios request
via a request interceptor. A 401 response on the feed page triggers an
automatic logout and redirect to `/login`.

### Comment Replies (flat sub-documents)
Replies are stored as an embedded array within each Comment document
using a `ReplySchema`. This avoids recursive population complexity while
keeping the data co-located. Deep nesting (replies to replies) is not
supported by design — this matches the intended UX.

### Auth Route Guards
`PrivateRoute` redirects unauthenticated users to `/login`.
`PublicRoute` redirects already-authenticated users away from `/login`
and `/register` to `/feed`, preventing the back-button auth bypass.

---

## Environment Variables

| Variable    | Description                        |
|-------------|------------------------------------|
| PORT        | Express server port (default 5000) |
| MONGO_URI   | MongoDB connection string          |
| JWT_SECRET  | Secret key for signing JWTs        |