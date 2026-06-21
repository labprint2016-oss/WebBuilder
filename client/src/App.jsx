import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Builder = lazy(() => import("./Builder/main"));
const PreviewRuntime = lazy(() => import("./Builder/preview"));
const Test = lazy(() => import("./test"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen w-full bg-slate-50" />}>
        <Routes>
          <Route path="/preview" element={<PreviewRuntime />} />
          <Route path="/test" element={<Test />} />
          <Route path="/*" element={<Builder />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App
