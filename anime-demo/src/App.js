import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Detail from "./pages/Detail";
import MyPage from "./pages/MyPage";
import EditProfilePage from "./pages/EditProfilePage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/detail/:id" element={<Detail />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/edit-profile" element={<EditProfilePage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;