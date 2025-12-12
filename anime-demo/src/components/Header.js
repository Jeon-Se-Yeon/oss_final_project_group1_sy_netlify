import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { styles } from "../styles";

const Header = ({ onReset }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const LOGO_SRC = "/AnimeFinder_logo.jpg";

    return (
        <header style={styles.header}>
            <div style={styles.headerContent}>
                <Link
                    to="/"
                    onClick={(e) => {
                        if (onReset) {
                            e.preventDefault();
                            onReset();
                        }
                    }}
                    style={{ 
                        textDecoration: "none", 
                        color: "#333",
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px" 
                    }}
                >
                    <img 
                        src={LOGO_SRC} 
                        alt="Anime Finder Logo" 
                        style={{ height: "40px", objectFit: "contain" }} 
                    />
                    <h1 style={{ margin: 0 }}>Anime Finder</h1>
                </Link>

                <div style={styles.authSection}>
                    {user ? (
                        <>
                            <Link 
                                to="/mypage" 
                                style={{ 
                                    textDecoration: "none", 
                                    color: "#333", 
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    padding: "8px 10px"
                                }}
                            >
                                👤 MyPage
                            </Link>
                            <span>
                                <strong>{user.userid}</strong>님
                            </span>
                            <button onClick={logout} style={styles.logoutButton}>
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/login")}
                                style={styles.navButton}
                            >
                                로그인
                            </button>
                            <button
                                onClick={() => navigate("/signup")}
                                style={styles.navButtonOutline}
                            >
                                회원가입
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;