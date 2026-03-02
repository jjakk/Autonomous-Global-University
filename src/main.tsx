import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import Layout from './components/Layout';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primeicons/primeicons.css';
import GetStartedPage from './pages/GetStartedPage.tsx';
import AppAuth from './classes/AppAuth.tsx';
import PlanOfStudyPage from './pages/PlanOfStudyPage.tsx';
import HitRateLimitPage from './pages/HitRateLimitPage.tsx';
import CoursePage from './pages/CoursePage.tsx';
import ReadingPage from './pages/ReadingPage.tsx';

function RootScreen() {
  const authenticated = AppAuth.isAuthenticated();
  return authenticated ? <Navigate to="/plan-of-study" /> : <Navigate to="/get-started" />;
}

function AuthenticatedOnlyRoutes () {
  const authenticated = AppAuth.isAuthenticated();
  if(!authenticated) {
    return <Navigate to="/get-started" />;
  }
  else {
    return <Outlet />;
  }
}

function UnauthenticatedOnlyRoutes () {
  const authenticated = AppAuth.isAuthenticated();
  return !authenticated ? <Outlet /> : <Navigate to="/plan-of-study" />;
}

let router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <RootScreen/>,
      },
      {
        element: <UnauthenticatedOnlyRoutes />,
        children: [
          {
            path: "/get-started",
            element: <GetStartedPage/>,
          },
        ]
      },
      {
        element: <AuthenticatedOnlyRoutes />,
        children: [
          {
            path: "/plan-of-study",
            element: <PlanOfStudyPage />,
          },
          {
            path: "/hit-rate-limit",
            element: <HitRateLimitPage />,
          },
          {
            path: "/course/:courseIndex",
            element: <CoursePage />
          },
          {
            path: "/course/:courseIndex/unit/:unitIndex/reading/:readingIndex",
            element: <ReadingPage />
          },
        ]
      }
    ],
  },
]);



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <PrimeReactProvider>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  </StrictMode>,
);