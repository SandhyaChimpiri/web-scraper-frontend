import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState({ links: [], contents: [], images: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [activeSection, setActiveSection] = useState("");

  const handleScrape = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScreenshot(null);

    if (!url.trim() || !/^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/.test(url)) {
      setError("Please enter a valid URL.");
      setLoading(false);
      return;
    }
    
    try {
      // const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5173";
      const apiUrl = "http://localhost:5173/"
      const response = await axios.post(`${apiUrl}/scrape`, { url });
      if (response.data && response.data.data) {
        const { links, contents, images } = response.data.data;
        setResult({
          links: links || [],
          contents: contents || [],
          images: images || [],
        });
        setScreenshot(`${apiUrl}${response.data.screenshot}`);
      } else {
        setResult({ links: [], contents: [] });
        setError("Invalid response format from the server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to scrape the page. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? "" : section)); 
  };

  return (
    <div className="main-page">
      <div className="main-form">
        <h1>Web Scraper</h1>
        <br/>
        <form onSubmit={handleScrape} className="form">
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL"
          />
          <button type="submit"> {loading ? "Scraping..." : "Scrape"} </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      {!loading && result.links.length > 0 && (
      <div className="sections">
        <div className="section-header" onClick={() => toggleSection("links")}>
          <h2>Scraped Links</h2>
        </div>
        <div className="section-header" onClick={() => toggleSection("contents")}>
          <h2>Scraped Content</h2>
        </div>
        <div className="section-header" onClick={() => toggleSection("images")}>
          <h2>Scraped Images</h2>
        </div>
        {screenshot && (
          <div className="section-header" onClick={() => toggleSection("screenshot")} >
            <h2>Screenshot</h2>
          </div>
        )}
      </div>
)}
      {activeSection && (
        <div className="overlay">
          {activeSection === "links" && (
            <div className="center-content">
              <ul>
                {result.links.map((item, index) => (
                  <li key={index}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer"> {item.text} </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeSection === "contents" && (
            <div className="center-content">
              <ul>
                {result.contents.map((content, index) => (
                  <li key={index}>{content}</li>
                ))}
              </ul>
            </div>
          )}
          {activeSection === "images" && (
            <div className="center-content">
              <ul className="image-list">
              {result.images.map((image, index) => (
                <li>
                <img key={index} src={image.src} alt={image.alt || "Image"} style={{ width: "200px", marginBottom: "0.5rem" }} />
                </li>
              ))}
              </ul>
            </div>
          )}
          {activeSection === "screenshot" && (
            <div className="center-content">
              <img src={screenshot} alt="Screenshot" style={{ width: "300px", border: "1px solid #ccc" }} />
            </div>
          )}
          <button onClick={() => setActiveSection("")} className="close-button"> Close </button>
        </div>
      )}
    </div>
  );
}

export default App;
