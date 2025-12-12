// src/components/ReviewSection.js

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // 로그인 페이지 이동을 위한 Link 추가
import { useAuth } from "../context/AuthContext";
import { REVIEW_API_URL, USER_API_URL } from "../constants";
import { styles } from "../styles";

// [헬퍼 컴포넌트] 프로필 이미지 에러 처리
// 이미지가 없거나 로딩 실패 시 기본 아이콘(👤)을 보여줍니다.
const ProfileAvatar = ({ src }) => {
    const [error, setError] = useState(false);

    if (!src || error) {
        return <span style={{ fontSize: "16px" }}>👤</span>;
    }

    return (
        <img
            src={src}
            alt="profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setError(true)}
        />
    );
};

const ReviewSection = ({ animeId }) => {
    const { user } = useAuth();
    
    const [reviews, setReviews] = useState([]);
    const [userImages, setUserImages] = useState({}); // 유저 ID: 프로필이미지 매핑
    const [loading, setLoading] = useState(true);
    
    // 리뷰 작성 폼 상태
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [rating, setRating] = useState(10);

    // 전체 유저 정보를 가져와서 { userid: profileImage } 형태의 맵(Map) 생성
    const fetchUserImages = async () => {
        try {
            const res = await fetch(USER_API_URL);
            const users = await res.json();
            const imageMap = {};
            users.forEach(u => {
                imageMap[u.userid] = u.profileImage;
            });
            setUserImages(imageMap);
        } catch (err) {
            console.error("유저 이미지 로드 실패:", err);
        }
    };

    // 해당 애니메이션의 리뷰 목록 가져오기
    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(REVIEW_API_URL);
            const data = await res.json();
            const filtered = data.filter(
                (r) => String(r.animeId) === String(animeId)
            );
            setReviews(filtered.sort((a, b) => b.time - a.time)); // 최신순 정렬
        } catch (err) {
            console.error("리뷰 로드 오류:", err);
        } finally {
            setLoading(false);
        }
    }, [animeId]);

    useEffect(() => {
        fetchReviews();
        fetchUserImages();
    }, [fetchReviews]);

    // 리뷰 등록 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !contents) return alert("제목과 내용을 입력해주세요.");
        
        // 이미 리뷰를 썼는지 확인
        if (reviews.some(r => r.userid === user.userid)) {
            return alert("이미 이 애니메이션에 대한 리뷰를 작성하셨습니다.");
        }

        const newReview = {
            title,
            contents,
            rating: Number(rating),
            userid: user.userid,
            time: Math.floor(Date.now() / 1000),
            animeId: animeId,
        };
        try {
            const res = await fetch(REVIEW_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newReview),
            });
            if (res.ok) {
                alert("리뷰 등록 완료!");
                setTitle("");
                setContents("");
                setRating(10);
                fetchReviews(); // 목록 갱신
            } else alert("등록 실패");
        } catch (err) {
            console.error("리뷰 등록 오류:", err);
        }
    };

    // 리뷰 삭제 핸들러
    const handleDelete = async (reviewId) => {
        if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${REVIEW_API_URL}/${reviewId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("리뷰가 삭제되었습니다.");
                setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            } else alert("삭제 실패");
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    const formatDate = (timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString("ko-KR");

    return (
        <div style={styles.reviewContainer}>
            <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "20px" }}>
                💬 유저 리뷰 ({reviews.length})
            </h2>
            
            {user ? (
                // 로그인 상태: 리뷰 작성 폼 표시
                <form onSubmit={handleSubmit} style={styles.reviewForm}>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                        <input
                            style={{ ...styles.input, flex: 2 }}
                            placeholder="리뷰 제목"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <select
                            style={styles.select}
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        >
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                                <option key={num} value={num}>
                                    ⭐ {num}점
                                </option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        style={styles.textarea}
                        rows="3"
                        placeholder="감상평을 남겨주세요..."
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                    />
                    <button type="submit" style={styles.reviewButton}>
                        리뷰 등록
                    </button>
                </form>
            ) : (
                // 비로그인 상태: 로그인 안내 메시지 (링크 포함)
                <div style={styles.loginMessage}>
                    리뷰를 작성하려면{" "}
                    <Link 
                        to="/login" 
                        style={{ 
                            fontWeight: "bold", 
                            color: "#6366f1", 
                            textDecoration: "underline",
                            cursor: "pointer"
                        }}
                    >
                        로그인
                    </Link>
                    이 필요합니다.
                </div>
            )}

            {/* 리뷰 목록 표시 */}
            <div style={styles.reviewList}>
                {loading ? (
                    <div>로딩 중...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ color: "#888", textAlign: "center" }}>
                        첫 리뷰를 남겨주세요!
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} style={styles.reviewItem}>
                            <div style={styles.reviewHeader}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    
                                    {/* 프로필 이미지 (ProfileAvatar 사용) */}
                                    <div style={{
                                        width: "32px", height: "32px", borderRadius: "50%", 
                                        backgroundColor: "#eee", overflow: "hidden", 
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        border: "1px solid #ddd"
                                    }}>
                                        <ProfileAvatar src={userImages[review.userid]} />
                                    </div>

                                    <div>
                                        <span style={{ fontSize: "14px", color: "#555", display: "block", lineHeight: "1" }}>
                                            {review.userid}
                                        </span>
                                        <span style={styles.reviewTitle}>{review.title}</span>
                                    </div>
                                    <span style={styles.reviewRating}>⭐ {review.rating}</span>
                                </div>
                                
                                {/* 본인 글 삭제 버튼 */}
                                {user && user.userid === review.userid && (
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        style={styles.deleteButton}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                            <p style={styles.reviewContent}>{review.contents}</p>
                            <div style={styles.reviewFooter}>
                                <span></span>
                                <span>{formatDate(review.time)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;