// User Reducer
import { SET_USER, CLEAR_USER, UPDATE_USER } from '../actions/userActions';

const initialState = {
  user: null,
  isAuthenticated: false
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      // Handle Google profile picture
      const userData = action.payload;
      if (userData && userData.picture && !userData.profilePicture) {
        userData.profilePicture = userData.picture;
      }
      return {
        ...state,
        user: userData,
        isAuthenticated: !!userData
      };
    
    case UPDATE_USER:
      const updatedUser = { ...state.user, ...action.payload };
      // Handle Google profile picture
      if (updatedUser.picture && !updatedUser.profilePicture) {
        updatedUser.profilePicture = updatedUser.picture;
      }
      return {
        ...state,
        user: updatedUser
      };
    
    case CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    
    default:
      return state;
  }
};

export default userReducer;

