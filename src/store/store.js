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
      localStorage.setItem('user', JSON.stringify(state.user.user));
    } else {
      localStorage.removeItem('user');
    }
  });
}

export default store;

