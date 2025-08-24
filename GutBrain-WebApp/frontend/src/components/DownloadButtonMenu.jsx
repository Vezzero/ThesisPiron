import { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaDownload, FaFileCode, FaFileAlt } from 'react-icons/fa';
import '../styles/DownloadButton.css'
import { downloadJsonIndividual, downloadRdfIndividual } from '../utils/downloadUtils';

function DownloadButtonMenu({individual, relationsList, mentions}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  const lastJsonTime = useRef(0);
  const lastRdfTime  = useRef(0);
  const THROTTLE_MS  = 30_000;

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
    const now = Date.now();
    if (now - lastJsonTime.current < THROTTLE_MS) {
      const wait = Math.ceil((THROTTLE_MS - (now - lastJsonTime.current)) / 1000);
      alert(`Please wait ${wait}s before downloading JSON again.`);
      return;
    }
    await downloadJsonIndividual(individual, relationsList, mentions);
    lastJsonTime.current = Date.now();
    setMenuOpen(false);
  };

  const handleDownloadRdf = async () => {
    const now = Date.now();
    if (now - lastRdfTime.current < THROTTLE_MS) {
      const wait = Math.ceil((THROTTLE_MS - (now - lastRdfTime.current)) / 1000);
      alert(`Please wait ${wait}s before downloading TTL again.`);
      return;
    }
    await downloadRdfIndividual(individual, relationsList, mentions);
    lastRdfTime.current = Date.now();
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
              Download TTL
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default DownloadButtonMenu;
