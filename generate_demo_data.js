const fs = require('fs')
const { faker } = require('@faker-js/faker')

const USERS_DB_PATH = './data/users.json'
const PATIENTS_DB_PATH = './data/patients.json'

// How many random patients to generate
const NUM_RANDOM_PATIENTS = 10

console.log('Generating demo database...')

// Generate person data that can be shared between user and patient records
const generateRandomPersonData = () => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const dateOfBirth = faker.date.birthdate({ min: 0, max: 100, mode: 'age' }).toISOString().split('T')[0]
    const gender = faker.person.gender()
    const phone = faker.phone.number()
    const email = faker.internet.email({ firstName, lastName })
    const password = faker.internet.password({ length: 12 })
    
    return {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        password
    }
}

// Create default users
const DEFAULT_USERS = [
    // Default Admin User
    {
        nhi: null,
        id: 12345,
        email: "admin@email.com",
        phone: "000-000-0000",
        address: {
            street: "123 Admin Street",
            city: "City",
            state: "State",
            zipCode: "8008",
        },
        password: "admin123",
        firstName: "System",
        lastName: "Administrator",
        gender: "Other",
        dateOfBirth: "0001-01-01",
        role: "admin",
    },
    // Default Professional User
    {
        nhi: null,
        id: 22333,
        email: "pro@email.com",
        phone: "000-000-0000",
        address: {
            street: "123 Pro Drive",
            city: "City",
            state: "State",
            zipCode: "8008",
        },
        password: "pro123",
        firstName: "Mista.",
        lastName: "Miyagi",
        gender: "Male",
        dateOfBirth: "1984-06-22",
        role: "professional",
    },    // Default Patient User
    {
        nhi: 100001,
        id: null,
        firstName: "Daniel",
        lastName: "LaRusso",
        dateOfBirth: "1984-06-22",
        gender: "Male",
        phone: "021-555-0003",
        email: "patient@email.com",
        password: "patient123",
        address: {
            street: "888 Dojo Lane",
            city: "Newark",
            state: "New Jersey",
            zipCode: "8008",
        },
        role: "patient",
    }
]
// Create default patient record for the default patient user
const DEFAULT_PATIENT_RECORD = {
    nhi: 100001,
    firstName: "Daniel",
    lastName: "LaRusso",
    dateOfBirth: "1984-06-22",
    gender: "Male",
    phone: "021-555-0003",
    email: "patient@email.com",
    password: "patient123",
    address: {
        street: "888 Dojo Lane",
        city: "Newark",
        state: "New Jersey",
        zipCode: "8008",
        country: "USA"
    },
    medicalHistory: {
        allergies: ["Cobra Venom"],
        currentMedications: ["Viagra"],
        bloodType: "O+",
        notes: "Built different."
    },
    assignedGP: 22333, // Assigned to default professional
}

// Generate random patients
const generateRandomPatients = (count) => {
    const randomPatients = []
    const randomUsers = []
    
    for (let i = 0; i < count; i++) {
        const personData = generateRandomPersonData()
        const nhiNumber = faker.number.int({ min: 200000, max: 999999 })
        
        // Create random patient user
        const patientUser = {
            nhi: nhiNumber,
            id: null,
            firstName: personData.firstName,
            lastName: personData.lastName,
            email: personData.email,
            phone: personData.phone,
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
            },
            password: personData.password,
            gender: personData.gender,
            dateOfBirth: personData.dateOfBirth,
            role: "patient",
        }
        
        // Create patient record
        const patientRecord = {
            nhi: nhiNumber,
            firstName: personData.firstName,
            lastName: personData.lastName,
            dateOfBirth: personData.dateOfBirth,
            gender: personData.gender,
            phone: personData.phone,
            email: personData.email,
            password: personData.password,
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
            },
            medicalHistory: {
                allergies: faker.helpers.arrayElements(["None", "Shellfish", "Peanuts", "Latex", "Dairy"], { min: 1, max: 3 }),
                currentMedications: faker.helpers.arrayElements(["None", "Aspirin", "Vitamin D", "Multivitamin", "Paracetamol"], { min: 0, max: 3 }),
                bloodType: faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
                notes: faker.lorem.sentence()
            },
            assignedGP: 22333, // Assign to default professional
        }
        
        randomUsers.push(patientUser)
        randomPatients.push(patientRecord)
    }
    
    return { randomUsers, randomPatients }
}

// Generate the random data
const { randomUsers, randomPatients } = generateRandomPatients(NUM_RANDOM_PATIENTS)

// Combine default users with random patient users
const ALL_USERS = [...DEFAULT_USERS, ...randomUsers]

// Combine default patient record with random patient records
const ALL_PATIENTS = [DEFAULT_PATIENT_RECORD, ...randomPatients]

// Create data directory if it doesn't exist
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data')
    console.log('Created data directory')
}

// Delete existing files if they exist
if (fs.existsSync(USERS_DB_PATH)) {
    fs.unlinkSync(USERS_DB_PATH)
    console.log('Deleted existing users.json')
}

if (fs.existsSync(PATIENTS_DB_PATH)) {
    fs.unlinkSync(PATIENTS_DB_PATH)
    console.log('Deleted existing patients.json')
}

try {
    // Write demo users data
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(ALL_USERS, null, 2))
    console.log('Created ' + USERS_DB_PATH + ' with ' + ALL_USERS.length + ' users')    // Write demo patients data
    fs.writeFileSync(PATIENTS_DB_PATH, JSON.stringify(ALL_PATIENTS, null, 2))
    console.log('Created ' + PATIENTS_DB_PATH + ' with ' + ALL_PATIENTS.length + ' patient records')

    console.log('Demo data generation complete!')
    console.log('Demo data includes:')
    console.log('1 Default Admin (admin@email.com / admin123)')
    console.log('1 Default Professional (pro@email.com / pro123)')
    console.log('1 Default Patient (patient@email.com / patient123)')
    console.log(NUM_RANDOM_PATIENTS + ' Random patients with faker data')
    console.log('All patients assigned to default professional (Mista. Miyagi, ID: 22333)')

} catch (error) {
    console.error('Error generating demo data:', error.message)
    process.exit(1)
}
