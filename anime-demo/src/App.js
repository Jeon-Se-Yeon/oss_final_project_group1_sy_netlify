import React, { useState, useEffect } from 'react';

function App() {
  // 1. 상태 관리
  const [animeList, setAnimeList] = useState([]); // 검색 결과 리스트
  const [search, setSearch] = useState("");       // 검색어
  const [loading, setLoading] = useState(false);  // 로딩 상태

  // 2. Jikan API 데이터 가져오기 함수
  const fetchAnime = async (query) => {
    setLoading(true);
    try {
      let url;
      
      // 1. 검색어가 있으면 -> 검색 API 호출
      if (query && query.length > 0) {
        url = `https://api.jikan.moe/v4/anime?q=${query}&sfw=true&limit=12`;
      } 
      // 2. 검색어가 없으면 -> 인기 애니메이션(Top Anime) API 호출
      else {
        url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.data) {
        setAnimeList(data.data);
      } else {
        setAnimeList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. 폼 제출 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnime(search);
  };

  // (선택 사항) 초기 화면에 인기 애니메이션 등을 보여주려면 useEffect 사용
  useEffect(() => {
    fetchAnime(); // 예: 처음에 나루토 검색 결과 보여주기
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        {/* 제목을 상황에 따라 다르게 표시 */}
        <h1>{search ? `🔍 '${search}' 검색 결과` : "🏆 인기 애니메이션 TOP 12"}</h1>
      </header>
      
      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="text"
            placeholder="애니메이션 제목 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "로딩 중..." : "검색"}
          </button>
        </form>
      </div>

      <div style={styles.grid}>
        {animeList.map((anime) => (
          <div key={anime.mal_id} style={styles.card}>
             {/* 기존 코드와 동일한 카드 내용 */}
            <a 
              href={anime.url} 
              target="_blank" 
              rel="noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={styles.imageContainer}>
                <img 
                  src={anime.images.jpg.image_url} 
                  alt={anime.title} 
                  style={styles.image}
                />
              </div>
              <div style={styles.content}>
                <h3 style={styles.title}>{anime.title}</h3>
                <p style={styles.info}>
                  ⭐ {anime.score || "N/A"}
                </p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. 간단한 스타일 객체 (CSS 파일 대신 사용)
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
  },
  searchBox: {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '500px',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#535bf2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  imageContainer: {
    height: '280px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    padding: '12px',
  },
  title: {
    fontSize: '16px',
    margin: '0 0 8px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  info: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  }
};

export default App;