// Unit tests for utility functions
// This file contains tests for input cleaning and email validation utilities

const { cleanInput, validateEmail } = require('../mainapp.js')

describe('Utility Functions', () => {
    describe('cleanInput', () => {
        test('Should trim blank spaces', () => {
            expect(cleanInput('  hello world  ')).toBe('hello world')
        })

        test('Should remove < and > characters', () => { // IMPORTANT FOR SECURITY
            expect(cleanInput('hello<example>world')).toBe('helloexampleworld')
            expect(cleanInput('<example>example</example>')).toBe('example/tag')
        })

        test('Should handle trimming and character removal', () => {
            expect(cleanInput('  <hello>world</>  ')).toBe('helloworld/')
        })

        test('Should return empty string for non-string inputs', () => {
            expect(cleanInput(null)).toBe('')
            expect(cleanInput(123)).toBe('')
            expect(cleanInput(true)).toBe('')
        })

        test('Should handle empty strings', () => {
            expect(cleanInput('')).toBe('')
            expect(cleanInput('   ')).toBe('')
        })
    })

    describe('validateEmail', () => {
        test('Should accept valid email formats', () => {
            expect(validateEmail('example@example.com')).toBe(true)
            expect(validateEmail('example.email@example.org')).toBe(true)
            expect(validateEmail('example@example.com')).toBe(true)
        })

        test('Should reject invalid email formats', () => {
            expect(validateEmail('example.com')).toBe(false)
            expect(validateEmail('example@')).toBe(false)
            expect(validateEmail('@example.com')).toBe(false)
            expect(validateEmail('example@example')).toBe(false)
        })

        test('Should reject emails with spaces', () => {
            expect(validateEmail('example @example.com')).toBe(false)
            expect(validateEmail('example@ example.com')).toBe(false)
        })

        test('Should reject empty or null inputs', () => {
            expect(validateEmail('')).toBe(false)
            expect(validateEmail(null)).toBe(false)
            expect(validateEmail(undefined)).toBe(false)
        })
    })
})
