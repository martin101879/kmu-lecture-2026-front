import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MarkdownRenderer from "./components/MarkdownRenderer";
import { lectures } from "./content/lectures";
import "./App.css";

function findSectionById(id: string) {
  for (const lecture of lectures) {
    for (const section of lecture.sections) {
      if (section.id === id) return section;
    }
  }
  return null;
}

function App() {
  const [activeSectionId, setActiveSectionId] = useState(
    lectures[0].sections[0].id,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = findSectionById(activeSectionId);

  const handleSelect = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="layout">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="메뉴 토글"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}>
        <Sidebar activeSectionId={activeSectionId} onSelect={handleSelect} />
      </div>

      <main className="content">
        {activeSection ? (
          <MarkdownRenderer content={activeSection.content} />
        ) : (
          <p>섹션을 선택해주세요.</p>
        )}
      </main>
    </div>
  );
}

export default App;
