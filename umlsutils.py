import os
import requests
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from pathlib import Path
from collections import defaultdict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

UMLS_API_KEY = os.getenv("UMLS_API_KEY")
if not UMLS_API_KEY:
    raise RuntimeError("UMLS_API_KEY not set in environment")
UMLS_BASE    = "https://uts-ws.nlm.nih.gov/rest"
UMLS_VERSION = "current"

def search_umls(term, version=UMLS_VERSION, api_key=UMLS_API_KEY):
    """
    Query UMLS /search endpoint, return up to 10 (cui, name) tuples.
    """
    url = f"{UMLS_BASE}/search/{version}"
    params = {
        "string": term,
        "apiKey": api_key,
        "pageNumber": 1,
        "pageSize": 10,
        "searchType": "exact"
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    hits = data.get("result", {}).get("results", [])
    return [(hit["ui"], hit["name"]) for hit in hits]

def best_umls_match(term, umls_hits):
    """
    Given a list of (cui, name), compute TFIDF cosine vs. `term`
    and return the (cui, name, score, definition) for the best match.
    """
    if not umls_hits:
        return None, None, 0.0, None
    
    # compute similarity scores
    texts = [term] + [name for _, name in umls_hits]
    vec = TfidfVectorizer(stop_words="english")
    X = vec.fit_transform(texts)
    term_vec = X[0]
    candidate_vecs = X[1:]
    scores = cosine_similarity(term_vec, candidate_vecs).ravel()
    best_idx = scores.argmax()
    
    cui, name = umls_hits[best_idx]
    score = scores[best_idx]
    definition = get_umls_definition(cui)
    
    return cui, name, score, definition

def get_umls_definition(cui,
                        version=UMLS_VERSION,
                        api_key=UMLS_API_KEY):
    """
    Retrieve the first English definition for a UMLS CUI, preferring MSH then NCI.
    Returns the definition string, or None if no definitions exist.
    """
    url = f"{UMLS_BASE}/content/{version}/CUI/{cui}/definitions"
    params = {"apiKey": api_key}
    try:
        resp = requests.get(url, params=params)
        resp.raise_for_status()
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 404:
            return None
        raise

    data = resp.json()
    defs = data.get("result", [])
    if not defs:
        return None

    # preferred ordering
    for src in ("MSH", "NCI"):
        for d in defs:
            if d.get("rootSource") == src:
                return d.get("value")

    # if neither MSH nor NCI, just take the very first one
    return defs[0].get("value")