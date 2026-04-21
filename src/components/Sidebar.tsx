import { useParams } from "react-router";
import { lectures } from "../content/lectures";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  onSelect: (sectionId: string) => void;
}

export default function Sidebar({ onSelect }: SidebarProps) {
  const { sectionId: activeSectionId } = useParams();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>KMU Capstone</h1>
        <p className={styles.subtitle}>캡스톤 디자인 개발 실습</p>
      </div>
      <nav className={styles.nav}>
        {lectures.map((lecture) => (
          <div key={lecture.id} className={styles.group}>
            <div className={styles.groupTitle}>
              <span className={styles.icon}>{lecture.icon}</span>
              {lecture.title}
            </div>
            <ul className={styles.items}>
              {lecture.sections.map((section) => (
                <li key={section.id}>
                  <button
                    className={`${styles.item} ${activeSectionId === section.id ? styles.active : ""}`}
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
