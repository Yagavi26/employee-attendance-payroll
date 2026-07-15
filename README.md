
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2987f1d4-e102-40a9-a10b-4235473d85c9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# 📋 Employee Attendance & Payroll System

An intelligent, full-stack application designed to streamline employee attendance tracking and payroll processing, powered by an interactive AI assistant. 

---

## 🚀 Features

*   **Smart Attendance Tracking:** Effortlessly log and monitor employee check-ins, check-outs, and daily hours.
*   **Automated Payroll Calculator:** Compute salaries, deductions, and bonuses dynamically based on attendance data.
*   **AI-Powered Insights:** Leverage integrated Gemini AI capabilities to query attendance patterns, generate reports, or ask payroll-related questions.
*   **Modern Dashboard:** A clean, responsive user interface built with Vite, React, and TypeScript.
*   **Robust Backend:** Powered by a TypeScript-based server handling secure API routing.

---

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Backend:** Node.js, Express, TypeScript (`server.ts`)
*   **AI Integration:** Google Gemini API
*   **Environment Management:** dotenv

---

## 📂 Project Structure

```text
├── assets/                  # Static assets (images, icons, etc.)
├── backend/                 # Backend server source files
├── src/                     # Frontend React/TypeScript source files
├── .env.example             # Template for environment variables
├── index.html               # Frontend entry point
├── server.ts                # Main backend server entry point
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration

