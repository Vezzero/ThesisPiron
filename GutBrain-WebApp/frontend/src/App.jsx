import react from "react"
import { BrowserRouter, Routes, Route, Navigation } from "react-router-dom"
import Home from "./pages/Home"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./pages/NotFound"



function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element = {
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
        />
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
