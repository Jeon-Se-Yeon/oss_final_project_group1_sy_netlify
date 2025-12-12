import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { REVIEW_API_URL } from "../constants";
import { styles } from "../styles";

const MyPage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [isEditingImg, setIsEditingImg] = useState(false);
    const [tempImgUrl, setTempImgUrl] = useState("");

    const [myReviews, setMyReviews] = useState([]);
    const [favoriteAnimes, setFavoriteAnimes] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [loadingFavorites, setLoadingFavorites] = useState(true);

    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        } else {
            setTempImgUrl(user.profileImage || "");
        }
    }, [user, navigate]);

    const handleSaveImage = async () => {
        const success = await updateUser({ profileImage: tempImgUrl });
        if (success) {
            alert("프로필 사진이 변경되었습니다.");
            setIsEditingImg(false);
        } else {
            alert("변경 실패");
        }
    };

    const fetchMyReviews = useCallback(async () => {
        if (!user) return;
        setLoadingReviews(true);
        try {
            const res = await fetch(REVIEW_API_URL);
            const data = await res.json();
            const filteredReviews = data
                .filter((r) => r.userid === user.userid)
                .sort((a, b) => b.time - a.time);

            const reviewsWithAnimeData = await Promise.all(
                filteredReviews.map(async (review) => {
                    try {
                        const animeRes = await fetch(`https://api.jikan.moe/v4/anime/${review.animeId}`);
                        const animeData = await animeRes.json();
                        return {
                            ...review,
                            animeTitle: animeData.data?.title || "알 수 없는 애니메이션",
                        };
                    } catch (e) {
                        return { ...review, animeTitle: "정보 로드 실패" };
                    }
                })
            );
            setMyReviews(reviewsWithAnimeData);
        } catch (error) {
            console.error("마이 리뷰 로드 오류:", error);
        } finally {
            setLoadingReviews(false);
        }
    }, [user]);

    const fetchFavorites = useCallback(async () => {
        if (!user || !user.favorite || user.favorite.length === 0) {
            setFavoriteAnimes([]);
            setLoadingFavorites(false);
            return;
        }
        setLoadingFavorites(true);
        try {
            const promises = user.favorite.map(id => 
                fetch(`https://api.jikan.moe/v4/anime/${id}`).then(res => res.json())
            );
            const responses = await Promise.all(promises);
            const animes = responses.map(res => res.data).filter(Boolean);
            setFavoriteAnimes(animes);
        } catch (error) {
            console.error("찜 목록 로드 오류:", error);
        } finally {
            setLoadingFavorites(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyReviews();
        fetchFavorites();
    }, [fetchMyReviews, fetchFavorites]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${REVIEW_API_URL}/${reviewId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("리뷰가 삭제되었습니다.");
                setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
            } else alert("삭제 실패");
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };
    
    const handleRemoveFavorite = async (animeId) => {
        if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return;
        const newFavs = user.favorite.filter(id => id !== String(animeId));
        const success = await updateUser({ favorite: newFavs });
        if (success) {
            setFavoriteAnimes(prev => prev.filter(a => String(a.mal_id) !== String(animeId)));
        } else {
            alert("찜 삭제 실패");
        }
    };

    const formatDate = (timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString("ko-KR");

    if (!user) return null; 
    
    return (
        <div style={styles.container}>
            <Header />
            
            <div style={styles.myPageSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>👤 마이페이지</h2>
                    <button 
                        onClick={() => navigate("/edit-profile")} 
                        style={styles.navButtonOutline}
                    >
                        ⚙️ 전체 정보 수정
                    </button>
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "15px" }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: "100px", height: "100px", borderRadius: "50%", 
                            overflow: "hidden", border: "2px solid #ddd", backgroundColor: "#f0f0f0",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            {(isEditingImg ? tempImgUrl : user.profileImage) ? (
                                <img 
                                    src={isEditingImg ? tempImgUrl : user.profileImage} 
                                    alt="profile" 
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                    onError={(e) => {e.target.style.display='none'}}
                                />
                            ) : (
                                <span style={{ fontSize: "40px" }}>👤</span>
                            )}
                        </div>
                        
                        {isEditingImg ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '200px' }}>
                                <input 
                                    type="text" 
                                    value={tempImgUrl} 
                                    onChange={(e) => setTempImgUrl(e.target.value)}
                                    placeholder="이미지 주소(URL) 입력"
                                    style={{...styles.input, padding: '5px', fontSize: '12px'}}
                                />
                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                    <button onClick={handleSaveImage} style={{...styles.primaryButton, padding: '5px 10px', fontSize: '12px'}}>저장</button>
                                    <button onClick={() => {setIsEditingImg(false); setTempImgUrl(user.profileImage||"");}} style={{...styles.navButtonOutline, padding: '5px 10px', fontSize: '12px'}}>취소</button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsEditingImg(true)} 
                                style={{ fontSize: "12px", background: "none", border: "none", color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}
                            >
                                사진 변경 (URL)
                            </button>
                        )}
                    </div>
                    
                    <div style={{ marginTop: "10px", lineHeight: "1.8" }}>
                        <p style={{ fontSize: "1.4rem", margin: "5px 0" }}>
                            <strong>{user.userid}</strong>님
                        </p>
                        <p style={{ color: "#666", margin: 0 }}>
                            {user.email || "이메일 없음"}
                        </p>
                    </div>
                </div>

                <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <button onClick={logout} style={styles.logoutButton}>
                        로그아웃
                    </button>
                </div>
            </div>

            <div style={{ ...styles.reviewContainer, marginBottom: "30px" }}>
                <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "20px" }}>
                    ❤️ 찜한 애니메이션 ({favoriteAnimes.length})
                </h3>
                {loadingFavorites ? (
                     <div style={styles.centerText}>목록 불러오는 중...</div>
                ) : favoriteAnimes.length === 0 ? (
                    <div style={{ color: "#888", textAlign: "center" }}>찜한 애니메이션이 없습니다.</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "15px" }}>
                        {favoriteAnimes.map(anime => (
                            <div key={anime.mal_id} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                                <Link to={`/detail/${anime.mal_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <img 
                                        src={anime.images.jpg.image_url} 
                                        alt={anime.title} 
                                        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px" }}
                                    />
                                    <h4 style={{ fontSize: "14px", margin: "10px 0", height: "40px", overflow: "hidden" }}>{anime.title}</h4>
                                </Link>
                                <button 
                                    onClick={() => handleRemoveFavorite(anime.mal_id)}
                                    style={{ ...styles.deleteButton, width: "100%" }}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={styles.reviewContainer}>
                <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "20px" }}>
                    📝 내가 작성한 리뷰 ({myReviews.length})
                </h3>
                {loadingReviews ? (
                    <div style={styles.centerText}>리뷰 목록 로딩 중...</div>
                ) : myReviews.length === 0 ? (
                    <div style={{ color: "#888", textAlign: "center" }}>
                        작성한 리뷰가 없습니다.
                    </div>
                ) : (
                    <div style={styles.reviewList}>
                        {myReviews.map((review) => (
                            <div key={review.id} style={styles.myReviewItem}>
                                <div style={styles.myReviewHeader}>
                                    <Link 
                                        to={`/detail/${review.animeId}`} 
                                        style={styles.reviewTitleLink}
                                    >
                                        {review.animeTitle} - {review.title}
                                    </Link>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={styles.reviewRating}>⭐ {review.rating}</span>
                                        <button
                                            onClick={() => handleDeleteReview(review.id)}
                                            style={styles.deleteButton}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                                <p style={styles.myReviewBody}>{review.contents}</p>
                                <div style={styles.myReviewFooter}>
                                    작성일: {formatDate(review.time)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPage;