// Unit tests for menu handling functions

const { createMenu, LOGIN_MENU_ITEMS } = require('../mainapp.js')

describe('Menu Functions', () => {
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
})