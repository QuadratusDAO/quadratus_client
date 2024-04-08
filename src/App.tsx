import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public Routes
import PublicRoutes from "./layouts/PublicRoutes";
import Home from "./pages/Home";
import DAOS from "./pages/DAOS";
import DAO from "./pages/DAO";
import Proposal from "./pages/Proposal";
import AddProposal from "./pages/AddProposal";
import CreateDAO from "./pages/CreateDAO";

import { Buffer } from "buffer";
(window as any).global = window;
global.Buffer = global.Buffer || Buffer;
(window as any).process = {
  version: "",
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/daos" element={<DAOS />} />
            <Route path="/dao/:id" element={<DAO />} />
            <Route path="/proposal/:id" element={<Proposal />} />
            <Route path="/add-proposal/:dao" element={<AddProposal />} />
            <Route path="/create-dao" element={<CreateDAO />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
