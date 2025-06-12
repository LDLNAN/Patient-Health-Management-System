# Patient Health Management System (Proof of Concept)

## Overview

CLI Patient Health Record Management System project, developed as a proof of concept. The primary goal of this project is to create a secure, efficient, and maintainable system for managing individual patient health profiles. It aims to address the common challenge of fragmented patient information, providing a centralized solution for healthcare professionals and patients.

## How to Run the Application

**Clone the Repository:**

```bash
git clone https://github.com/LDLNAN/Patient-Health-Management-System.git
```

**Navigate to the Project Directory:**

```bash
cd Patient-Health-Management-System
```

**Install Dependencies:**

```bash
npm install
```

**Start the Application:**

```bash
node mainapp.js
```

## How to Run Tests

This project uses JEST for unit testing.

To run all tests:

```bash
npm test
```

## Project Structure

Code is organized into distinct, modular sections within `mainapp.js` for clarity and maintainability:

- **`IMPORTS`**: This section handles importing of modules/external libraries.
- **`Constants`**: This section is for stored configuration values or static data. (NOTE, some configuration such as UI, menu items, and form items are stored in their relevant sections instead.)
- **`Initialization`**: This section is for initializing databases, setting up configurations, and other enviroment preparations.
- **`Utilities`**: This section contains utility functions that can be used throughout the application.
- **`Handlers`**: This section is for handling events, such as user prompts, and menu/form creation.
- **`Data`**: This section is for managing data, including fetching, storing, and manipulating data used in the application.
- **`Display`**: This section is for managing the user interface (basic CLI), console.logs, handling user interactions, and updating the UI.
- **`Flow`**: This section manages the flow of the application, including navigation, what happens when.
- **`Main`**: This section is the entry point of the application, where everything comes together and starts running.
- **`Testing`**: Primarily contains the `module.exports` statement, making functions available for Jest unit tests. Actual test files reside in the `__tests__` directory.

## Development Methodology

This project adheres to the Extreme Programming (XP) methodology, with an emphasis on Test-Driven, iterative, and simple development.

## TO-DO:

- [ ]  Create databases with ‘Faker’
- [ ]  Implement JEST testing