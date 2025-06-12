// Unit tests for display functions
// Tests expected console output behavior for UI display functions

const { // Import functions from mainapp.js
    displayTitle, 
    displayHeader, 
    displayBody, 
    displayPrompt, 
    displayMessage, 
    displayScreen 
} = require('../mainapp.js')

// Mock console methods
let consoleOutput = []
const mockConsole = { // Create mock console, with mock log and clear functions
    log: jest.fn((...args) => consoleOutput.push(args.join(' '))),
    clear: jest.fn(() => consoleOutput.push('CLEAR'))
}

beforeEach(() => {
    consoleOutput = []
    console.log = mockConsole.log
    console.clear = mockConsole.clear
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('Display Functions', () => {
    describe('displayTitle', () => {
        test('Should display title with decorations', () => {
            displayTitle('Patient Health System')
            
            expect(consoleOutput).toEqual([
                'Patient Health System',
                '═════════════════════'
            ])
        })

        test('Should handle empty and null titles', () => {
            displayTitle('')
            displayTitle(null)
            
            expect(consoleOutput).toEqual([])
        })
    })    
    describe('displayHeader', () => {
        test('Should display header text with decoration', () => {
            displayHeader('Hello, Johnny Lawrence!')
            
            expect(consoleOutput).toEqual([
                'Hello, Johnny Lawrence!',
                '───────────────────────'
            ])
        })

        test('Should handle empty header', () => {
            displayHeader('')
            displayHeader(null)
            
            expect(consoleOutput).toEqual([
                ''
            ])
        })
    })    
    describe('displayBody', () => {
        test('Should display body content', () => {
            displayBody('1. Login (Existing user)\n2. Create account (New user)')
            
            expect(consoleOutput).toEqual([
                '1. Login (Existing user)\n2. Create account (New user)'
            ])
        })

        test('Should handle empty body', () => {
            displayBody('')
            displayBody(null)
            
            expect(consoleOutput).toEqual([])
        })
    })

    describe('displayPrompt', () => {
        test('Should display prompt with decoration, an arrow indicator, and ": "', () => {
            displayPrompt('Enter your choice (1-2)')
            
            expect(consoleOutput).toEqual([
                '───────────────────────────',
                '> Enter your choice (1-2): '
            ])
        })

        test('Should display continue prompt without ": "', () => {
            displayPrompt('continue')

            expect(consoleOutput).toEqual([
                '────────────────────────────',
                '> Press enter to continue...'
            ])
        })

        test('Should handle empty prompt', () => {
            displayPrompt('')
            displayPrompt(null)
            
            expect(consoleOutput).toEqual(['...'])
        })
    })

    describe('displayMessage', () => {
        test('Should display info messages with brackets', () => {
            displayMessage('Login successful!')
            
            expect(consoleOutput).toEqual([
                '[Login successful!]'
            ])
        })

        test('Should not display when there is no message', () => {
            displayMessage('')
            displayMessage(null)
            
            expect(consoleOutput).toEqual([])
        })
    })    
    describe('displayScreen', () => {
        test('Should display complete screen with all components', () => {
            const screen = {
                title: 'Patient Health System',
                header: 'Welcome!',
                body: '1. Login\n2. Create Account',
                prompt: 'Select an option',
                message: null
            }
            
            displayScreen(screen)
            
            expect(consoleOutput).toEqual([
                'CLEAR',
                'Patient Health System',
                '═════════════════════',
                'Welcome!',
                '────────',
                '1. Login\n2. Create Account',
                '────────────────────',
                '> Select an option: '
            ])
        })

        test('Should show only title + message', () => {
            const screen = {
                title: 'Patient Health System',
                header: 'Welcome!',
                body: '1. Login\n2. Create Account',
                prompt: 'Select an option',
                message: 'Log-in Successful!'
            }
            
            displayScreen(screen)
            
            expect(consoleOutput).toEqual([
                'CLEAR',
                'Patient Health System',
                '═════════════════════',
                '[Log-in Successful!]',
                '────────────────────────────',
                '> Press enter to continue...'
            ])
        })

        test('Should handle empty screen object', () => {
            displayScreen({})
            
            expect(consoleOutput).toEqual([
                'CLEAR'
            ])
        })

        test('Should handle null screen object', () => {
            displayScreen(null)
            
            expect(consoleOutput).toEqual([])
        })
    })
})
