import { useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router";
import Sidebar from "./components/Sidebar";
import MarkdownRenderer from "./components/MarkdownRenderer";
import { lectures } from "./content/lectures";
import styles from "./App.module.css";

function findSectionById(id: string) {
  for (const lecture of lectures) {
    for (const section of lecture.sections) {
      if (section.id === id) return section;
    }
  }
  return null;
}

function findLectureIdBySectionId(sectionId: string) {
  for (const lecture of lectures) {
    for (const section of lecture.sections) {
      if (section.id === sectionId) return lecture.id;
    }
  }
  return null;
}

const defaultLectureId = lectures[0].id;
const defaultSectionId = lectures[0].sections[0].id;

function LecturePage() {
  const { sectionId } = useParams();
  const activeSection = sectionId ? findSectionById(sectionId) : null;

  if (!activeSection) {
    return <Navigate to={`/${defaultLectureId}/${defaultSectionId}`} replace />;
  }

  return <MarkdownRenderer content={activeSection.content} />;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (sectionId: string) => {
    const lectureId = findLectureIdBySectionId(sectionId);
    if (lectureId) {
      navigate(`/${lectureId}/${sectionId}`);
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={styles.layout}>
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setSidebarOpen(true)}
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropOpen : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={sidebarOpen ? styles.open : styles.sidebarOverlay}>
        <button
          className={styles.closeBtn}
          onClick={() => setSidebarOpen(false)}
          aria-label="메뉴 닫기"
        >
          ✕
        </button>
        <Sidebar onSelect={handleSelect} />
      </div>

      <main className={styles.content}>
        <Routes>
          <Route path="/:lectureId/:sectionId" element={<LecturePage />} />
          <Route
            path="*"
            element={
              <Navigate to={`/${defaultLectureId}/${defaultSectionId}`} replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
