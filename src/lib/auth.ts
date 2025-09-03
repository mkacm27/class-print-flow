import bcrypt from 'bcryptjs';

const USER_STORAGE_KEY = 'app_user';
const SESSION_STORAGE_KEY = 'dashboard_access';

/**
 * Initializes a default user in localStorage if one doesn't exist.
 * This is for demonstration purposes. In a real application, this would be
 * handled by a user registration system and a proper database.
 */
export const initializeDefaultUser = () => {
  if (!localStorage.getItem(USER_STORAGE_KEY)) {
    const salt = bcrypt.genSaltSync(10);
    // Default password is "password"
    const hashedPassword = bcrypt.hashSync('password', salt);
    const defaultUser = {
      username: 'admin',
      password: hashedPassword,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
  }
};

/**
 * Attempts to log in a user by comparing provided credentials against stored ones.
 * @param username The username to check.
 * @param password The plain-text password to check.
 * @returns `true` if login is successful, `false` otherwise.
 */
export const login = (username, password): boolean => {
  const storedUserJSON = localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUserJSON) {
    console.error("No user found in storage. Please initialize a user.");
    return false;
  }

  const storedUser = JSON.parse(storedUserJSON);

  if (username === storedUser.username && bcrypt.compareSync(password, storedUser.password)) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    return true;
  }

  return false;
};

/**
 * Checks if the user is currently authenticated.
 * @returns `true` if the user has an active session, `false` otherwise.
 */
export const isAuthenticated = (): boolean => {
  return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
};

/**
 * Logs the user out by clearing their session data.
 */
export const logout = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};
