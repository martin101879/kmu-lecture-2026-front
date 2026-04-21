import { lectures } from "../content/lectures";

interface SidebarProps {
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
}

export default function Sidebar({ activeSectionId, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">KMU Capstone</h1>
        <p className="sidebar-subtitle">캡스톤 디자인 개발 실습</p>
      </div>
      <nav className="sidebar-nav">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="nav-group">
            <div className="nav-group-title">
              <span className="nav-icon">{lecture.icon}</span>
              {lecture.title}
            </div>
            <ul className="nav-items">
              {lecture.sections.map((section) => (
                <li key={section.id}>
                  <button
                    className={`nav-item ${activeSectionId === section.id ? "active" : ""}`}
                    onClick={() => onSelect(section.id)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
