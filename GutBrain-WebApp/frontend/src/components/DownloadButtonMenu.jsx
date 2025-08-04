import { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaDownload, FaFileCode, FaFileAlt } from 'react-icons/fa';
import '../components/DownloadButton.css'

function DownloadButtonMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const openDownloadMenu = () => {
    setMenuOpen(open => !open);
  };

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="position-relative d-inline-block" ref={menuRef}>
      <Button variant="transparent" onClick={openDownloadMenu}>
        <FaDownload />
      </Button>

      {menuOpen && (
        <ul className="download-menu list-unstyled shadow">
          <li>
            <Button className="dropdown-item" onClick={() => {/* download JSON */}}>
              <FaFileCode className="me-2" />
              Download JSON
            </Button>
          </li>
          <li>
            <Button className="dropdown-item" onClick={() => {/* download RDF */}}>
              <FaFileAlt className="me-2" />
              Download RDF
            </Button>
          </li>
          <li>
          </li>
        </ul>
      )}
    </div>
  );
}

export default DownloadButtonMenu;
