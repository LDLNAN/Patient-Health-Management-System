const { initializeDataFiles } = require('../mainapp')
const fs = require('fs')
const path = require('path')

const MOCK_USERS_DB_PATH = './data/users.json' // Mock path for users database
const MOCK_PATIENTS_DB_PATH = './data/patients.json' // Mock path for patients database

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn(), // Mock existsSync
    writeFileSync: jest.fn(), // Mock writeFileSync
}))

beforeEach(() => {
    jest.clearAllMocks()
})

test('creates data directory and files if missing', () => {
    fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false) // Simulates missing patients.json, and missing users.json

    initialiseDataFiles() // Runs the function with mocked return value

    expect(fs.writeFileSync).toHaveBeenCalledWith(MOCK_USERS_DB_PATH, '[]') // Check if users.json was created, and is empty
    expect(fs.writeFileSync).toHaveBeenCalledWith(MOCK_PATIENTS_DB_PATH, '[]') // Check if users.json was created, and is empty
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
})

test('does nothing if everything exists', () => {
    fs.existsSync.mockReturnValue(true) // Simulate both files existing

    initialiseDataFiles() // Runs the function with mocked return value

    expect(fs.writeFileSync).not.toHaveBeenCalled() // Check if writeFileSync was not called
})