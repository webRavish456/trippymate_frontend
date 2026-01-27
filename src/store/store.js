// Redux Store
import { createStore } from 'redux';
import rootReducer from './reducers/index';


const loadInitialState = () => {

  if (typeof window === 'undefined') {
    return undefined; 
  }
  

  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Normalize profilePicture - ensure it's set from picture if available
      if (userData && userData.picture && !userData.profilePicture) {
        userData.profilePicture = userData.picture;
      }
      // Ensure profilePicture is not empty string
      if (userData && userData.profilePicture === '') {
        userData.profilePicture = null;
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
  
  return undefined; 
};

const store = createStore(
  rootReducer,
  loadInitialState(),
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined
);


if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    if (state.user && state.user.user) {
      const userData = { ...state.user.user };
      // Normalize profilePicture before saving
      if (userData.picture && !userData.profilePicture) {
        userData.profilePicture = userData.picture;
      }
      // Don't save empty string as profilePicture
      if (userData.profilePicture === '') {
        userData.profilePicture = null;
      }
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  });
}

export default store;

