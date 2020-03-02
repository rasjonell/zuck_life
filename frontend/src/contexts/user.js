import { useCookies } from 'react-cookie';
import normalize from 'json-api-normalizer';
import React, { useReducer, createContext, useCallback } from 'react';

import ZuckAxios from 'config/axios';
import { useEffect } from 'react';

const defaultState = {
  users: {},
  user: null,
  isLoading: true,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'setState':
      return { ...payload, isLoading: false };
    case 'loading':
      return { ...state, isLoading: payload };
    case 'logout':
      return { ...defaultState, isLoading: false };
    case 'setUser':
      return { ...payload, isLoading: false };
    case 'updateUsers':
      return { ...state, users: { ...state.users, ...payload.users } };
    default:
      throw new Error(`unknown action type: ${type}`);
  }
};

export const UserContext = createContext(defaultState);

const UserContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [cookie, , removeCookie] = useCookies(['sid']);

  const fetchUser = async () => {
    dispatch({ type: 'loading', payload: true });

    try {
      const { data } = await ZuckAxios.get('/user/');

      dispatch({
        type: 'setState',
        payload: {
          user: data.data,
          ...normalize(data),
        },
      });
    } catch (error) {
      // do smth
    }

    dispatch({ type: 'loading', payload: false });
  };

  useEffect(() => {
    if (cookie.sid) fetchUser();
  }, [cookie.sid]);

  const logIn = async ({ username, password }) => {
    const loginResult = await ZuckAxios.post('/auth/login', {
      username,
      password,
    });

    console.log(loginResult);

    fetchUser();
  };

  const logOut = async () => {
    ZuckAxios.post('/auth/logout');
    removeCookie('sid');
    dispatch({ type: 'logout' });
  };

  const findUser = useCallback(
    async username => {
      const { data } = await ZuckAxios.get(`/user/${username}`);
      const normalized = normalize(data);

      dispatch({ type: 'updateUsers', payload: normalized });

      return data;
    },
    [dispatch],
  );

  // const whoami = async () => {
  //   const result = await ZuckAxios.get('/auth/whoami');
  //   console.log(result.data);
  // };

  return (
    <UserContext.Provider value={{ state, logIn, logOut, findUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;