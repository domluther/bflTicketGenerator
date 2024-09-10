let participants = [];
let tickets = [];
const drumrollSound = document.getElementById('drumrollSound');
const winnerSound = document.getElementById('winnerSound');

function generateTickets() {
  const input = document.getElementById('inputText').value;
  const lines = input.split('\n');
  const randomOrder = document.getElementById('randomToggle').checked; // Check toggle state
  participants = [];
  tickets = [];

  lines.forEach((line) => {
    if (line.trim() !== '') {
      // Split the line by tabs (\t) and trim whitespace
      const parts = line.split('\t').map((part) => part.trim());
      if (parts.length === 3) {
        const [lastName, firstName] = parts[0]
          .split(',')
          .map((name) => name.trim());
        const classGroup = parts[1]; // Class (e.g., '07S')
        const ticketCount = parseInt(parts[2]); // Number of tickets

        const name = `${firstName} ${lastName}`;
        participants.push({ name: name, tickets: ticketCount, classGroup });

        for (let i = 0; i < ticketCount; i++) {
          tickets.push(name);
        }
      }
    }
  });

  // Shuffle tickets if randomOrder is true
  if (randomOrder) {
    tickets = shuffleArray(tickets);
  }

  // Generate the ticket HTML
  let ticketHtml = '';
  tickets.forEach((name) => {
    ticketHtml += `<div class="ticket">${name}</div>`;
  });

  document.getElementById('ticketContainer').innerHTML =
    ticketHtml || 'No valid ticket information found.';
  document.getElementById('pickWinnerBtn').style.display =
    participants.length > 0 ? 'block' : 'none';

  displayTicketSummary(); // Display ticket summary after generating tickets
}

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startWinnerSelection() {
  document.getElementById('pickWinnerBtn').disabled = true;
  const ticketElements = document.querySelectorAll('.ticket');
  let count = 0;
  const animationDuration = 5700; // how long to animate for
  const intervalDuration = 200; // 0.1 second per highlight

  drumrollSound.play();

  const animationInterval = setInterval(() => {
    ticketElements.forEach((ticket) => ticket.classList.remove('highlight'));
    const randomIndex = Math.floor(Math.random() * tickets.length);
    ticketElements[randomIndex].classList.add('highlight');
    count += intervalDuration;

    if (count >= animationDuration) {
      clearInterval(animationInterval);
      // No longer play 2 sounds, all a single sound
      // drumrollSound.pause();
      // drumrollSound.currentTime = 0;
      pickWinner();
    }
  }, intervalDuration);
}

function pickWinner() {
  const winningTicket = Math.floor(Math.random() * tickets.length);
  const winnerName = tickets[winningTicket];

  // All a single sound - so not this any more
  // winnerSound.play();

  const winnerElement = document.getElementById('winnerResult');
  winnerElement.classList.remove('hidden');
  winnerElement.innerHTML = `
    <h2>🎉 Winner! 🎉</h2>
    ${winnerName}
  `;

  // Highlight winning tickets
  const ticketElements = document.querySelectorAll('.ticket');
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
}

// Not very pretty so called but not shown for now
function displayTicketSummary() {
  const totalTickets = tickets.length;
  let summaryHtml = `Total Tickets: ${totalTickets}<br>`;
  participants.forEach((participant) => {
    summaryHtml += `${participant.name} : ${participant.tickets} tickets<br>`;
  });
  document.getElementById('ticketSummary').innerHTML = summaryHtml;
}

// Need to update so the same person can't win multiple times
function pickWinners() {
  const winnerCount = parseInt(document.getElementById('winnerCount').value);
  const winners = [];
  const ticketElements = document.querySelectorAll('.ticket');

  for (let i = 0; i < winnerCount; i++) {
    const winningTicket = Math.floor(Math.random() * tickets.length);
    winners.push(tickets[winningTicket]);
  }

  let winnerHtml = '<h2>🎉 Winners! 🎉</h2>';
  winners.forEach((winnerName) => {
    winnerHtml += `${winnerName}<br>`;

    // Highlight winning tickets
    ticketElements.forEach((ticket) => {
      if (ticket.textContent === winnerName) {
        ticket.style.backgroundColor = '#90EE90';
        ticket.style.borderColor = '#32CD32';
        ticket.classList.add('highlight');
      }
    });
  });

  const winnerElement = document.getElementById('winnerResult');
  winnerElement.classList.remove('hidden');
  winnerElement.innerHTML = winnerHtml;

  document.getElementById('pickWinnerBtn').disabled = false;
}

// Can be a bit glitchy - can still have a person highlighted in yellow even after the winners are picked
function enhancedAnimation() {
  const ticketElements = document.querySelectorAll('.ticket');
  let count = 0;
  const animationDuration = 5700;
  let intervalDuration = 200;

  drumrollSound.play();

  const animationInterval = setInterval(() => {
    ticketElements.forEach((ticket) => ticket.classList.remove('highlight'));
    const randomIndex = Math.floor(Math.random() * tickets.length);
    ticketElements[randomIndex].classList.add('highlight');
    count += intervalDuration;

    // Dynamic animation speed changes for enhanced effect
    if (count < animationDuration / 2) {
      intervalDuration = 100; // Speed up in the middle
    } else if (count > animationDuration / 1.5) {
      intervalDuration = 300; // Slow down towards the end
    }

    if (count >= animationDuration) {
      clearInterval(animationInterval);
      pickWinners();
    }
  }, intervalDuration);
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}
