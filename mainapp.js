// ---- IMPORTS ----
// This section handles importing of modules/external libraries.

const fs = require('fs')
const readline = require('readline')

// ---- Constants ----
// This section is for stored configuration values or static data. (NOTE, some configuration such as UI, menu items, and form items are stored in their relevant sections instead.)

const USERS_DB_PATH = './data/users.json'
const PATIENTS_DB_PATH = './data/patients.json'

const TITLE = 'HEALTH MANAGEMENT SYSTEM'

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
        return ''
    }
    
    // Trim whitespace and remove < > characters to prevent malicious external excecution
    return input.trim().replace(/[<>]/g, '')
}

// Found: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
// NOTE: Email's should be confirmed with proper verification - this just checks the format is correct.
const validateEmail = (email) => {
    // Handle null, undefined, or non-string values
    if (!email || typeof email !== 'string') {
        return false
    }
    
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null
}

// Consolidated validation utility function
const validateField = (field, fieldValue, formData) => {
    // Required field check
    if (field.required && !fieldValue) {
        return { valid: false, message: field.label + " is required!" }
    }
    
    // Email validation
    if (field.name === "email" && fieldValue && !validateEmail(fieldValue)) {
        return { valid: false, message: "Please enter a valid email address!" }
    }
    
    // Password confirmation
    if (field.name === "confirmPassword" && fieldValue !== formData.password) {
        return { valid: false, message: "Passwords do not match!" }
    }
    
    return { valid: true }
}

// Format patient record for display
const formatPatientRecord = (patient) => {
    if (!patient) return "No patient record found."
    
    return ("Name: " + patient.firstName + " " + patient.lastName + "\n" +
            "NHI: " + patient.nhi + "\n" +
            "Date of Birth: " + patient.dateOfBirth + "\n" +
            "Gender: " + patient.gender + "\n" +
            "Phone: " + patient.phone + "\n" +
            "Email: " + patient.email + "\n\n" +
            "Address:\n" +
            "────────\n" +
            patient.address.street + "\n" +
            patient.address.city + ", " + patient.address.state + " " + patient.address.zipCode + "\n" +
            patient.address.country + "\n\n" +
            "Medical History:\n" +
            "────────────────\n" +
            "Blood Type: " + (patient.medicalHistory.bloodType || 'Not specified') + "\n" +
            "Allergies: " + (patient.medicalHistory.allergies.length > 0 ? patient.medicalHistory.allergies.join(', ') : 'None listed') + "\n" +
            "Current Medications: " + (patient.medicalHistory.currentMedications.length > 0 ? patient.medicalHistory.currentMedications.join(', ') : 'None listed') + "\n" +
            "Notes: " + (patient.medicalHistory.notes || 'No additional notes') + "\n" +
            "Assigned GP ID: " + (patient.assignedGP || 'Not assigned'))
}

// Format patient list for display
const createPatientList = (patients) => {
    let patientList = "Patient Records:\n═════════════════\n"
    
    patients.forEach((patient, index) => {
        patientList += (index + 1) + ". " + patient.firstName + " " + patient.lastName + " (NHI: " + patient.nhi + ")\n"
    })
    
    return patientList
}

// Unified message display and wait function
const showMessageAndWait = async (message) => {
    currentScreen.message = message
    displayScreen(currentScreen)
    await new Promise(resolve => {
        rl.question('', () => resolve())
    })
}

// Find objects in APP_OBJ by their ID
const findAppObject = (id) => {
    return APP_OBJ.find(obj => obj.id === id)
}


// ---- Handlers ----
// This section is for handling events, such as user prompts, and menu/form creation.
const createMenu = (menu_obj) => {
    if (!menu_obj) return ""
    
    return Object.keys(menu_obj)
        .filter(key => !isNaN(key)) // Only numeric keys
        .map(key => menu_obj[key].title) // Map each title, based on filtered key
        .join("\n")
}

const handleMenu = async (menu_obj) => {
    // Set up the menu display
    currentScreen.title = TITLE
    currentScreen.header = menu_obj.name
    currentScreen.body = createMenu(menu_obj)
    
    // Calculate number of menu items, valud menu items have numerical keys
    const menuItemCount = Object.keys(menu_obj).filter(key => !isNaN(key)).length
    currentScreen.prompt = "Select an option (1-" + menuItemCount.toString() + ")"
    currentScreen.message = null
    
    displayScreen(currentScreen)
    
    return new Promise((resolve) => {
        rl.question('', async (userInput) => { // Now in async!
            const cleanedInput = cleanInput(userInput)
            
            // Check if selection exists in menu
            if (!menu_obj[cleanedInput]) {
                // Invalid selection - set error message
                currentScreen.message = "Invalid Selection!"
                displayScreen(currentScreen)
                resolve(null)
                return
            }
            
            const selectedItem = menu_obj[cleanedInput]
            const action = selectedItem.action
            
            // All actions are handled by goTo now
            if (typeof action === 'string') {
                await goTo(action)
                resolve('goTo')
            } else {
                resolve(null)
            }
        })
    })
}

const createForm = (form_obj, formData = {}) => {
    if (!form_obj || !form_obj.fields) return ""
    
    // Create a display of all form fields with their current values
    return form_obj.fields.map(field => { // For each field in obj
            const value = formData[field.name] || ""
            const displayValue = field.name.toLowerCase().includes("password") && value ? "*".repeat(value.length) : value
            const optionalMark = field.required ? '' : ' *'
            
            if (value) {
                return field.label + optionalMark + ": " + displayValue
            } else {
                return field.label + optionalMark + ": [ ]"
            }
        })
        .join("\n")
}

const handleForm = async (form_obj) => {
    const formData = {}
    
    for (const field of form_obj.fields) {
        let fieldValue = ""
        let isValid = false
        
          while (!isValid) {
            // Set up screen to show entire form with current progress
            currentScreen.title = TITLE
            currentScreen.header = form_obj.name
            currentScreen.body = createForm(form_obj, formData)
            currentScreen.prompt = "Enter " + field.label.toLowerCase()
            currentScreen.message = null
            
            displayScreen(currentScreen)
            
            // Get user input
            fieldValue = await new Promise((resolve) => {
                rl.question('', (input) => {
                    resolve(cleanInput(input))
                })
            })
            
            // Check required fields and what-not
            const validation = validateField(field, fieldValue, formData)
            if (!validation.valid) {
                await showMessageAndWait(validation.message)
                // Clear the message and continue the loop to show the form again
                currentScreen.message = null
                continue
            }
            
            isValid = true
        }
        
        formData[field.name] = fieldValue
    }
    // Process the completed form
    await processForm(form_obj, formData)
}

const processForm = async (form_obj, formData) => {
    let success = false
    
    if (form_obj.id === "USER_LOGIN_FORM") {
        const result = authenticateUser(formData.email, formData.password)
        if (result.success) {
            loginUser(result.user)
            await showMessageAndWait("Login successful! Welcome, " + result.user.firstName + "! Role: " + result.user.role)
            success = true
        } else {
            await showMessageAndWait(result.message)
        }
    } else if (form_obj.id === "USER_CREATE_FORM") {
        const { confirmPassword, ...userData } = formData
        const result = createNewUser(userData)
        
        if (result.success) {
            await showMessageAndWait(result.message + " Your NHI number is: " + result.user.nhi)
            success = true
        } else {
            await showMessageAndWait(result.message)
        }
    } else if (form_obj.id === "SEARCH_PATIENT_FORM") {
        const patient = findPatientByNHI(formData.nhi)
        if (patient) {
            await showPatientRecord(patient)
            success = true
        } else {
            await showMessageAndWait("Patient with NHI " + formData.nhi + " not found!")
        }
    } else {
        // Default form completion for unknown forms
        await showMessageAndWait("Form " + form_obj.name + " completed successfully!")
        success = true
    }
    
    // Navigate based on success/failure and form's next property
    if (success && form_obj.next) {
        if (form_obj.next === "roleMenu") { // Should probably add function handling into goTo... but this works
            await goTo(roleMenu())
        } else {
            await goTo(form_obj.next)
        }
    } else {
        // If form failed, check if user is logged in.. This is just so you can go back if you accidentally enter a form
        if (currentUser) {
            // User is logged in, return to their role menu
            await goTo(roleMenu())
        } else {
            // User not logged in, go to login menu
            await goTo("LOGIN_MENU")
        }
    }
}

// ---- Records ----
// This section handles patient record viewing and management.

const showPatientRecord = async (patient) => {
    currentScreen.title = TITLE
    currentScreen.header = "Patient Medical Record"
    currentScreen.body = formatPatientRecord(patient)
    currentScreen.prompt = 'continue'
    currentScreen.message = null
    
    displayScreen(currentScreen)
    
    await new Promise(resolve => {
        rl.question('', () => resolve())
    })
    
    // Return to appropriate menu based on user role
    await goTo(roleMenu())
}

const showMyRecord = async () => {
    if (!currentUser || !currentUser.nhi) {
        await showMessageAndWait("Unable to access your medical record. Please contact support.")
        await goTo(roleMenu())
        return
    }
    
    const patient = findPatientByNHI(currentUser.nhi)
    if (!patient) {
        await showMessageAndWait("Your medical record was not found. Please contact support.")
        await goTo(roleMenu())
        return
    }
    
    await showPatientRecord(patient)
}

const showPatientList = async () => {
    const patients = loadPatients()
    
    if (patients.length === 0) {
        await showMessageAndWait("No patient records found.")
        await goTo(roleMenu())
        return
    }
    
    currentScreen.title = TITLE
    currentScreen.header = "All Patient Records"
    currentScreen.body = createPatientList(patients) // Updated function name
    currentScreen.prompt = 'continue'
    currentScreen.message = null
    
    displayScreen(currentScreen)
    
    await new Promise(resolve => {
        rl.question('', () => resolve())
    })
    
    // Return to appropriate menu based on user role
    await goTo(roleMenu())
}

// ---- Data ----
// This section is for managing data, including fetching, storing, and manipulating data used in the application.

const loadUsers = () => {
    try {
        const data = fs.readFileSync(USERS_DB_PATH, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2))
        return true
    } catch (error) {
        return false
    }
}

const loadPatients = () => {
    try {
        const data = fs.readFileSync(PATIENTS_DB_PATH, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

const findPatientByNHI = (nhi) => {
    const patients = loadPatients()
    return patients.find(patient => patient.nhi === parseInt(nhi))
}

const findUserByEmail = (email) => {
    const users = loadUsers()
    return users.find(user => user.email.toLowerCase() === email.toLowerCase())
}

const createNewUser = (userData) => {
    const users = loadUsers()
    
    // Check if user already exists
    if (findUserByEmail(userData.email)) {
        return { success: false, message: "User with this email already exists!" }
    }
    
    // Create new user object based on template
    const newUser = { ...EMPTY_USER_TEMPLATE, ...userData }
    
    // Set role to patient by default for new registrations
    if (!newUser.role) {
        newUser.role = "patient"
    }
    
    // Generate NHI for patients or ID for professionals
    if (newUser.role === "patient") {
        newUser.nhi = generateNHI()
        newUser.id = null
    } else if (newUser.role === "professional") {
        newUser.id = generateProfessionalId()
        newUser.nhi = null
    }
    
    users.push(newUser)
    
    if (saveUsers(users)) {
        return { success: true, message: "Account created successfully!", user: newUser }
    } else {
        return { success: false, message: "Failed to save user data!" }
    }
}

const generateNHI = () => {
    const users = loadUsers()
    let newNHI
    
    do { // Generate numbers until unique
        newNHI = Math.floor(Math.random() * 800000) + 200000 // Generate between 200000-999999
    } while (users.some(user => user.nhi === newNHI))
    
    return newNHI
}

const generateProfessionalId = () => {
    const users = loadUsers()
    let newId
    
    do {
        newId = Math.floor(Math.random() * 90000) + 10000 // Generate between 10000-99999
    } while (users.some(user => user.id === newId))
    
    return newId
}

// ---- Authentication ----
// This section handles user authentication, login/logout, and session management.

const authenticateUser = (email, password) => {
    const user = findUserByEmail(email)
    
    if (!user) {
        return { success: false, message: "User not found!" }
    }
    
    // In a real application, passwords would be hashed
    if (user.password !== password) {
        return { success: false, message: "Invalid password!" }
    }
    
    return { success: true, message: "Login successful!", user: user }
}

const loginUser = (user) => {
    currentUser = user
    return true
}

const logoutUser = () => {
    currentUser = null
    return true
}

const roleMenu = () => {
    if (!currentUser) {
        return "LOGIN_MENU"
    }
    
    const roleMenuMap = {
        "patient": "PATIENT_MENU",
        "professional": "PROFESSIONAL_MENU", 
        "admin": "ADMIN_MENU"
    }
    
    return roleMenuMap[currentUser.role] || "LOGIN_MENU"
}

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

const displayPrompt = (prompt) => { // Deprecated?
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
    
    // Display all components
    displayTitle(currentScreen.title);
    displayHeader(currentScreen.header);
    displayBody(currentScreen.body);
    displayPrompt(currentScreen.prompt);
}
// ---- Flow ----
// This section manages the flow of the application, including navigation, what happens when.

// Unified App Object - All forms, menus, and records are consolidated into a single APP_OBJ array
const APP_OBJ = [    
    // Forms
    {
        id: "USER_LOGIN_FORM",
        type: "form",
        name: "User Login",
        next: "roleMenu",
        fields: [
            { name: "email", type: "text", label: "Email Address", required: true },
            { name: "password", type: "password", label: "Password", required: true }
        ]
    },
    {
        id: "USER_CREATE_FORM",
        type: "form", 
        name: "Create Account",
        next: "LOGIN_MENU",
        fields: [
            { name: "firstName", type: "text", label: "First Name", required: true },
            { name: "lastName", type: "text", label: "Last Name", required: true },
            { name: "email", type: "text", label: "Email Address", required: true },
            { name: "password", type: "password", label: "Password", required: true },
            { name: "confirmPassword", type: "password", label: "Confirm Password", required: true },
            { name: "phone", type: "text", label: "Phone Number", required: false }
        ]
    },
    {
        id: "SEARCH_PATIENT_FORM",
        type: "form",
        name: "Search Patient by NHI",
        next: "roleMenu",
        fields: [
            { name: "nhi", type: "text", label: "Patient NHI Number", required: true }
        ]
    },
    // Records
    {
        id: "MY_PATIENT_RECORD",
        type: "record",
        name: "My Medical Record",
        description: "View your personal medical record"
    },
    {
        id: "VIEW_PATIENT_RECORDS_MENU",
        type: "record",
        name: "Patient Records List",
        description: "View all patient records"
    },
    // Menus
    {
        id: "LOGIN_MENU",
        type: "menu",
        name: "User Authentication",
        1: {
            title: "1. Login (Existing user)",
            action: "USER_LOGIN_FORM"
        },
        2: {
            title: "2. Create an account (New user)",
            action: "USER_CREATE_FORM"
        }
    },
    {
        id: "PATIENT_MENU",
        type: "menu",
        name: "Patient Dashboard",
        1: {
            title: "1. View My Medical Records",
            action: "MY_PATIENT_RECORD"
        },
        2: {
            title: "2. Logout",
            action: "LOGIN_MENU" // Navigate to login menu to logout
        }
    },
    {
        id: "PROFESSIONAL_MENU",
        type: "menu", 
        name: "Healthcare Professional Dashboard",
        1: {
            title: "1. Search Patient by NHI",
            action: "SEARCH_PATIENT_FORM"
        },
        2: {
            title: "2. View Patient Records",
            action: "VIEW_PATIENT_RECORDS_MENU"
        },
        3: {
            title: "3. Logout",
            action: "LOGIN_MENU" // Navigate to login menu to logout
        }
    },
    {
        id: "ADMIN_MENU",
        type: "menu",
        name: "Administrator Dashboard", 
        1: {
            title: "1. Search Patient by NHI",
            action: "SEARCH_PATIENT_FORM"
        },
        2: {
            title: "2. View Patient Records",
            action: "VIEW_PATIENT_RECORDS_MENU"
        },
        3: {
            title: "3. Logout",
            action: "LOGIN_MENU" // Navigate to login menu to logout
        }
    }
]

// Navigation function
const goTo = async (objectId) => {
    // Log out when goTo(LOGIN_MENU) is called
    if (objectId === "LOGIN_MENU") {
        if (currentUser) {
            await showMessageAndWait("You have been logged out successfully!")
            logoutUser()
        }
    }
    
    const appObj = findAppObject(objectId)
    
    if (appObj) {
        switch (appObj.type) {
            case 'menu':
                await handleMenu(appObj)
                break
            case 'form':
                await handleForm(appObj)
                break
            case 'record':
                // Handle records directly in goTo
                if (appObj.id === "MY_PATIENT_RECORD") {
                    await showMyRecord()
                } else if (appObj.id === "VIEW_PATIENT_RECORDS_MENU") {
                    await showPatientList()
                } else {
                    // Default record handling
                    await showMessageAndWait("Record type '" + appObj.name + "' not yet implemented!")
                    await goTo(roleMenu())
                }
                break
            default:
                currentScreen.message = "Unknown object type: " + appObj.type
                displayScreen(currentScreen)
        }
    } else {
        currentScreen.message = "Object with ID '" + objectId + "' not found!"
        displayScreen(currentScreen)
    }
}

// ---- Main ----
// This section is the entry point of the application, where everything comes together and starts running.

const startApp = () => {
    console.log("Starting Patient Health Management System...")
    goTo("LOGIN_MENU")
}

startApp() // Start the application

// ---- Testing ----
// This section is for application tests using JEST.

// ADD OTHER FUNCTIONS HERE AS THEY ARE DEVELOPED (DEPRECATED? I'M STILL ADDING THEM HERE FUCK YA)
module.exports = {
    startApp,
    EMPTY_USER_TEMPLATE,
    EMPTY_PATIENT_TEMPLATE,
    cleanInput,
    validateEmail,
    validateField,
    formatPatientRecord,
    createPatientList, // Updated function name
    showMessageAndWait,
    findAppObject,
    createMenu,
    handleMenu,
    createForm,
    handleForm,
    processForm,
    showPatientRecord,
    showMyRecord,
    showPatientList,
    loadUsers,
    saveUsers,
    loadPatients,
    findPatientByNHI,
    findUserByEmail,
    createNewUser,
    authenticateUser,
    loginUser,
    logoutUser,
    roleMenu,
    currentScreen,
    displayTitle,
    displayHeader,
    displayBody,
    displayPrompt,
    displayMessage,
    displayScreen,
    APP_OBJ,
    goTo
}