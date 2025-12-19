// Redux Store
import { createStore } from 'redux';
import rootReducer from './reducers/index';

// Load initial state from localStorage if available (client-side only)
const loadInitialState = () => {
  // Always return empty state for SSR to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return undefined; // Let reducers use their default initial state
  }
  
  // On client-side, load user from localStorage synchronously
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      // Handle Google profile picture
      if (userData.picture && !userData.profilePicture) {
        userData.profilePicture = userData.picture;
      }
      return {
        user: {
          user: userData,
          isAuthenticated: true
        }
      };
    }
  } catch (e) {
    console.error('Error loading initial state from localStorage:', e);
  }
  
  return undefined; // Let reducers use their default initial state
};

const store = createStore(
  rootReducer,
  loadInitialState(),
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined
);

// Subscribe to store changes to sync with localStorage
if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    if (state.user && state.user.user) {
      localStorage.setItem('user', JSON.stringify(state.user.user));
    } else {
      localStorage.removeItem('user');
    }
  });
}

export default store;

