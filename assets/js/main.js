(function () {
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');
  const serviceSelect = document.getElementById('service');
  const form = document.getElementById('booking-form');
  const message = document.getElementById('form-message');
  const bookingsList = document.getElementById('bookings-list');
  const currentYear = document.getElementById('current-year');

  const TIME_SLOTS = generateTimeSlots();

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
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }

    const initialDate = getInitialDate();
    dateInput.min = initialDate;
    dateInput.value = initialDate;
    populateTimeOptions(initialDate);
    updateBookingsList(initialDate);

    dateInput.addEventListener('change', handleDateChange);
    form.addEventListener('submit', handleSubmit);
  }

  function handleDateChange(event) {
    const dateValue = event.target.value;
    resetMessage();
    populateTimeOptions(dateValue);
    updateBookingsList(dateValue);
  }

  function handleSubmit(event) {
    event.preventDefault();
    resetMessage();

    const dateValue = dateInput.value;
    const timeValue = timeSelect.value;
    const serviceValue = serviceSelect.value;
    const nameValue = document.getElementById('name').value.trim();
    const phoneValue = document.getElementById('phone').value.trim();
    const emailValue = document.getElementById('email').value.trim();

    if (!dateValue || !timeValue || !serviceValue || !nameValue || !phoneValue || !emailValue) {
      return showError('Por favor, completá todos los campos obligatorios.');
    }

    if (!isWeekday(dateValue)) {
      return showError('Solo se pueden reservar turnos de lunes a viernes.');
    }

    if (!isSlotAvailable(dateValue, timeValue)) {
      return showError('Ese horario ya fue reservado. Elegí otro horario disponible.');
    }

    const booking = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: dateValue,
      time: timeValue,
      service: serviceValue,
      name: nameValue,
      phone: phoneValue,
      email: emailValue,
      createdAt: new Date().toISOString()
    };

    Storage.add(booking);
    showSuccess('¡Reserva confirmada! Te contactaremos para confirmar los detalles.');
    form.reset();
    dateInput.value = booking.date;
    populateTimeOptions(booking.date);
    updateBookingsList(booking.date);
  }

  function populateTimeOptions(dateValue) {
    timeSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.textContent = 'Seleccioná un horario';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = '';
    timeSelect.appendChild(placeholder);

    if (!dateValue) {
      return;
    }

    if (!isWeekday(dateValue)) {
      showError('Seleccioná una fecha de lunes a viernes.');
      return;
    }

    TIME_SLOTS.forEach(slot => {
      if (isSlotAvailable(dateValue, slot)) {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSelect.appendChild(option);
      }
    });

    if (timeSelect.options.length === 1) {
      showError('No quedan horarios disponibles para este día. Elegí otra fecha.');
    }
  }

  function updateBookingsList(dateValue) {
    bookingsList.innerHTML = '';

    if (!dateValue || !isWeekday(dateValue)) {
      bookingsList.appendChild(createEmptyState('Seleccioná una fecha hábil para ver los turnos reservados.'));
      return;
    }

    const bookings = getBookingsByDate(dateValue);

    if (!bookings.length) {
      bookingsList.appendChild(createEmptyState('Aún no hay turnos reservados para este día.'));
      return;
    }

    bookings.forEach(booking => {
      bookingsList.appendChild(createBookingItem(booking));
    });
  }

  function createBookingItem(booking) {
    const wrapper = document.createElement('article');
    wrapper.className = 'booking-item';

    const time = document.createElement('div');
    time.className = 'booking-item__time';
    time.textContent = formatTimeForDisplay(booking.time);

    const detail = document.createElement('p');
    detail.className = 'booking-item__detail';
    detail.textContent = `${booking.name} - ${booking.service}`;

    wrapper.append(time, detail);
    return wrapper;
  }

  function createEmptyState(message) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.textContent = message;
    return div;
  }

  function generateTimeSlots() {
    const slots = [];
    for (let hour = 10; hour <= 18; hour++) {
      ['00', '30'].forEach(minutes => {
        const time = `${String(hour).padStart(2, '0')}:${minutes}`;
        if (time >= '13:00' && time < '14:00') {
          return;
        }
        if (hour === 18 && minutes === '30') {
          slots.push(time);
        } else if (hour < 19) {
          slots.push(time);
        }
      });
    }
    return slots;
  }

  function isWeekday(value) {
    const date = typeof value === 'string'
      ? new Date(`${value}T00:00:00`)
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  function showError(text) {
    message.textContent = text;
    message.classList.remove('form-message--success');
    message.classList.add('form-message--error');
  }

  function showSuccess(text) {
    message.textContent = text;
    message.classList.remove('form-message--error');
    message.classList.add('form-message--success');
  }

  function resetMessage() {
    message.textContent = '';
    message.classList.remove('form-message--error', 'form-message--success');
  }

  init();
})();
