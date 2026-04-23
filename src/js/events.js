// Events Data - Fetched from JSON
let upcomingEvents = [];
let pastEvents = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function isRn26Event(event) {
  const title = (event?.title || '').toLowerCase();
  return event?.id === 1 || title.includes('robonexus');
}

function isInductionsEvent(event) {
  const title = (event?.title || '').toLowerCase();
  const type = (event?.type || '').toLowerCase();
  return event?.id === 2 || type === 'induction' || title.includes('induction');
}

function shouldShowUpcomingEvent(event) {
  const showRN26 = !!window.SITE_CONFIG?.SHOW_RN26;
  const showInductions = window.SITE_CONFIG?.SHOW_INDUCTIONS !== false;

  if (!showRN26 && isRn26Event(event)) return false;
  if (!showInductions && isInductionsEvent(event)) return false;
  return true;
}

function getVisibleUpcomingEvents() {
  return upcomingEvents.filter(shouldShowUpcomingEvent);
}

function getEventDisplayDate(event) {
  if (event?.dateRange) return event.dateRange;

  const hasValidDate = Boolean(event?.date) && !Number.isNaN(new Date(event.date).getTime());
  return hasValidDate
    ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBA';
}

function initEvents() {
  fetch(`/src/js/events.json?v=84&t=${window.GLOBAL_CACHE_MASTER || Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    })
    .then(data => {
      upcomingEvents = data.upcomingEvents;
      pastEvents = data.pastEvents;
      renderCalendar();
      renderUpcomingEvents();
      renderPastEvents();
      setupEventListeners();
    })
    .catch(err => {
      console.error('Error loading events:', err);
      const containers = ['upcoming-events', 'past-events'];
      containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<p style="color:rgba(255,255,255,0.4); font-style:italic;">Failed to load events. Please try again later.</p>';
      });
    });
}

document.addEventListener('DOMContentLoaded', initEvents);

// Calendar
function generateCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  const allEvents = [
    ...getVisibleUpcomingEvents().map(e => ({ ...e, isPast: false })),
    ...pastEvents.map(e => ({ ...e, isPast: true }))
  ];

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', event: null });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const event = allEvents.find(e => e.date === dateStr);
    days.push({ day: i, event });
  }

  return days;
}

function renderCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthYear = document.getElementById('month-year');
  if (!calendarGrid || !monthYear) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  monthYear.textContent = `${months[currentMonth]} ${currentYear}`;

  const days = generateCalendarDays(currentYear, currentMonth);
  const today = new Date();

  calendarGrid.innerHTML = days.map(d => {
    const isToday = d.day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    return `
      <div class="calendar-day ${d.event ? (d.event.isPast ? 'has-past-event' : 'has-event') : ''} ${d.day === '' ? 'empty' : ''} ${isToday ? 'today' : ''}">
        <span class="day-number">${d.day}</span>
        ${d.event ? `<span class="event-dot ${d.event.isPast ? 'past' : ''}" title="${d.event.title}"></span>` : ''}
      </div>
    `;
  }).join('');
}

function setupEventListeners() {
  document.getElementById('prev-month')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });

  document.getElementById('next-month')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });
}

// ── Upcoming Events: horizontal list card ──
function renderUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;

  const events = getVisibleUpcomingEvents();

  if (events.length === 0) {
    container.innerHTML = `
      <div class="event-list-card">
        <p style="color:rgba(255,255,255,0.4); font-style:italic;">No upcoming events at the moment. Check back soon!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(event => {
    const formattedDate = getEventDisplayDate(event);
    const registerLink = event.registerLink || '/register';

    return `
      <div class="event-list-card">
        <div class="event-list-top">
          <span class="event-list-badge">${event.type}</span>
          ${event.registrationOpen ? `<a href="${registerLink}" class="event-list-register-btn">Register</a>` : ''}
        </div>
        <p class="event-list-title">${event.title}</p>
        <p class="event-list-desc">${event.description}</p>
        <div class="event-list-meta">
          <span class="event-list-meta-item"><i class="fas fa-calendar"></i> ${formattedDate}</span>
          <span class="event-list-meta-item"><i class="fas fa-clock"></i> ${event.time}</span>
          <span class="event-list-meta-item"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
        </div>
        ${!event.registrationOpen ? `<p class="event-list-coming-soon">Registration opening soon</p>` : ''}
      </div>
    `;
  }).join('');
}

// ── Past Events: 3-column grid card ──
function renderPastEvents() {
  const container = document.getElementById('past-events');
  if (!container) return;

  if (pastEvents.length === 0) {
    container.innerHTML = `<p style="color:rgba(255,255,255,0.4); font-style:italic; grid-column: 1/-1;">No past events yet.</p>`;
    return;
  }

  container.innerHTML = pastEvents.map(event => {
    const date = getEventDisplayDate(event);

    return `
      <div class="past-event-grid-card">
        ${date ? `<p class="past-event-grid-date">${date}</p>` : ''}
        <p class="past-event-grid-title">${event.title}</p>
        <p class="past-event-grid-desc">${event.description}</p>
      </div>
    `;
  }).join('');
}
