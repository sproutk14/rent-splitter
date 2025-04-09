function calculateRent() {
    const totalRent = parseFloat(document.getElementById('totalRent').value);
    const numFlatmates = parseInt(document.getElementById('numFlatmates').value);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    // Input validation
    if (!totalRent || !numFlatmates || numFlatmates < 1) {
        resultsDiv.innerHTML = '<p class="error">Please enter valid values!</p>';
        return;
    }

    // Calculate rent per person
    const rentPerPerson = totalRent / numFlatmates;

    // Calculate shared bills
    const billEntries = document.getElementsByClassName('bill-amount');
    let totalBills = 0;
    let billsHTML = '<h3>Shared Bills Breakdown:</h3>';
    
    Array.from(billEntries).forEach((bill, index) => {
        const billName = document.getElementsByClassName('bill-name')[index].value || `Bill ${index + 1}`;
        const amount = parseFloat(bill.value) || 0;
        totalBills += amount;
        billsHTML += `<p>${billName}: $${amount.toFixed(2)}</p>`;
    });

    // Display results
    resultsDiv.innerHTML = `
        <p>Total Rent: $${totalRent.toFixed(2)}</p>
        <p>Total Shared Bills: $${totalBills.toFixed(2)}</p>
        <p>Total per Flatmate: <strong>$${(rentPerPerson + (totalBills / numFlatmates)).toFixed(2)}</strong></p>
        ${billsHTML}
    `;

    // Render chart
    renderChart(totalRent, totalBills, numFlatmates);
}

function addBillField() {
    const container = document.getElementById('billsContainer');
    const newBill = document.createElement('div');
    newBill.className = 'bill-entry';
    newBill.innerHTML = `
        <input type="text" placeholder="Bill name" class="bill-name">
        <input type="number" placeholder="Amount ($)" class="bill-amount">
    `;
    container.appendChild(newBill);
}

function renderChart(rent, bills, flatmates) {
    const ctx = document.getElementById('rentChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Rent', 'Shared Bills'],
            datasets: [{
                data: [rent, bills],
                backgroundColor: ['#4CAF50', '#2196F3']
            }]
        },
        options: { responsive: true }
    });
}