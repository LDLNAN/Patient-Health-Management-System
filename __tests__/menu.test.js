// Unit tests for menu handling functions

const readline = require('readline')

// Mock the handler functions
const mockGoToMenu = jest.fn()
const mockGoToForm = jest.fn()
const mockGoToRecord = jest.fn()

jest.mock('../mainapp.js', () => {
    const originalModule = jest.requireActual('../mainapp.js')
    return {
        ...originalModule,
        goToMenu: mockGoToMenu,
        goToForm: mockGoToForm,
        goToRecord: mockGoToRecord
    }
})

const { createMenu, handleMenu, LOGIN_MENU_ITEMS, currentScreen } = require('../mainapp.js')

describe('Menu Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Should return formatted menu string', () => {
        const testMenu = {
            1: { title: "1. Login" },
            2: { title: "2. Create Account" }
        }
        
        const result = createMenu(testMenu)
        
        expect(result).toBe("1. Login\n2. Create Account")
    })

    test('Should handle empty menu', () => {
        const result = createMenu({})
        
        expect(result).toBe("")
    })

    test('Should handle null menu', () => {
        const result = createMenu(null)
        
        expect(result).toBe("")
    })

    describe('handleMenu', () => {
        test('Should call goToMenu when user selects menu action', async () => {
            // Mock readline to return user input "1"........ this was a doozy.
            // https://stackoverflow.com/questions/70410348/how-to-mock-readline-createinterface-in-jest-tests#70410986
            jest.spyOn(readline, 'createInterface').mockImplementationOnce(() => {
                return ['1']
            })

            const subMenu = {
                type: "menu",
                name: "Sub Menu",
                1: { title: "Option 1", action: "option1" }
            }
            
            const testMenu = {
                1: { title: "1. Sub Menu", action: subMenu }
            }
            
            await handleMenu(testMenu)
            
            expect(mockGoToMenu).toHaveBeenCalledWith(subMenu)
        })

        test('Should call goToForm when user selects form action', async () => {
            // Mock readline to return user input "1"
            jest.spyOn(readline, 'createInterface').mockImplementationOnce(() => {
                return ['1']
            })

            const loginForm = {
                type: "form",
                name: "User Login",
                fields: ["email", "password"]
            }
            
            const testMenu = {
                1: { title: "1. Login", action: loginForm }
            }
            
            await handleMenu(testMenu)
            
            expect(mockGoToForm).toHaveBeenCalledWith(loginForm)
        })

        test('Should call goToRecord when user selects record action', async () => {
            // Mock readline to return user input "1"
            jest.spyOn(readline, 'createInterface').mockImplementationOnce(() => {
                return ['1']
            })

            const patientRecords = {
                type: "record",
                name: "Patient Records",
                dataSource: "patients.json"
            }
            
            const testMenu = {
                1: { title: "1. View Records", action: patientRecords }
            }
            
            await handleMenu(testMenu)
            
            expect(mockGoToRecord).toHaveBeenCalledWith(patientRecords)
        })

        test('Should handle invalid selection', async () => {
            jest.spyOn(readline, 'createInterface').mockImplementationOnce(() => {
                return ['3'] // Invalid option
            })
            
            const testMenu = {
                1: { title: "1. Login", action: "startUserLogin" },
                2: { title: "2. Create Account", action: "startUserCreate" }
            }
            
            await handleMenu(testMenu)
            
            expect(currentScreen.message).toBe("Invalid Selection!")
        })
    })
})