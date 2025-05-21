/* eslint-disable no-unused-vars */
// src/utils/localStorage.js

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem(key) {
  const item = localStorage.getItem(key);
  try {
    return JSON.parse(item);
  } catch (error) {
    return item;
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}
