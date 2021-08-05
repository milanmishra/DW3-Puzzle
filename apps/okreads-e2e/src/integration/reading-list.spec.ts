describe('When: I use the reading list feature', () => {
  beforeEach(() => {
    cy.startAt('/');
  });

  it('Then: I should see my reading list', () => {
    cy.get('[data-testing="toggle-reading-list"]').click();

    cy.get('[data-testing="reading-list-container"]').should(
      'contain.text',
      'My Reading List'
    );
  });

  it('Then: I should be able to add book to the reading list and mark it as finished', () => {
    cy.get('input[type="search"]').type('test');

    cy.get('form').submit();

    cy.get('[data-testing="want-to-read-btn"]').first().click();

    cy.get('[data-testing="toggle-reading-list"]').click();

    cy.get('.reading-list-item').should('have.length', 1);

    cy.get('[data-testing="want-to-read-btn"]').first().should('have.text', ' Want to Read ');

    cy.get('[data-testing="mark-as-finished"]').click();

    cy.get('[data-testing="finished-book-on"]').first().invoke('text').should('match', /^ Finished /);

    cy.get('[data-testing="want-to-read-btn"]').first().should('have.text', ' Finished ');
  })
});
