// 1. Variable Declarations

// Tracks participants - used for the pie chart
let participants = [];
// An entry for every ticket
let tickets = [];
// Tracked so winners can't be picked again
let winners = [];
let chart = null;

const drumrollSound = document.getElementById('drumrollSound');
const winnerSound = document.getElementById('winnerSound');

// 2. Helper Functions
function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360; // Use golden angle approximation
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

// 3. Main Functionalities
function generateTickets() {
  // Read in the text + clear it
  const inputTextEle = document.getElementById('inputText');
  const inputText = inputTextEle.value;
  const lines = inputText.split('\n');
  inputTextEle.value = '';
  const mode = document.querySelector('input[name="mode"]:checked').value;

  // Clear the existing results
  const winnerElement = document.getElementById('winnerResult');
  winnerElement.classList.add('hidden');
  winnerElement.innerHTML = ``;

  // New round, clear the lists
  participants = [];
  tickets = [];
  winners = [];

  // Turn the text into tickets
  lines.forEach((line) => {
    if (line.trim() !== '') {
      const parts = line.split('\t').map((part) => part.trim());

      console.log(mode);
      console.log(parts);
      // BFL mode (last name, first name, form group, ticket count)
      if (mode === 'bfl' && parts.length === 3) {
        const [lastName, firstName] = parts[0]
          .split(',')
          .map((name) => name.trim());
        const ticketCount = parseInt(parts[2]);
        const name = `${firstName} ${lastName}`;
        participants.push({ name, tickets: ticketCount });

        for (let i = 0; i < ticketCount; i++) {
          tickets.push(name);
        }
      }
      // House mode (name, ticket count)
      else if (mode === 'house' && parts.length === 2) {
        const name = parts[0];
        const ticketCount = parseInt(parts[1]);

        participants.push({ name, tickets: ticketCount });

        for (let i = 0; i < ticketCount; i++) {
          tickets.push(name);
        }
      } else if (mode === 'name' && parts.length === 1) {
        console.log('names mode');
        const name = parts[0];
        const ticketCount = 1;
        participants.push({ name, tickets: ticketCount });

        for (let i = 0; i < ticketCount; i++) {
          tickets.push(name);
        }
      }
    }
  });

  // No tickets?
  if (tickets.length === 0) {
    document.getElementById('ticketContainer').innerHTML =
      'No valid ticket information found.';
    return;
  }

  // Generate the HTML for tickets - always wanted even if not going to be shown
  let ticketHtml = '';
  tickets.forEach((name) => {
    ticketHtml += `<div class="ticket">${name}</div>`;
  });

  document.getElementById('ticketContainer').innerHTML = ticketHtml;
  document.getElementById('pickWinnerBtn').style.display = 'block';
  document.getElementById('pickWinnerBtn').textContent = 'Pick a Winner!';

  toggleTicketDisplay();
  toggleWheelDisplay();
  updateWheelSegments();
}

function selectAndAnimateWinner() {
  if (tickets.length === 0) {
    alert('All tickets have been drawn!');
    return;
  }

  document.getElementById('pickWinnerBtn').disabled = true;

  // Select the winner using tickets
  const winningTicket = Math.floor(Math.random() * tickets.length);
  const winnerName = tickets[winningTicket];

  // Start the ticket highlight animation
  animateTicketSelection(winnerName);
}
function updateWheelSegments() {
  let segments = participants.map((p) => ({
    name: p.name,
    tickets: p.tickets,
  }));

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = segments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [segments[i], segments[j]] = [segments[j], segments[i]];
  }

  // Assign the shuffled array to wheelSegments
  wheelSegments = segments;

  drawWheel();
}

function selectAndAnimateWinner() {
  if (tickets.length === 0) {
    alert('All tickets have been drawn!');
    return;
  }

  document.getElementById('pickWinnerBtn').disabled = true;

  // Update wheel segments before selecting a new winner
  updateWheelSegments();

  // Select the winner using tickets
  const winningTicket = Math.floor(Math.random() * tickets.length);
  const winnerName = tickets[winningTicket];

  // Start the ticket highlight animation
  animateTicketSelection(winnerName);

  // Start the wheel spin animation
  spinWheel(winnerName);
}

function animateTicketSelection(winnerName) {
  const ticketElements = document.querySelectorAll('.ticket');
  let count = 0;
  const animationDuration = 5700;
  const intervalDuration = 200;

  drumrollSound.play();

  const animationInterval = setInterval(() => {
    ticketElements.forEach((ticket) => ticket.classList.remove('highlight'));
    const randomIndex = Math.floor(Math.random() * tickets.length);
    ticketElements[randomIndex].classList.add('highlight');
    count += intervalDuration;

    if (count >= animationDuration) {
      clearInterval(animationInterval);
      finalizeWinner(winnerName);
    }
  }, intervalDuration);
}

function spinWheel(winnerName) {
  if (spinning) return;

  spinning = true;
  let start = performance.now();
  let targetAngle = calculateTargetAngle(winnerName);
  let initialAngle = angle;
  let totalRotation = 10 * Math.PI + (targetAngle - initialAngle);

  function animateSpin(time) {
    let elapsed = time - start;
    let progress = elapsed / spinDuration;

    if (progress < 1) {
      let easeProgress = 1 - Math.pow(1 - progress, 3);
      angle = initialAngle + totalRotation * easeProgress;
      drawWheel();
      requestAnimationFrame(animateSpin);
    } else {
      spinning = false;
      angle = targetAngle;
      drawWheel();
    }
  }

  requestAnimationFrame(animateSpin);
}
function calculateTargetAngle(winnerName) {
  let totalTickets = wheelSegments.reduce(
    (sum, segment) => sum + segment.tickets,
    0
  );
  let currentAngle = 0;

  for (let segment of wheelSegments) {
    let segmentAngle = (segment.tickets / totalTickets) * 2 * Math.PI;
    if (segment.name === winnerName) {
      // Calculate the angle that puts this segment at the top
      return -currentAngle - segmentAngle / 2;
    }
    currentAngle += segmentAngle;
  }
  return 0; // Default to 0 if winner not found
}

function finalizeWinner(winnerName) {
  winners.push(winnerName);

  const winnerElement = document.getElementById('winnerResult');
  winnerElement.classList.remove('hidden');
  winnerElement.innerHTML = `
    <h2>🎉 Winner! 🎉</h2>
    ${winners.join('<br>')}
  `;

  const ticketElements = document.querySelectorAll('.ticket');
  tickets = tickets.filter((ticket) => ticket !== winnerName);
  participants = participants.filter(
    (participant) => participant.name !== winnerName
  );

  ticketElements.forEach((ticket) => {
    if (ticket.textContent === winnerName) {
      ticket.style.backgroundColor = '#90EE90';
      ticket.style.borderColor = '#32CD32';
      ticket.classList.add('highlight');
    } else {
      ticket.classList.remove('highlight');
    }
  });

  document.getElementById('pickWinnerBtn').disabled = false;
  document.getElementById('pickWinnerBtn').textContent = 'Pick again?';
}

// 4. Event Listeners
document
  .getElementById('showTicketsToggle')
  .addEventListener('change', toggleTicketDisplay);

document
  .getElementById('showWheelToggle')
  .addEventListener('change', toggleWheelDisplay);

// 5. Initial Setup
function toggleTicketDisplay() {
  const showTickets = document.getElementById('showTicketsToggle').checked;
  const ticketContainer = document.getElementById('ticketContainer');
  ticketContainer.style.display = showTickets ? 'flex' : 'none';
}

function toggleWheelDisplay() {
  const showTickets = document.getElementById('showWheelToggle').checked;
  const visualisationContainer = document.getElementById(
    'visualisationContainer'
  );
  visualisationContainer.style.display = showTickets ? 'flex' : 'none';
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

// Call these functions to initialize the page
toggleTicketDisplay();
let wheelCanvas = document.getElementById('wheelCanvas');
let ctx = wheelCanvas.getContext('2d');
let wheelSegments = []; // Will store objects with name and ticket count
let spinning = false;
let angle = 0;
let spinDuration = 5700; // 5 seconds of spinning
let spinSpeed = 30; // Initial spin speed
let spinAcceleration = 0.98; // Slows down over time
let winner = null;

function drawWheel() {
  let totalTickets = wheelSegments.reduce(
    (sum, segment) => sum + segment.tickets,
    0
  );
  let currentAngle = 0;

  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  wheelSegments.forEach((segment, i) => {
    let segmentAngle = (segment.tickets / totalTickets) * 2 * Math.PI;
    let endAngle = currentAngle + segmentAngle;

    // Draw the segment
    ctx.beginPath();
    ctx.moveTo(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.arc(
      wheelCanvas.width / 2,
      wheelCanvas.height / 2,
      wheelCanvas.width / 2,

      currentAngle + angle,
      endAngle + angle
    );
    ctx.fillStyle = i % 2 === 0 ? '#ff6b6b' : '#4ecdc4';
    ctx.fill();

    // Add text to the segment
    ctx.save();
    ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.rotate(currentAngle + segmentAngle / 2 + angle);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(segment.name, wheelCanvas.width / 2 - 20, 10);
    ctx.restore();

    currentAngle = endAngle;

    // Draw the pointer
    drawPointer();
  });
}

function drawPointer() {
  ctx.save();
  // Start on the right hand side of the wheel in the middle
  ctx.translate(wheelCanvas.width, wheelCanvas.height / 2);

  // Draw a circle for the pointer
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'gold';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}
