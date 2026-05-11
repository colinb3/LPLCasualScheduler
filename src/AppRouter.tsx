/** AppRouter.tsx
 * Colin Brown
 **/

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shifts from "./pages/Shifts";
import Home from "./pages/Home";
import { getDatabase } from "./db/sqlite";

export default function AppRouter() {
  React.useEffect(() => {
    void getDatabase();
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shifts" element={<Shifts />} />
      </Routes>
    </BrowserRouter>
  );
}
