import { useState } from "react";
import { getArchiveByDate } from "../utils/storage";

function Archive() {
  const [date, setDate] = useState("");
  const [articles, setArticles] = useState([]);

  function handleSearch() {
    setArticles(getArchiveByDate(date));
  }

  return (
    <div className="news-page">
      <h1>Archive</h1>

      <input type="date" onChange={(e) => setDate(e.target.value)} />
      <button onClick={handleSearch}>Search</button>

      <div className="news-grid">
        {articles.map((news, i) => (
          <div key={i} className="news-card">
            {news.urlToImage && <img src={news.urlToImage} />}
            <h3>{news.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Archive;