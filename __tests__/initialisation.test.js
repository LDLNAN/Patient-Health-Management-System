const fs = require('fs')
const path = require('path')

// Import the actual function but we'll test it in isolation
let initialiseDataFiles

// Mock the entire fs module to prevent any real file operations
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn()
}))

// Mock console.log to prevent test output noise
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

// Import AFTER mocking to ensure mocks are applied
beforeAll(() => {
    initialiseDataFiles = require('../mainapp').initialiseDataFiles
})

beforeEach(() => {
    jest.clearAllMocks()
})

afterAll(() => {
    console.log.mockRestore()
    console.error.mockRestore()
})

describe('initialiseDataFiles', () => {
    test('creates both data files when they do not exist', () => {
        // Mock both files as missing
        fs.existsSync.mockReturnValue(false)

        initialiseDataFiles()

        // Verify both files are created with empty arrays
        expect(fs.writeFileSync).toHaveBeenCalledWith('./data/users.json', '[]')
        expect(fs.writeFileSync).toHaveBeenCalledWith('./data/patients.json', '[]')
        expect(fs.writeFileSync).toHaveBeenCalledTimes(2)
    })

    test('does not create files when they already exist', () => {
        // Mock both files as existing
        fs.existsSync.mockReturnValue(true)

        initialiseDataFiles()

        // Verify no files are created
        expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    test('creates only missing files', () => {
        // Mock users.json exists, patients.json does not
        fs.existsSync
            .mockReturnValueOnce(false) // users.json missing
            .mockReturnValueOnce(true)  // patients.json exists

        initialiseDataFiles()

        // Verify only users.json is created
        expect(fs.writeFileSync).toHaveBeenCalledWith('./data/users.json', '[]')
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
        expect(fs.writeFileSync).not.toHaveBeenCalledWith('./data/patients.json', '[]')
    })
})