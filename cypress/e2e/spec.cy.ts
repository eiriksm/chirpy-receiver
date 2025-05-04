describe('template spec', () => {
  it('passes', () => {
    cy.visit('/receiver-web/dist/test.html')
    cy.contains('pre.data', 'test').should('not.exist')
    cy.get('button').click()
    cy.contains('pre.data', 'test').should('exist')
  })
})
