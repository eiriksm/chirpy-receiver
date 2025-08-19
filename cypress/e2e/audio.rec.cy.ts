describe('Main app with recording', () => {
  it('Should have a record button in there', () => {
    cy.visit('/receiver-web/dist/index.html')
    // We also need to click the 32 Hz button
    cy.get('button#rate-32').click();
    cy.get('.audio-decoder').should('exist')
    cy.get('.audio-decoder .start-record').click();
    // Wait for 11 seconds, the duration of the recording.
    cy.wait(12000);
    cy.get('.audio-decoder .stop-record').click();
    cy.get('.actual-decoded-message', {
      timeout: 20000
    }).contains('test')
  })
})
