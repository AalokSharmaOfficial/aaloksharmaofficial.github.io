<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Diary

A simple and elegant web application to write and save your life events. All your data is end-to-end encrypted and stored securely.

View your app in AI Studio: https://ai.studio/apps/drive/1Yn1tJRanxKZPeF1WvrS5gwznXM_2b1-D

## Run Locally

**Prerequisites:**  [Node.js](https://nodejs.org/)

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up Supabase:**
    This project uses Supabase for the backend. 
    - First, create a project on [supabase.com](https://supabase.com).
    - Run the SQL setup instructions found in the comments of `lib/supabaseClient.ts` to configure your database tables and security policies.
    - Create a file named `.env.local` in the root of the project.
    - Copy the contents of `.env.example` into your new `.env.local` file.
    - Replace the placeholder values with your actual Supabase Project URL and Anon Key from your Supabase project's API settings.

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open the local URL shown in your terminal (e.g., `http://localhost:5173`) to view it in the browser.

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. Any push to the `main` branch will trigger the deployment workflow.

### Required Setup for Deployment

For the deployment to succeed, you must add your Supabase credentials as secrets to your GitHub repository.

1. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** for each of the following secrets:
    - **`VITE_SUPABASE_URL`**: Your Supabase project URL.
    - **`VITE_SUPABASE_KEY`**: Your Supabase project's public anon key.

The workflow will use these secrets to build the application with the correct credentials.
