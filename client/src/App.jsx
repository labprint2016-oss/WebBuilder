import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const Builder = lazy(() => import("./Builder/main"));
const PreviewRuntime = lazy(() => import("./Builder/preview"));
const WebsiteRuntime = lazy(() => import("./WebsiteRuntime"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen w-full bg-slate-50" />}>
        <Routes>
          <Route path="/" element={<WebsiteRuntime />} />
          <Route path="/preview" element={<PreviewRuntime />} />
          <Route path="/builder/*" element={<Builder />} />
          <Route path="/menus" element={<Navigate to="/builder/menus" replace />} />
          <Route path="/heros" element={<Navigate to="/builder/heros" replace />} />
          <Route path="/forms" element={<Navigate to="/builder/forms" replace />} />
          <Route path="/messages" element={<Navigate to="/builder/messages" replace />} />
          <Route path="/settings" element={<Navigate to="/builder/settings" replace />} />
          <Route path="/:pageSlug" element={<WebsiteRuntime />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App
