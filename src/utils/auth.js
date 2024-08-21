import jsCookie from "js-cookie";

const Token = 'zlm-video-admin';

export const setToken = (token) => jsCookie.set(Token, token);

export const getToken = () => jsCookie.get(Token);

export const removeToken = () => jsCookie.remove(Token);
