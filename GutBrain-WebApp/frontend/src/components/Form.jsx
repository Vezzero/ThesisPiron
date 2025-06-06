import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";


function Form({route, method}){
    const [query, setQuery] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    return <form onSubmit={handleSubmit} className="form-container">
        <h1>Query Form</h1>
        <input 
            className="form-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query"
    />
    </form>
}