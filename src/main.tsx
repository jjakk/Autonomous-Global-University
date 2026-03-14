import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Layout from './components/Layout';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primeicons/primeicons.css';
import GetStartedPage from './pages/GetStartedPage/GetStartedPage.tsx';
import AppAuth from './classes/AppAuth.tsx';
import PlanOfStudyPage from './pages/PlanOfStudyPage.tsx';
import HitRateLimitPage from './pages/HitRateLimitPage.tsx';
import CoursePage from './pages/CoursePage.tsx';
import ReadingPage from './pages/ReadingPage.tsx';

function RootScreen() {
  return AppAuth.isAuthenticated() ? <Navigate to="/plan-of-study" /> : <Navigate to="/get-started" />;
}

function AuthenticatedOnlyRoutes () {
  return AppAuth.isAuthenticated() ? <Outlet /> : <Navigate to="/get-started" />
}

function UnauthenticatedOnlyRoutes () {
  return AppAuth.isAuthenticated() ? <Navigate to="/plan-of-study" /> : <Outlet /> ;
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
            path: "/course/:courseId",
            element: <CoursePage />
          },
          {
            path: "/course/:courseId/reading/:readingId",
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