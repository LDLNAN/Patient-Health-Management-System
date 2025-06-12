// ---- IMPORTS ----
// This section handles importing of modules/external libraries.

const fs = require('fs')
const readline = require('readline')

// ---- Constants ----
// This section is for stored configuration values or static data. (NOTE, some configuration such as UI, menu items, and form items are stored in their relevant sections instead.)

const USERS_DB_PATH = './data/users.json'
const PATIENTS_DB_PATH = './data/patients.json'

// Empty templates for new account creation and patient registration
const EMPTY_USER_TEMPLATE = {
    nhi: null, // Will be filled for patients, null for professionals
    id: null, // Will be filled for professionals, null for patients
    email: "",
    phone: "",
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
    },
    password: "", // Should be hashed in real implementation
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "", // Format: YYYY-MM-DD
    role: "", // "admin", "professional", or "patient"
}

const EMPTY_PATIENT_TEMPLATE = {
    nhi: null,
    firstName: "",
    lastName: "",
    dateOfBirth: "", // Format: YYYY-MM-DD
    gender: "",
    phone: "",
    email: "",
    password: "",
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
    },
    medicalHistory: {
        allergies: [],
        currentMedications: [],
        bloodType: "",
        notes: ""
    },    assignedGP: null, // Will reference a professional's ID
}

// ---- Initialisation ----
// This section is for initializing databases, setting up configurations, and other enviroment preparations.

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Global variable to store current user session.
let currentUser = null

// ---- Utilities ----
// This section contains utility functions that can be used throughout the application.

// [Utility] Basic input cleaning
const cleanInput = (input) => {
    // Handle non-string inputs by returning empty string
    if (typeof input !== 'string') {
        return '';
    }
    
    // Trim whitespace and remove < > characters to prevent malicious external excecution
    return input.trim().replace(/[<>]/g, '');
}

// [Logic] Validate email format
// Found: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
// NOTE: Email's should be confirmed with proper verification - this just checks the format is correct.
const validateEmail = (email) => {
    // Handle null, undefined, or non-string values
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ) !== null;
}

// ---- Handlers ----
// This section is for handling events, such as user prompts, and menu/form creation.

// ---- Data ----
// This section is for managing data, including fetching, storing, and manipulating data used in the application.

// ---- Display ----
// This section is for managing the user interface (basic CLI), console.logs, handling user interactions, and updating the UI.

// ---- Flow ----
// This section manages the flow of the application, including navigation, what happens when.

// ---- Menu Configs ----
// This section contains menu item configurations for the application interface.

// Login screen menu items
const LOGIN_MENU_ITEMS = {
    1: {
        title: "1. Login (Existing user)",
        action: "startUserLogin"
    },
    2: {
        title: "2. Create an account (New user)",
        action: "startUserCreate"
    }
}

// ---- Form Configs ----
// This section contains form configurations for data input.

// ---- Record Configs ----
// This section contains record configurations for data management.

// ---- Main ----
// This section is the entry point of the application, where everything comes together and starts running.

const startApp = () => {
}

// startApp() // Commented out to prevent auto-execution

// ---- Testing ----
// This section is for application tests using JEST.

// ADD OTHER FUNCTIONS HERE AS THEY ARE DEVELOPED
module.exports = {
    startApp,
    EMPTY_USER_TEMPLATE,
    EMPTY_PATIENT_TEMPLATE,
    cleanInput,
    validateEmail,
}