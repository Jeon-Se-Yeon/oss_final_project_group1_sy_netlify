import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { styles } from "../styles";

const SignupPage = () => {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPw) return alert("비밀번호 불일치");
        if (!email.includes("@")) return alert("올바른 이메일 형식이 아닙니다.");

        if (await signup(userid, password, email, profileImage)) {
            alert("가입 성공");
            navigate("/login");
        } else alert("가입 실패");
    };

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.authCard}>
                <h2 style={{ textAlign: "center" }}>회원가입</h2>
                <form onSubmit={handleSignup} style={styles.formCol}>
                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                        <div style={{
                            width: "100px", height: "100px", borderRadius: "50%", 
                            backgroundColor: "#eee", margin: "0 auto 10px", overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd"
                        }}>
                            {profileImage ? (
                                <img 
                                    src={profileImage} 
                                    alt="preview" 
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                    onError={(e) => {e.target.style.display='none'}}
                                />
                            ) : (
                                <span style={{ fontSize: "30px", color: "#ccc" }}>👤</span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={profileImage}
                            onChange={(e) => setProfileImage(e.target.value)}
                            placeholder="프로필 이미지 URL (예: https://...)"
                            style={{ ...styles.input, fontSize: "12px" }}
                        />
                        <p style={{fontSize: "11px", color: "#888", marginTop: "5px"}}>
                            * 이미지 주소를 입력하면 미리보기가 표시됩니다.
                        </p>
                    </div>

                    <input value={userid} onChange={(e) => setUserid(e.target.value)} placeholder="아이디" style={styles.input} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" style={styles.input} required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" style={styles.input} />
                    <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="비밀번호 확인" style={styles.input} />
                    
                    <button type="submit" style={styles.secondaryButton}>가입하기</button>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;