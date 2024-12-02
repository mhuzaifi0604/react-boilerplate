
import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from "./routes";
import ProtectedRoute from "./authentication/ProtectedRoute";
import PulseLoader from 'react-spinners/PulseLoader'

const App = () => {
  return (
    <Router>
      <Suspense fallback={<PulseLoader color="black" size={40}/>}>
        <Switch>
          {routes.map(({ path, component: Component, isProtected }, index) =>
            isProtected ? (
              <ProtectedRoute key={index} path={path} component={Component} />
            ) : (
              <Route key={index} path={path} component={Component} />
            )
          )}
        </Switch>
      </Suspense>
    </Router>
  );
};

export default App;
