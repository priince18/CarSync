# CarSync

CarSync is a web application for buying and selling used cars. It features a machine learning model to predict car prices and provides a seamless user experience for browsing, searching, and managing car listings.

## Features

*   **User Authentication:** Secure user registration and login.
*   **Browse Cars:** View a list of available cars with details.
*   **Sell Cars:** Users can list their own cars for sale.
*   **Price Prediction:** A machine learning model to predict the price of a car based on its features.
*   **Liked Cars:** Users can save cars they are interested in.
*   **User Dashboard:** A personal dashboard for users to manage their listings and liked cars.
*   **Test Drive:** Schedule a test drive for a car.

## Tech Stack

### Frontend

*   React
*   React Router
*   Tailwind CSS
*   Axios

### Backend

*   Flask
*   Flask-CORS
*   Flask-JWT-Extended
*   Pymongo
*   Scikit-learn
*   OpenCV

## Installation and Setup

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
4.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Run the Flask server:
    ```bash
    flask run
    ```

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm start
    ```

## Folder Structure

```
Carsync/
├── backend/            # Flask backend application
│   ├── models/         # Machine learning models
│   ├── routes/         # API routes
│   ├── static/         # Static files
│   ├── db.py           # Database connection
│   ├── server.py       # Main server file
│   └── requirements.txt # Python dependencies
└── frontend/           # React frontend application
    ├── public/         # Public assets
    ├── src/            # Source files
    │   ├── assets/     # Icons and images
    │   ├── components/ # React components
    │   ├── context/    # React context
    │   ├── data/       # Mock data
    │   ├── pages/      # Application pages
    │   ├── App.js      # Main App component
    │   └── index.js    # Entry point
    ├── package.json    # Node.js dependencies
    └── tailwind.config.js # Tailwind CSS configuration
```
