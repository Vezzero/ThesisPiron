import { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaDownload, FaFileCode, FaFileAlt } from 'react-icons/fa';
import '../components/DownloadButton.css'
import { downloadJsonIndividual } from '../utils/downloadUtils';

function DownloadButtonMenu({individual, relationsList, mentions}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  const openDownloadMenu = () => {
    setMenuOpen(open => !open);
  };

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleDownloadJson = async () => {
    await downloadJsonIndividual(individual, relationsList, mentions);
    setMenuOpen(false);
  };

  const handleDownloadRdf = () => {
    setMenuOpen(false);
  };

  return (
    <div className="position-relative d-inline-block" ref={wrapperRef}>
      <Button variant="transparent" onClick={openDownloadMenu}>
        <FaDownload />
      </Button>

      {menuOpen && (
        <ul className="download-menu list-unstyled shadow">
          <li>
            <Button className="dropdown-item" onClick={handleDownloadJson}>
              <FaFileCode className="me-2" />
              Download JSON
            </Button>
          </li>
          <li>
            <Button className="dropdown-item" onClick={handleDownloadRdf}>
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
