describe('The shipped assets', () => {
  it('Test 1 wav', () => {
    cy.visit('/receiver-web/dist/test.html')
    cy.contains('.test-1 pre.data', 'test').should('not.exist')
    cy.get('.test-1 button').click()
    cy.contains('.test-1 pre.data', 'test').should('exist')
  })
  it('Test 2 wav', () => {
    cy.visit('/receiver-web/dist/test.html')
    cy.contains('.test-2 pre.data', 'test').should('not.exist')
    cy.get('.test-2 button').click()
    cy.contains('.test-2 pre.data', '🚀️').should('exist')
  })
})
