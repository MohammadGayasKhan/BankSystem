# BankSystem
A system for a bank to lend money to borrowers and receive payment for the loans.
The system should have the following functions:

LEND: The bank can give loans to customers. There is no restriction on the loan amount and number of loans given to a customer. The function should take customer_id, loan_amount(P), loan_period(N) and rate of interest(I) as input. It should return the Total amount(A) to be paid and the monthly EMI to be paid.

PAYMENT: Customers can pay back loans either in the form of EMI or through LUMP SUM amounts. In the case of Lump sum payment, the lump sum amount will get deducted from the total amount. This can reduce the number of EMIs.

LEDGER: Customers can check all the transactions for a loan id. Along with all the transactions, It should also return the balance amount, monthly EMI and number of EMI left.

ACCOUNT OVERVIEW: This should list all the loans customers have taken. For each loan, it should tell the loan amount(P), Total amount(A), EMI amount, Total Interest(I), the amount paid till date, number of EMI left.
