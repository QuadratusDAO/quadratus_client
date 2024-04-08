import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicRoutes() {
  return (
    <>
      <Navbar />

      <div className="flex flex-col ">
        <Outlet />
      </div>

      <Footer />
    </>
  );
}
