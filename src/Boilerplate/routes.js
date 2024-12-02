import React from "react";

const routes = [
  {
    path: "/",
    component: React.lazy(() => import("./components/LandingPage")), // Corrected path
    componentPath: "./components/LandingPage.jsx", // Corrected componentPath
    isProtected: false,
  },
  {
    path: "/login",
    component: React.lazy(() => import("./authentication/Login")), // Corrected path
    componentPath: "./authentication/Login.jsx", // Corrected componentPath
    isProtected: false,
  },
  {
    path: "/signup",
    component: React.lazy(() => import("./authentication/Signup")), // Corrected path
    componentPath: "./authentication/Signup.jsx", // Corrected componentPath
    isProtected: false,
  },
  {
    path: "/home",
    component: React.lazy(() => import("./components/Home")), // Corrected path
    componentPath: "./components/Home.jsx", // Corrected componentPath
    isProtected: true,
  },
  {
    path: "*", // Fallback route for non-existent paths
    component: React.lazy(() => import("./components/NotFound")), // Corrected path
    componentPath: "./components/NotFound.jsx", // Corrected componentPath
    isProtected: false,
  },
];

export default routes;
