const STORAGE_KEY = 'navaja-real-bookings';

const Storage = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error al leer las reservas guardadas:', error);
      return [];
    }
  },

  saveAll(bookings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (error) {
      console.error('Error al guardar las reservas:', error);
    }
  },

  add(booking) {
    const bookings = Storage.getAll();
    bookings.push(booking);
    Storage.saveAll(bookings);
  }
};

function sortByTime(bookings) {
  return bookings.slice().sort((a, b) => a.time.localeCompare(b.time));
}

function getBookingsByDate(date) {
  return sortByTime(Storage.getAll().filter(booking => booking.date === date));
}

function isSlotAvailable(date, time) {
  return !Storage.getAll().some(booking => booking.date === date && booking.time === time);
}

function formatDateForDisplay(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function formatTimeForDisplay(timeString) {
  return timeString.slice(0, 5);
}
