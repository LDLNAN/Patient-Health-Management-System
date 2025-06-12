// ---- IMPORTS ----
// This section handles importing of modules/external libraries.

const fs = require('fs')
const readline = require('readline')

// ---- Constants ----
// This section is for stored configuration values or static data. (NOTE, some configuration such as UI, menu items, and form items are stored in their relevant sections instead.)

const USERS_DB_PATH = './data/users.json'
const PATIENTS_DB_PATH = './data/patients.json'

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

// ---- Handlers ----
// This section is for handling events, such as user prompts, and menu/form creation.

// ---- Data ----
// This section is for managing data, including fetching, storing, and manipulating data used in the application.

// ---- Display ----
// This section is for managing the user interface (basic CLI), console.logs, handling user interactions, and updating the UI.

// ---- Flow ----
// This section manages the flow of the application, including navigation, what happens when.

// ---- Main ----
// This section is the entry point of the application, where everything comes together and starts running.

function startApp() {
}

startApp()

// ---- Testing ----
// This section is for application tests using JEST.

// ADD OTHER FUNCTIONS HERE AS THEY ARE DEVELOPED
module.exports = {
    initializeDataFiles,
    startApp,
}