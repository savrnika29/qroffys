import authReducer from "../feature/auth/authSlice";
import subscriptionReducer from "../feature/subscriptionSlice";
import profileReducer from "../feature/profileSlice";
import locationReducer from "../feature/locationSlice"
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import savedCardsReducer from "../feature/savedCardSlice"
import postReducer from "../feature/homePage/postSlice"
import ageRangeReducer from "../feature/homePage/ageRangeSlice"; // ✅ correct path
import newQastReducer from "../feature/addpostSlice";
import aboutReducer from "../feature/aboutSlice";
import helpReducer from "../feature/helpSlice";
import savedCardsvedioReducer from "../feature/savedCardSlice"
import saveReducer from "../feature/homePage/saveSlice";
import TermsConditionsReducer from "../feature/termConditionSlice";
import reportReducer from "../feature/homePage/reportSlice";
import profilePostsReducer from "../feature/mypostSlice";
import homepostsSlice from '../feature/homePage/homePostslice'
// import TermsConditionsReducer from "../feature/termConditionSlice";
import postShareReducer from "../feature/homePage/postShareSlice";
import discountOffersReducer from "../feature/discountofferSlice"
import commentReducer from '../feature/commentSlice';
import discountReducer from "../feature/homePage/discountSlice";
import socialLinksReducer from "../feature/socialLinksSlice"
import businessReducer from "../feature/businessSlice";
import mybusinesspostReducer from "../feature/mybusinesspostSlice";
import followerReducer from "../feature/followersSlice";
import chatSliceReducer from "../feature/chatSlice";
import notificationReducer from "../feature/notificationSlice";
import videosReducer from '../feature/videoSlice'; // New videos slice
import storiesReducer from "../feature/storiesSlice";
import faceAuthReducer from "../feature/faceAuth/faceAuthSlice"
import savedPostandStoriesReducer from "../feature/savedPostandStoriesSlice"
import paymentHistoryReducer from "../feature/paymentHistorySlice";
import usersReducer from "../feature/usersSlice";
import sendbusinessReducer from "../feature/sendbusinessSlice"
import businessOnboardReducer from "../feature/businessOnboardSlice";
import paymentRequestsReducer from "../feature/paymentrequsetSlice"
import accountSliceReducer from "../feature/deactivateSlice"
const persistConfig = {
  key: "root",
  storage,
  blacklist: [],
};

export const appReducer = combineReducers({
  auth: authReducer,
  subscription: subscriptionReducer,
  profile: profileReducer,
  location: locationReducer,
  savedCards: savedCardsReducer,
  post: postReducer,
  ageRange: ageRangeReducer, // ✅ THIS is crucial
  newQast: newQastReducer,
  about: aboutReducer,
  help: helpReducer,
  savedCardsvedio: savedCardsvedioReducer,
  savePost: saveReducer,
  report: reportReducer,
  profilePosts: profilePostsReducer,
  homepost: homepostsSlice,
  terms: TermsConditionsReducer,
  postShare: postShareReducer,
  discountOffers: discountOffersReducer,
  comments: commentReducer,
  socialLinks: socialLinksReducer,
  discounts: discountReducer,
  business: businessReducer,
  mybusinessposts: mybusinesspostReducer, // Updated to mybusinessposts
  followers: followerReducer, // Ensure the key matches what you use in useSelector
  chat: chatSliceReducer,
  notification: notificationReducer,
  videos: videosReducer,
  stories: storiesReducer,
  faceAuth: faceAuthReducer,
  savedPostandStories: savedPostandStoriesReducer,
  paymentHistory: paymentHistoryReducer,
  users: usersReducer,
  sendbusiness: sendbusinessReducer,
  businessOnboard: businessOnboardReducer,
  paymentRequests: paymentRequestsReducer,
  account: accountSliceReducer
});

// Reset everything onClick Logout
const rootReducer = (state, action) => {
  if (action.type === "auth/clearAuthState") {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);
