// Mortgage Calculator
var salary = 40000;
var years = 30; 
var annualInterest = 0.03;
var houseprice = 300000;
var initialDeposit = 0.05;

function calculateMortgage(salary, years, annualInterest, houseprice, initialDeposit, err){
    if (err)
        throw (err);
    var yearlyRepayments =  0.3*salary;
    var principal;
    principal = (houseprice * (1-initialDeposit))
    var remaining = principal;
    for (i = 0; i < years; i++) { 
            remaining -= yearlyRepayments
            remaining = remaining * (1+annualInterest)
            console.log(remaining)
};
    return remaining;
}
x = calculateMortgage(salary,years,annualInterest,houseprice, initialDeposit);