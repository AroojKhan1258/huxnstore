import { Outlet } from "react-router-dom";
import Navigation from "./pages/Auth/Navigation";
import ChatbotWidget from "./components/Chatbot/ChatbotWidget";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        toastStyle={{
          background: "#0e0812",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          color: "#fff",
          fontSize: "13px",
        }}
      />
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <ChatbotWidget />
    </>
  );
};

export default App;
