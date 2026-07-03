import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";
import Landing from "./pages/Landing";
import CreatePool from "./pages/CreatePool";
import JoinPool from "./pages/JoinPool";
import PoolLobby from "./pages/PoolLobby";
import Transparency from "./pages/Transparency";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-grain">
          <TopNav />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/create" element={<CreatePool />} />
              <Route path="/join" element={<JoinPool />} />
              <Route path="/join/:code" element={<JoinPool />} />
              <Route path="/pool/:code" element={<PoolLobby />} />
              <Route path="/transparency" element={<Transparency />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
