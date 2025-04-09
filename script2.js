let model;
let rooms = [];
let sharedCosts = {};

// Load AI model (pretrained to predict fair rent allocation)
async function loadModel() {
    model = await tf.loadLayersModel('model/model.json');
}
loadModel();

// Step navigation
function nextStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
    updateProgress(step);
}

// Add new room fields
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const newRoom = document.createElement('div');
    newRoom.className = 'room box';
    newRoom.innerHTML = `
        <div class="field">
            <label class="label">Room ${rooms.length + 1} Area (sqft)</label>
            <input class="input" type="number" placeholder="e.g., 200">
        </div>
        <div class="field">
            <label class="label">Has Private Bathroom?</label>
            <div class="control">
                <label class="radio">
                    <input type="radio" name="bathroom${rooms.length}" value="1"> Yes
                </label>
                <label class="radio">
                    <input type="radio" name="bathroom${rooms.length}" value="0" checked> No
                </label>
            </div>
        </div>
    `;
    container.appendChild(newRoom);
    rooms.push({ area: 0, bathroom: 0 });
}

// AI-powered rent prediction
async function predictFairRent(room) {
    const tensor = tf.tensor2d([[room.area, room.bathroom]]);
    const prediction = model.predict(tensor);
    return prediction.dataSync()[0];
}

// Calculate splits
async function calculateRent() {
    // Collect room data
    const roomInputs = document.getElementsByClassName('room');
    rooms = [];
    
    for (let i = 0; i < roomInputs.length; i++) {
        const area = parseFloat(roomInputs[i].querySelector('input[type="number"]').value) || 0;
        const bathroom = parseInt(roomInputs[i].querySelector('input[type="radio"]:checked').value);
        const aiFairRent = await predictFairRent({ area, bathroom });
        
        rooms.push({
            area,
            bathroom,
            baseRent: aiFairRent // AI suggestion
        });
    }

    // Shared costs
    const totalRent = parseFloat(document.getElementById('totalRent').value);
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;

    // Rent/sqft calculation
    const totalArea = rooms.reduce((sum, room) => sum + room.area, 0);
    const rentPerSqft = totalRent / totalArea;

    // Final calculation
    let resultsHTML = '<h3 class="title is-5">💵 Breakdown</h3>';
    rooms.forEach((room, index) => {
        const roomRent = room.area * rentPerSqft;
        const sharedCostPerPerson = electricity / rooms.length;
        
        resultsHTML += `
            <div class="box">
                <h4>Room ${index + 1}</h4>
                <p>Rent ($${room.area} sqft × $${rentPerSqft.toFixed(2)}/sqft): $${roomRent.toFixed(2)}</p>
                <p>AI Suggested Fair Rent: $${room.baseRent.toFixed(2)}</p>
                <p>Shared Costs: $${sharedCostPerPerson.toFixed(2)}</p>
                <p class="has-text-weight-bold">Total: $${(roomRent + sharedCostPerPerson).toFixed(2)}</p>
            </div>
        `;
    });

    document.getElementById('results').innerHTML = resultsHTML;
    renderChart(rooms);
}

// Chart rendering
function renderChart(rooms) {
    const ctx = document.getElementById('rentChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rooms.map((_, i) => `Room ${i + 1}`),
            datasets: [{
                label: 'Rent Allocation',
                data: rooms.map(room => room.area * (totalRent / totalArea)),
                backgroundColor: '#4CAF50'
            }]
        }
    });
}