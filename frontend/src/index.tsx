import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from '@/components/theme-provider';
import LandingPage from '@page/landing/Landing';
import ExampleRoutes from '@page/app/examples/example';
import AppRoutes from '@page/app/app';
import reportWebVitals from '@/reportWebVitals';

import '@style/index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/*' element={<AppRoutes />} />
          <Route path='/eg/*' element={<ExampleRoutes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
