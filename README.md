# BuildFlow AI

BuildFlow AI is an AI-powered construction assistant designed to help users plan and evaluate construction projects.

The application analyzes project requirements, asks relevant clarifying questions, and provides structured recommendations based on construction planning, budgeting, scheduling, materials, and project risks.

## Live Application

BuildFlow AI is deployed as a live web application with an online AI backend.

## Features

- AI-powered construction assistant
- English and Russian language support
- Context-aware conversation history
- Construction project planning
- Cost estimation guidance
- Project duration analysis
- Material and engineering recommendations
- Project risk identification
- Alternative project recommendations
- Persistent chat history using local storage
- New chat functionality
- AI typing animation
- Responsive desktop and mobile interface
- Cloud-hosted AI backend

## AI Architecture

BuildFlow AI uses a cloud-based AI architecture:

User Interface  
→ React Frontend  
→ Railway Backend API  
→ Ollama Cloud API  
→ GPT-OSS 20B  
→ AI Response

The backend receives the full conversation history and dynamically detects the language of the user's latest message.

The AI assistant is instructed to respond in the same language as the user and operate as a construction engineer, project manager, construction planner, and cost estimator.

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Local Storage

### Backend

- Node.js
- Express
- REST API
- CORS
- dotenv

### AI

- Ollama Cloud API
- GPT-OSS 20B

### Deployment

- Railway
- GitHub

## Project Structure

```text
real-estate-landing/
├── src/
│   ├── components/
│   │   └── AIChat.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── server/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── package.json
└── README.md