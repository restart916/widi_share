import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import Main from './pages/Main';
import ItemList from './pages/ItemList';
import ItemDetail from './pages/ItemDetail';
import AdminItemList from './pages/AdminItemList';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/list",
    element: <ItemList />,
  },
  {
    path: "/detail/:id",
    element: <ItemDetail />,
  },
  {
    path: "/admin",
    element: <AdminItemList />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
