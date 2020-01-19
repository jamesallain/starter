import { AsyncStorage } from 'react-native';

export const setItem = async (key, value, callback) => {
  return await AsyncStorage.setItem(key, value, callback);
};

export const getItem = async (key, callback) => {
  return await AsyncStorage.getItem(key, callback);
};

export const removeItem = async key => {
  return await AsyncStorage.removeItem(key);
};
