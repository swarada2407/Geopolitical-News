import { useState } from "react";
import HeroNews from "../components/HeroNews"
import TrendingNews from "../components/TrendingNews"

function Home(){
  const [searchTerm, setSearchTerm] = useState("");

  return(
    <div className="news-homepage">
      <div className="homepage-heading">
        <p className="homepage-kicker">Welcome to GeoIntelX</p>
        <h1 className="homepage-title">Geopolitical Intelligence Hub</h1>
        <p className="homepage-desc">
          Your source for the latest world news, military insights, and strategic analysis.
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="homepage-section">
        <div className="homepage-section-head">
          <h2>Featured Stories</h2>
        </div>
        <HeroNews searchTerm={searchTerm} />
      </div>

      <div className="homepage-section">
        <div className="homepage-section-head">
          <h2>Trending Now</h2>
        </div>
        <TrendingNews searchTerm={searchTerm} />
      </div>
    </div>
  )
}

export default Home