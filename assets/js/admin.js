(function () {
  const dateInput = document.getElementById('admin-date');
  const bookingsContainer = document.getElementById('admin-bookings');
  const summary = document.getElementById('admin-summary');
  const todayButton = document.getElementById('today-button');

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getInitialDate() {
    const today = new Date();
    const candidate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    while (!isWeekday(candidate)) {
      candidate.setDate(candidate.getDate() + 1);
    }
    return toISODate(candidate);
  }

  function init() {
    const initialDate = getInitialDate();
    dateInput.value = initialDate;
    dateInput.min = initialDate;
    renderBookings(initialDate);

    dateInput.addEventListener('change', event => {
      renderBookings(event.target.value);
    });

    todayButton.addEventListener('click', () => {
      const today = getInitialDate();
      dateInput.value = today;
      renderBookings(today);
    });
  }

  function renderBookings(dateValue) {
    bookingsContainer.innerHTML = '';

    if (!dateValue) {
      summary.textContent = '';
      bookingsContainer.appendChild(createEmptyState('Seleccioná una fecha para consultar la agenda.'));
      return;
    }

    if (!isWeekday(dateValue)) {
      summary.textContent = '';
      bookingsContainer.appendChild(createEmptyState('La barbería atiende solo de lunes a viernes.')); 
      return;
    }

    const bookings = getBookingsByDate(dateValue);

    if (!bookings.length) {
      summary.textContent = `No hay turnos reservados para ${formatDateForDisplay(dateValue)}.`;
      bookingsContainer.appendChild(createEmptyState('Sin reservas para este día.'));
      return;
    }

    summary.textContent = `${bookings.length} turno${bookings.length === 1 ? '' : 's'} para ${formatDateForDisplay(dateValue)}.`;

    bookings.forEach(booking => {
      bookingsContainer.appendChild(createBookingCard(booking));
    });
  }

  function createBookingCard(booking) {
    const article = document.createElement('article');
    article.className = 'booking-item';

    const time = document.createElement('div');
    time.className = 'booking-item__time';
    time.textContent = formatTimeForDisplay(booking.time);

    const detail = document.createElement('p');
    detail.className = 'booking-item__detail';
    detail.textContent = `${booking.service} - ${booking.name}`;

    const contact = document.createElement('p');
    contact.className = 'booking-item__contact';
    contact.innerHTML = `<strong>Tel:</strong> ${booking.phone} · <strong>Email:</strong> ${booking.email}`;

    article.append(time, detail, contact);
    return article;
  }

  function createEmptyState(text) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.textContent = text;
    return div;
  }

  function isWeekday(value) {
    const date = typeof value === 'string'
      ? new Date(`${value}T00:00:00`)
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  init();
})();
