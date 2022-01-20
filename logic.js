// cache the data and keep track of state
const state =
{
    loanBalance: 0,
    bankBalance: 0,
    workBalance: 0,
    currentLaptop: 0
};
const websiteElements =
{
    bankBalance: null,
    loanBalance: null,
    repayLoanButton: null,
    workBalance: null,
    laptopFeaturesText: null,
    computerHeader: null,
    computerText: null,
    computerPrice: null,
    computerImg: null
}
const allLaptops = {};
const numberFormater = new Intl.NumberFormat('da', { style: 'currency', currency: 'DKK' })

// Button onclick events (plus options selector)
function work()
{
    state.workBalance += 100;
    updateWorkUI();
}
function bank()
{
    //Taking 10% from pay if there is a loan
    let loanMoney = state.workBalance * 0.1;
    state.workBalance -= loanMoney;
    state.loanBalance -= loanMoney;
    if (state.loanBalance <= 0) //if too much is paid for the loan, pay it back to the work. This negates the need to check if there is a loan in the first place, saving an if statement.
    {
        loanFullyRepaid();
    }

    //Updating numbers and ui
    state.bankBalance += state.workBalance;
    state.workBalance = 0;
    updateWorkUI();
    updateBankUI();
    updateLoanUI();
}
function loan()
{
    if (state.loanBalance > 0) 
    {
        window.confirm("You need to pay up your debt first.");
        return;
    }
    if (state.bankBalance === 0) 
    {
        window.confirm("You need money in your bank account first.");
        return;
    }

    const loanAmount = Number(window.prompt("Enter number. Max twice as much as in bank balance"));
    
    if (loanAmount) 
    {
        if (loanAmount <= (state.bankBalance * 2) && loanAmount > 0) 
        {
            window.confirm("Congratulations! You made a loan of " + numberFormater.format(loanAmount));
        }
        else
        {
            window.confirm("You can max loan " + numberFormater.format((state.bankBalance * 2)));
            return;
        }
        
    }
    else
    {
        window.confirm("You need to write a number to get a loan");
        return;
    }

    state.loanBalance += loanAmount;
    state.bankBalance += loanAmount;
    
    updateBankUI();
    updateLoanUI();
    //Shows the loan button and text
    showLoanElements();
}
function repayLoan()
{
    state.loanBalance -= state.workBalance;
    state.workBalance = 0;
    if (state.loanBalance <= 0) //if too much is paid for the loan, pay it back to the work. This negates the need to check if there is a loan in the first place, saving an if statement.
    {
        loanFullyRepaid();
    }
    updateWorkUI();
    updateLoanUI();
    updateBankUI();
}
function updateLaptops(element)
{
    state.currentLaptop = element.value;
    updateLaptopUI(element.value);
}
function buyLaptop()
{
    const price = allLaptops[state.currentLaptop].price;
    if (state.bankBalance <= price) 
    {
        window.confirm("Not enough money to buy!");
        return;
    }

    state.bankBalance -= price;
    window.confirm("Congratulations! You are the proud owner of " + allLaptops[state.currentLaptop].title);

    updateBankUI();
}

//Helper functions
function loanFullyRepaid()
{
    state.bankBalance += Math.abs(state.loanBalance);
    state.loanBalance = 0;
    
    hideLoanElements();
}

//UI updaters
function updateLaptopUI(currentLaptop)
{
    const cl = allLaptops[currentLaptop];
    websiteElements.laptopFeaturesText.innerText = cl.specs.join('\n'); //specs is an array, so I'm just making it into a string where every entry is it's own sentence
    websiteElements.computerHeader.innerText = cl.title;
    websiteElements.computerImg.setAttribute("src", "https://noroff-komputer-store-api.herokuapp.com/" + cl.image);
    websiteElements.computerPrice.innerText = numberFormater.format(cl.price);
    websiteElements.computerText.innerText = cl.description;
}

function updateWorkUI()
{
    websiteElements.workBalance.innerText = numberFormater.format(state.workBalance);
}
function updateBankUI()
{
    websiteElements.bankBalance.innerText = numberFormater.format(state.bankBalance);
}
function updateLoanUI()
{
    websiteElements.loanBalance.innerText = numberFormater.format(state.loanBalance);
}

function showLoanElements()
{
    websiteElements.repayLoanButton.style.display = "block";
    websiteElements.loanBalance.style.display = "block";
}
function hideLoanElements()
{
    websiteElements.repayLoanButton.style.display = "none";
    websiteElements.loanBalance.style.display = "none";
}

// fetch, cache and show it on the website
function initData(laptops)
{
    const laptopSelector = document.getElementById("Laptop-picker");

    for (let i = 0; i < laptops.length; i++) 
    {
        const laptop = laptops[i];
        cacheLaptops(laptop);
        createOptionElements(laptopSelector, laptop);
    }
    cacheNeededElements();
    websiteElements.repayLoanButton.style.display = "none";
    websiteElements.loanBalance.style.display = "none";
    state.currentLaptop = 1;
    updateLaptopUI(1);
}
function cacheNeededElements()
{
    //Bank elements
    websiteElements.loanBalance = document.getElementById("bank-outstanding-loan");
    websiteElements.repayLoanButton = document.getElementById("bank-repay-button");
    websiteElements.bankBalance = document.getElementById("bank-balance");

    //Work elements
    websiteElements.workBalance = document.getElementById("work-pay");

    //Computer elements
    websiteElements.laptopFeaturesText = document.getElementById("laptop-features");
    websiteElements.computerHeader = document.getElementById("computer-header");
    websiteElements.computerImg = document.getElementById("computer-img");
    websiteElements.computerPrice = document.getElementById("computer-price");
    websiteElements.computerText = document.getElementById("computer-text");
}

//Create the option element and then set value to id before adding to dom. This way I can easily access the laptop using id
function createOptionElements(laptopSelector, laptop)
{
    let laptopOption = document.createElement("option");
    laptopOption.setAttribute("value", laptop.id);
    laptopOption.innerText = laptop.title;
    laptopSelector.appendChild(laptopOption);
}

function cacheLaptops(laptop)
{
    // Javascript is loose with the rules, so I can copy the info directly into an object
    allLaptops[laptop.id] = laptop;
}
async function fetchData()
{
    let response = await fetch('https://noroff-komputer-store-api.herokuapp.com/computers');
    let laptops = await response.json();
    initData(laptops);
}

//We need the data before we can show a computer
fetchData();
