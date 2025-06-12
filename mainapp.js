// ---- IMPORTS ----
// This section handles importing of modules/external libraries.

const fs = require('fs')
const readline = require('readline')

// ---- Constants ----
// This section is for stored configuration values or static data. (NOTE, some configuration such as UI, menu items, and form items are stored in their relevant sections instead.)

const USERS_DB_PATH = './data/users.json'
const PATIENTS_DB_PATH = './data/patients.json'

const TITLE = 'HEALTH MANAGEMENT SYSTEM'

const HEADER_LOGIN = 'Log-in'


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

let currentScreen = {
    title: null,
    message: null,
    header: null,
    body: null,
    prompt: null
}

// ---- Utilities ----
// This section contains utility functions that can be used throughout the application.

const cleanInput = (input) => {
    // Handle non-string inputs by returning empty string
    if (typeof input !== 'string') {
        return '';
    }
    
    // Trim whitespace and remove < > characters to prevent malicious external excecution
    return input.trim().replace(/[<>]/g, '');
}

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
const createMenu = (menu_obj) => { // Returns a string
    // Handle null or undefined input
    if (!menu_obj) {
        return ""
    }
    
    // Handle empty object
    if (Object.keys(menu_obj).length === 0) {
        return ""
    }
    
    // Extract titles from menu items and join with newlines
    const menuItems = Object.values(menu_obj)
    const titles = menuItems.map(item => item.title)
    return titles.join("\n")
}

const handleMenu = (menu_obj) => {

}
// ---- Data ----
// This section is for managing data, including fetching, storing, and manipulating data used in the application.

// ---- Display ----
// This section is for managing the user interface (CLI-ish), console.logs, handling user interactions, and updating the UI.
const displayTitle = (title) => {
    // Don't display if title is empty or null
    if (!title) {
        return;
    }
    
    console.log(title);
    // Create underline with ═ characters matching title length
    console.log('═'.repeat(title.length));
}

const displayHeader = (header) => {
    // Handle null/undefined by not displaying anything
    if (header === null || header === undefined) { // Needed else empty strings fail?
        return;
    }
    
    // Always show the header (even if empty string)
    console.log(header);
    
    // Only show underline if header has content
    if (header) {
        console.log('─'.repeat(header.length));
    }
}

const displayBody = (body) => {
    // Don't display if body is empty or null
    if (!body) {
        return;
    }
    console.log(body);
}

const displayPrompt = (prompt) => {
    // Handle null prompt case - don't display anything
    if (prompt === null || prompt === undefined) { // Needed else empty strings fail?
        return;
    }
    
    // Handle empty string prompt case
    if (prompt === '') {
        console.log('...');
        return;
    }
    
    // Special handling for "Continue" prompt
    if (prompt === 'continue') {
        const continueLine = '> Press enter to continue...';
        console.log('─'.repeat(continueLine.length));
        console.log(continueLine);
    } else {
        // Standard prompt with decoration line matching the full prompt line length
        const promptLine = '> ' + prompt + ': ';
        console.log('─'.repeat(promptLine.length));
        console.log(promptLine);
    }
}

const displayMessage = (message) => {
    // Don't display if message is empty or null
    if (!message) {
        return;
    }
    
    console.log('[' + message + ']');
}

const displayScreen = (currentScreen) => {
    // Handle null screen object
    if (!currentScreen) {
        return;
    }
    
    console.clear();
    
    // Handle empty screen object - just clear and return
    if (Object.keys(currentScreen).length === 0) {
        return;
    }
    
    // If there's a message, show message mode (title + message + continue prompt)
    if (currentScreen.message) {
        displayTitle(currentScreen.title);
        displayMessage(currentScreen.message);
        displayPrompt('continue');
        return;
    }
    
    // Normal mode - display all components
    displayTitle(currentScreen.title);
    displayHeader(currentScreen.header);
    displayBody(currentScreen.body);
    displayPrompt(currentScreen.prompt);
}
// ---- Flow ----
// This section manages the flow of the application, including navigation, what happens when.

const goToMenu = (menu_obj) => {
    currentScreen.title = TITLE
    currentScreen.header = menu_obj.name
    currentScreen.body = createMenu(menu_obj)
    
    // Calculate number of menu items (- the 'name' property)
    const menuItemCount = Object.keys(menu_obj).length - 1
    currentScreen.prompt = "Select an option (1-" + menuItemCount.toString() + ")"
    
    currentScreen.message = null
    displayScreen(currentScreen)
    handleMenu(menu_obj)
}

const goToForm = (form_obj) => {

}

const goToRecord = (record_obj) => {
    
}

// ---- Menu Configs ----
// This section contains menu item configurations for the application interface.

// Login screen menu items
const LOGIN_MENU_ITEMS = {
    name: "User Authentication",
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
    createMenu,
    handleMenu,
    currentScreen,  // Add this
    displayTitle,
    displayHeader,
    displayBody,
    displayPrompt,
    displayMessage,
    displayScreen,
    LOGIN_MENU_ITEMS,
    goToMenu,
    goToForm,
    goToRecord
}