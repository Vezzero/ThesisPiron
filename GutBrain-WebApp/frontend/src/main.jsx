import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css";

import $ from "jquery";
// wire jQuery to window so DataTables can find it:
window.$ = window.jQuery = $;

// now import the DataTables scripts
import "datatables.net-bs5";
import "datatables.net-responsive-bs5";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
