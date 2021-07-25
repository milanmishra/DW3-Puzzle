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

  it('Then: I should be able to add book to the reading list and remove it', () => {
    cy.get('input[type="search"]').type('test1');

    cy.wait(5000);

    cy.get('[data-testing="add-book"]').first().click();

    cy.get('[data-testing="toggle-reading-list"]').click();

    cy.get('[data-testing="reading-list-container"]').should('have.length', 1);

    cy.get('[data-testing="remove-book"]').last().click();
    
    cy.get('[data-testing="reading-list-item"]').should('have.length', 0);
  });

  it('Then: I should be able to remove book from the reading list and Undo it', () => {
    cy.get('input[type="search"]').type('test2');
    
    cy.wait(5000);

    cy.get('[data-testing="add-book"]:enabled').first().click();

    cy.get('.reading-list-item').should('have.length', 1);

    cy.get('[data-testing="toggle-reading-list"]').click();

    cy.get('[data-testing="remove-book"]:enabled').click();

    cy.get('.reading-list-item').should('have.length', 0);

    cy.get('.mat-simple-snackbar-action button').last().click();

    cy.get('[data-testing="reading-list-item"]').should('have.length', 1);
  });

  it('Then: I should be able to add book to the reading list and Undo it', () => {
    cy.get('input[type="search"]').type('test3');

    cy.wait(5000);

    cy.get('[data-testing="add-book"]:enabled').first().click();

    cy.get('[data-testing="reading-list-item"]').should('have.length', 1);

    cy.get('.mat-simple-snackbar-action button').last().click();

    cy.get('[data-testing="reading-list-item"]').should('have.length', 0);
  });
});
