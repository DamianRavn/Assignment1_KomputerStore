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
    loanHideElements: [],
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
//When you want to work and make money
function work()
{
    state.workBalance += 100;
    updateWork();
}
//When you want to transfer money from work to bank
function bank()
{
    //Taking 10% from pay if there is a loan
    let loanMoney = state.workBalance * 0.1;
    state.workBalance -= loanMoney;
    state.loanBalance -= loanMoney;
    if (state.loanBalance <= 0) //if too much is paid for the loan, pay it to the bank. This negates the need to check if there is a loan in the first place, saving an if statement.
    {
        loanFullyRepaid();
    }

    //Updating state and ui
    state.bankBalance += state.workBalance;
    state.workBalance = 0;
    updateWork();
    updateBankUI();
    updateLoanUI();
}
//When you want to loan some cash
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

    //Prompt
    const loanAmount = Number(window.prompt("Enter number. Max twice as much as in bank balance"));
    
    //If they put in a valid response
    if (loanAmount)
    {
        if (loanAmount <= (maxLoanAmount()) && loanAmount > 0) 
        {
            //The loan went through
            window.confirm("Congratulations! You made a loan of " + numberFormater.format(loanAmount));
            state.loanBalance += loanAmount;
            state.bankBalance += loanAmount;
            
            updateBankUI();
            updateLoanUI();
            //Shows the loan button and text
            showLoanElements();
        }
        else
        {
            window.confirm("You can max loan " + numberFormater.format(maxLoanAmount()));
        }
    }
    else
    {
        window.confirm("You need to write a number to get a loan");
    }
}
//When you want to repay the entire loan
function repayLoan()
{
    state.loanBalance -= state.workBalance;
    state.workBalance = 0;
    if (state.loanBalance <= 0) //if too much is paid for the loan, pay it back to the work. This negates the need to check if there is a loan in the first place, saving an if statement.
    {
        loanFullyRepaid();
    }
    updateWork();
    updateLoanUI();
    updateBankUI();
}
//When a different laptop is chosen
function updateLaptops(element)
{
    state.currentLaptop = element.value;
    updateLaptopUI(element.value);
}
//When the user has finally bought a new computer
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
function maxLoanAmount()
{
    return state.bankBalance * 2;
}

//UI updaters
function updateLaptopUI(currentLaptop)
{
    const cl = allLaptops[currentLaptop];
    websiteElements.laptopFeaturesText.innerText  = cl.specs.join('\n'); //specs is an array, so I'm just making it into a string where every entry is it's own sentence
    websiteElements.computerHeader.innerText = cl.title;
    websiteElements.computerImg.setAttribute("src", "https://noroff-komputer-store-api.herokuapp.com/" + cl.image);
    websiteElements.computerPrice.innerText = numberFormater.format(cl.price);
    websiteElements.computerText.innerText = cl.description;
}

function updateWork()
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
    for (let i = 0; i < websiteElements.loanHideElements.length; i++) 
    {
        const element = websiteElements.loanHideElements[i];
        element.style.display = "flex";
    }
}
function hideLoanElements()
{
    for (let i = 0; i < websiteElements.loanHideElements.length; i++) 
    {
        const element = websiteElements.loanHideElements[i];
        element.style.display = "none";
    }
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
    hideLoanElements();
    state.currentLaptop = 1;
    updateLaptopUI(1);
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

function cacheNeededElements()
{
    //Bank elements
    websiteElements.loanBalance = document.getElementById("bank-outstanding-loan");
    websiteElements.loanHideElements = document.getElementsByClassName("hide-elements");
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


async function fetchData()
{
    let response = await fetch('https://noroff-komputer-store-api.herokuapp.com/computers');
    let laptops = await response.json();
    initData(laptops);
}

//We need the data before we can show a computer
fetchData();
