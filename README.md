# GitHub Contribution Calendar

This project is a web application that displays a GitHub contribution calendar for a specified user. Users can log in using their GitHub username and personal access token to view their contribution history. The application is built using React, TypeScript, and Tailwind CSS for styling.

## Features

- **Login Page**: Users can log in using their GitHub username and personal access token.
- **Contribution Calendar**: Displays the user's GitHub contribution history in a calendar format.
- **Responsive Design**: The application is responsive and works well on both desktop and mobile devices.
- **Logout Functionality**: Users can log out and return to the login page.
- **Customizable Themes**: Users can select different themes for the contribution calendar.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mani-miriyala28/github-contribution-calendar.git
   cd github-contribution-calendarnpm
   ```
2. **Install dependencies**:
   npm install
3. **Start the development server**:

   npm run dev

4. **Open the application**: Open your web browser and navigate to `http://localhost:8080` to view the application.

## Usage

1. **Login**: Enter your GitHub username and personal access token to log in. Your personal access token can be generated from your GitHub account settings. Make sure to grant the necessary permissions to access your contribution data.

2. **View Contribution Calendar**: 
    The contribution calendar displays your GitHub contributions for the selected year.
    Use the buttons to switch between different years.
    Select a theme from the dropdown menu to change the appearance of the calendar.

3. **Logout**: Click the logout button to log out and return to the login page.

## Project Structure

The project structure is organized as follows:
- `src/`: Contains the source code for the application.
  - `components/`: Contains reusable React components.
    - `ContributionCalendar.js`: The main component for rendering the contribution calendar.
    - `Login.js`: The component for handling user login.
- `public/`: Contains static assets and the HTML template.
- `package.json`: Contains project metadata and dependencies.
- `README.md`: This file.
- `index.html`: The main HTML file for the application.
-src-utils:Contains utility functions for fetching GitHub contributions and other helper functions.
-src/
  - components/
    - ContributionCalendar.js
    - Login.js
  - App.js
  - index.js
public/
  - index.html
package.json
README.md
