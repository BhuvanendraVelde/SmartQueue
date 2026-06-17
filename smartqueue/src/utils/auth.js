export function isAdminLoggedIn() {
  try {
    return (
      localStorage.getItem('isAdminLoggedIn') === 'true' ||
      localStorage.getItem('smartqueue_isAdmin') === 'true'
    );
  } catch (e) {
    return false;
  }
}

export function loginAdmin() {
  try {
    localStorage.setItem('smartqueue_isAdmin', 'true');
    localStorage.setItem('isAdminLoggedIn', 'true');
  } catch (e) {}
}

export function logoutAdmin() {
  try {
    localStorage.removeItem('smartqueue_isAdmin');
    localStorage.removeItem('isAdminLoggedIn');
  } catch (e) {}
}
