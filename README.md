# React + TypeScript + Vite Starter

This is a starter template for a React project using TypeScript and Vite.

## Getting Started

### Prerequisites

*   Node.js (v16 or later)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Development

To start the development server, run:

```bash
npm run dev
```

This will open the project in your browser at `http://localhost:5173/`.

### Building for Production

To build the project for production, run:

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

## About the Application (Consent Management Platform)

This application is a Consent Management Platform (CMP) designed to help website owners comply with data privacy regulations like the DPDP Act. It provides a user interface to manage user consent for cookies and other tracking technologies.

### Modules/Pages

The application is a single-page application with the following main modules (views):

*   **Analytics Dashboard:** Displays key metrics and visualizations related to user consent, including total consents, opt-in rates, and cookie classifications.
*   **Banner Builder:** Allows users to customize the appearance and behavior of the cookie consent banner that is displayed to website visitors.
*   **Cookie Scanner:** Scans the website to identify and classify cookies, using a mock AI model for categorization.
*   **Consent Manager:** Provides a ledger of user consents for auditing purposes and allows for managing consent across multiple domains.
*   **Notifications:** An inbox for system alerts, such as the detection of new cookies on the site.

### Components

The application is built using a set of reusable React components, including:

*   `Card`: A container for displaying content in a structured way.
*   `Badge`: A component for displaying status labels.
*   `NavItem`: A navigation item used in the sidebar.
*   `ToggleSwitch`: A simple switch for binary options.
