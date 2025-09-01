import React from "react"; // ✅ Add this
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

function MainLayout() {
  return (
    <div className="font-sourceSans flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 min-h-screen mt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
