import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_normalizeFormMethod: true,
  },
};

export const navigationConfig = {
  basename: '/',
  future: routerConfig.future,
}; 