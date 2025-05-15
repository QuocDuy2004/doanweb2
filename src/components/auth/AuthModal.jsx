import { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import VerifyOTP from "./VerifyOTP";
import ForgotPassword from "./ForgotPassword";

const AuthModal = ({ onClose }) => {
  const [modalType, setModalType] = useState("login");
  const [verifyData, setVerifyData] = useState({});

  const handleSetModalType = (type, data = {}) => {
    setModalType(type);
    setVerifyData(data);
  };

  return (
    <div className="modal">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {modalType === "login" && <Login setModalType={handleSetModalType} onClose={onClose} />}
          {modalType === "register" && <Register setModalType={handleSetModalType} onClose={onClose} />}
          {modalType === "forgot" && <ForgotPassword setModalType={handleSetModalType} onClose={onClose} />}
          {modalType === "verify" && (
            <VerifyOTP
              setModalType={handleSetModalType}
              onClose={onClose}
              email={verifyData.email}
              fullName={verifyData.fullName}
              type={verifyData.type}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;