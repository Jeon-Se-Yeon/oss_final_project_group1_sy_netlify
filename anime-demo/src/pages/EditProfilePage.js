import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { USER_API_URL } from "../constants";
import { styles } from "../styles";

const EditProfilePage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState("verify");
    const [verifyInput, setVerifyInput] = useState("");
    
    const [form, setForm] = useState({
        userid: "",
        password: "",
        email: "",
        profileImage: ""
    });
    const [confirmPw, setConfirmPw] = useState("");

    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        } else {
            setForm({
                userid: user.userid,
                password: user.password,
                email: user.email || "",
                profileImage: user.profileImage || ""
            });
            setConfirmPw(user.password);
        }
    }, [user, navigate]);

    const handleVerify = (e) => {
        e.preventDefault();
        if (verifyInput === user.password) {
            setStep("edit");
        } else {
            alert("비밀번호가 일치하지 않습니다.");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (form.password !== confirmPw) return alert("비밀번호 확인이 일치하지 않습니다.");
        if (!form.email.includes("@")) return alert("올바른 이메일 형식이 아닙니다.");

        if (form.userid !== user.userid) {
            try {
                const res = await fetch(USER_API_URL);
                const users = await res.json();
                if (users.some(u => u.userid === form.userid)) return alert("이미 사용 중인 아이디입니다.");
            } catch (err) {
                console.error(err);
                return alert("오류 발생");
            }
        }

        const success = await updateUser(form);
        if (success) {
            alert("회원정보가 수정되었습니다.");
            navigate("/mypage");
        } else {
            alert("수정 실패");
        }
    };

    if (!user) return null;

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.authCard}>
                
                {step === "verify" ? (
                    <>
                        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>본인 확인</h2>
                        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
                            개인정보 보호를 위해 비밀번호를 입력해주세요.
                        </p>
                        <form onSubmit={handleVerify} style={styles.formCol}>
                            <input
                                type="password"
                                value={verifyInput}
                                onChange={(e) => setVerifyInput(e.target.value)}
                                placeholder="현재 비밀번호"
                                style={styles.input}
                            />
                            <button type="submit" style={styles.primaryButton}>확인</button>
                            <button type="button" onClick={() => navigate(-1)} style={{...styles.navButtonOutline, width: "100%"}}>취소</button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>회원정보 수정</h2>
                        <form onSubmit={handleUpdate} style={styles.formCol}>
                            
                            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                                <div style={{
                                    width: "100px", height: "100px", borderRadius: "50%", 
                                    backgroundColor: "#eee", margin: "0 auto 10px", overflow: "hidden",
                                    display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd"
                                }}>
                                    {form.profileImage ? (
                                        <img 
                                            src={form.profileImage} 
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
                                    value={form.profileImage}
                                    onChange={(e) => setForm({...form, profileImage: e.target.value})}
                                    placeholder="이미지 주소(URL) 입력"
                                    style={{ ...styles.input, fontSize: "12px" }}
                                />
                            </div>

                            <div>
                                <label style={{fontSize:"14px", fontWeight:"bold"}}>아이디</label>
                                <input
                                    value={form.userid}
                                    onChange={(e) => setForm({...form, userid: e.target.value})}
                                    style={{...styles.input, marginTop:"5px"}}
                                />
                            </div>
                            
                            <div>
                                <label style={{fontSize:"14px", fontWeight:"bold"}}>이메일</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                    style={{...styles.input, marginTop:"5px"}}
                                />
                            </div>

                            <div>
                                <label style={{fontSize:"14px", fontWeight:"bold"}}>비밀번호</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({...form, password: e.target.value})}
                                    style={{...styles.input, marginTop:"5px"}}
                                />
                            </div>

                            <div>
                                <label style={{fontSize:"14px", fontWeight:"bold"}}>비밀번호 확인</label>
                                <input
                                    type="password"
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    style={{...styles.input, marginTop:"5px"}}
                                />
                            </div>

                            <button type="submit" style={styles.primaryButton}>수정 완료</button>
                            <button type="button" onClick={() => setStep("verify")} style={{...styles.navButtonOutline, width: "100%"}}>뒤로 가기</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditProfilePage;