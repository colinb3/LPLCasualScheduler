/** AppRouter.tsx
 * Colin Brown
 **/

import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Shifts from "./pages/Shifts";

export default function AppRouter() {
  const Router = BrowserRouter;
  const routerProps = { basename: import.meta.env.BASE_URL };
  const branches = [
    "Beacock",
    "Bostwick",
    "Byron",
    "Carson",
    "Cherryhill",
    "Childrens",
    "CIF",
    "Cherryhill",
    "East London",
    "Glanworth",
    "Jalna",
    "Lambeth",
    "Landon",
    "Lending",
    "Masonville",
    "Pond Mills",
    "Sherwood",
    "Stoney Creek",
  ];
  return (
    <Router {...routerProps}>
      <Routes>
        <Route path="/" element={<Shifts branches={branches} />} />
      </Routes>
    </Router>
  );
}
