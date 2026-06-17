function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getNextToken() {
  try {
    const keyDate = localStorage.getItem('smartqueue_token_date');
    const keyCounter = localStorage.getItem('smartqueue_token_counter');
    const today = todayKey();

    let next = 1;
    if (keyDate === today && keyCounter) {
      next = parseInt(keyCounter, 10) + 1;
    }

    localStorage.setItem('smartqueue_token_date', today);
    localStorage.setItem('smartqueue_token_counter', String(next));
    return next;
  } catch (e) {
    // fallback if localStorage unavailable
    return 1;
  }
}

export function resetToken() {
  localStorage.removeItem('smartqueue_token_counter');
  localStorage.removeItem('smartqueue_token_date');
}

export default { getNextToken, resetToken };
