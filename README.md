# ShareHub
Full-stack cloud storage webapp (In progress)

#Frontend
> Sharehubb is a cloud storage webapp demo built with React, TypeScript, Tailwind, and deployed via Netlify CDN.

## Live Frontend Demo 
[Sharehubb on Netlify](https://sharehubb.netlify.app)

## Project Notes
The Settings page UI is available and can be explored in the live demo.
However, backend‑to‑frontend integration for Settings features is not fully functional.
This is intentional, as Sharehubb is presented here as a GitHub project for portfolio and resume purposes.

## Tech Stack

### Frontend 
- **Languages:** HTML, CSS, TypeScript
- **Framework/Library:** React (with Vite for bundling)
- **Styling:** TailwindCSS
- **Deployment:** Netlify (global CDN, auto‑deploy from GitHub)

### Backend 
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT, bcrypt
- **File Handling:** Multer, Microsoft Azure
- **Security:** Helmet.js, express‑rate‑limit, express‑validator
- **Testing Tools:** Postman, Mocha

### DevOps / Deployment
- **Version Control:** Git + GitHub
- **CI/CD:** Netlify auto‑deploy (frontend), backend deployment planned
- **Documentation:** Swagger (API docs)
- **Logging:** Winston

## Software Development Life Cycle (SDLC)

### 1. Planning 
- Defined project scope: full‑stack cloud storage webapp. 
- Goal: showcase frontend deployment, UI polish, and backend integration skills for portfolio/resume.

### 2. Requirements Analysis 
- **Frontend:** React, TypeScript, TailwindCSS, HTML, responsive UI.
- **Backend:** Node.js, Express, MongoDB. 
- **Deployment:** Netlify (frontend)

### 3. Design
- Modular architecture with separate `frontend` and `backend` folders.
- REST API design for file upload, authentication, and settings.
- UI wireframes for dashboard and settings page.

### 4. Implementation
- Frontend built with Vite, TailwindCSS, reusable components.
- Backend routes and schema (authentication, file storage, metadata).
- GitHub repo with CI/CD integration to Netlify.

### 5. Testing
- Local builds validated with `npm run build`.
- Netlify deploy logs used to confirm successful builds.
- Postman used to test backend endpoints (upload, download, list, delete).
- Planned unit tests for backend routes and integration tests for API calls.

### 6. Deployment
- Frontend live at [Sharehubb on Netlify](https://sharehubb.netlify.app).
- Backend deployment planned
- Auto‑deploy pipeline from GitHub → Netlify.

### 7. Maintenance
- Iterative improvements (SEO, CDN, bug fixes).
- README updates to reflect project progress.
