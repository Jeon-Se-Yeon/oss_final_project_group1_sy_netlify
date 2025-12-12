import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { USER_API_URL } from "../constants";

const AuthContext = createContext();

const LOGOUT_TIMER = 30 * 60 * 1000; 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("user");
    }, []);

    const updateUser = async (updatedData) => {
        if (!user) return false;

        try {
            const res = await fetch(`${USER_API_URL}/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...user, ...updatedData }),
            });
            
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Update User Error:", error);
            return false;
        }
    };

    const login = async (inputUserid, inputPassword) => {
        try {
            const response = await fetch(USER_API_URL);
            const users = await response.json();
            const foundUser = users.find(
                (u) => u.userid === inputUserid && u.password === inputPassword
            );
            if (foundUser) {
                if (!foundUser.favorite) foundUser.favorite = [];
                setUser(foundUser);
                localStorage.setItem("user", JSON.stringify(foundUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        }
    };

    const signup = async (inputUserid, inputPassword, inputEmail, inputProfileImage) => {
        try {
            const response = await fetch(USER_API_URL);
            const users = await response.json();
            if (users.some((u) => u.userid === inputUserid)) {
                alert("이미 존재하는 아이디입니다.");
                return false;
            }
            const postResponse = await fetch(USER_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userid: inputUserid,
                    password: inputPassword,
                    email: inputEmail,
                    profileImage: inputProfileImage || "",
                    favorite: [],
                }),
            });
            return postResponse.ok;
        } catch (error) {
            console.error("Signup Error:", error);
            return false;
        }
    };

    useEffect(() => {
        if (!user) return;

        let timer;

        const handleAutoLogout = () => {
            alert("장시간 활동이 없어 자동 로그아웃 되었습니다.");
            logout();
        };

        const resetTimer = () => {
            clearTimeout(timer);
            timer = setTimeout(handleAutoLogout, LOGOUT_TIMER);
        };

        const events = ["mousemove", "click", "keydown", "scroll"];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            clearTimeout(timer);
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user, logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);