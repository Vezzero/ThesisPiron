import re
import hashlib

NCBI_BASE             = "http://purl.obolibrary.org/obo/"
NCIT_BASE             = "http://purl.obolibrary.org/obo/"
MESH_BASE             = "https://www.ncbi.nlm.nih.gov/mesh/"
UMLS_BASES            = "https://uts.nlm.nih.gov/uts/umls/concept/"

foodon_file = r"C:\Users\samue\OneDrive\Desktop\ThesisPiron\foodon_full_taxonomy.txt"
ncit_file = r"C:\Users\samue\OneDrive\Desktop\ThesisPiron\ncit_full_taxonomy.txt"
chebi_file = r"C:\Users\samue\OneDrive\Desktop\ThesisPiron\chebi_terms.txt"
omit_file = r"C:\Users\samue\OneDrive\Desktop\ThesisPiron\omit_full_taxonomy.txt"
HEREDITARY_BASE = "https://hereditary.dei.unipd.it/ontology/gutbrain/resource/"

def get_ncit_description(ncit_id: str, txt_file_path: str) -> str:

    lookup = ncit_id if ncit_id.upper().startswith("NCIT_") else f"NCIT_{ncit_id}"
    
    # Build a regex that captures the label before "(NCIT_xxx)" or "[NCIT_xxx]"
    pattern = re.compile(rf"^\s*(.*?)\s*[\(\[]{re.escape(lookup)}[\)\]]")

    with open(txt_file_path, "r", encoding="utf-8") as fh:
        for line in fh:
            match = pattern.match(line)
            if match:
                return match.group(1).strip()

    raise KeyError(f"NCIT ID '{ncit_id}' not found in '{txt_file_path}'.")

def get_foodon_description(fragment: str, txt_file_path: str) -> str:
    """
    Given either '03510048' or 'FOODON_03510048', returns exactly
    the text between the two em-dashes on the matching line of
    foodon_full_taxonomy.txt.
    """
    # 1) Normalize to exactly “FOODON_XXXXXXXX”
    m = re.search(r"(\d+)$", fragment)
    if not m:
        raise ValueError(f"Can't parse FOODON numeric ID from '{fragment}'")
    lookup = f"FOODON_{m.group(1).zfill(8)}"

    # 2) Build a regex matching “<anything> — <definition> — (FOODON_xxxx)”
    #    Uses the literal em-dash U+2014 (—) that your file uses.
    pattern = re.compile(
        rf"""
        ^.*?                 # skip up to the first em-dash
        —\s*                 # em-dash + optional space
        (?P<body>.*?)        # capture the definition text, non-greedy
        \s*—\s*              # next em-dash + optional space
        \(\s*{re.escape(lookup)}\s*\)  # (FOODON_XXXXXXXX)
        """,
        re.VERBOSE
    )

    with open(txt_file_path, "r", encoding="utf-8") as fh:
        for line in fh:
            match = pattern.match(line)
            if match:
                return match.group("body").strip()

    raise KeyError(f"FOODON ID '{lookup}' not found in '{txt_file_path}'.")

def get_chebi_description(chebi_id: str, txt_file_path: str) -> str:
    lookup = chebi_id if chebi_id.upper().startswith("CHEBI:") else f"CHEBI:{chebi_id}"
    
    # Build a regex that captures the label before "(NCIT_xxx)" or "[NCIT_xxx]"
    pattern = re.compile(rf"^\s*(.*?)\s*[\(\[]{re.escape(lookup)}[\)\]]")

    with open(txt_file_path, "r", encoding="utf-8") as fh:
        for line in fh:
            match = pattern.match(line)
            if match:
                return match.group(1).strip()

    raise KeyError(f"CHEBI ID '{chebi_id}' not found in '{txt_file_path}'.")

def get_omit_description(omit_id: str, txt_file_path: str) -> str:
    lookup = omit_id if omit_id.upper().startswith("OMIT_") else f"OMIT_{omit_id}"
    
    # Build a regex that captures the label before "(NCIT_xxx)" or "[NCIT_xxx]"
    pattern = re.compile(rf"^\s*(.*?)\s*[\(\[]{re.escape(lookup)}[\)\]]")

    with open(txt_file_path, "r", encoding="utf-8") as fh:
        for line in fh:
            match = pattern.match(line)
            if match:
                return match.group(1).strip()

    raise KeyError(f"OMIT ID '{omit_id}' not found in '{txt_file_path}'.")

def hash_term_sha256(term: str, max_length: int | None = None) -> str:
    """
    Returns the SHA-256 hash of the input term as a hex string.
    If max_length is set, returns at most that many characters
    (truncating the full digest).
    """
    # compute full 64-char hex digest
    full_digest = hashlib.sha256(term.encode('utf-8')).hexdigest()
    # if the caller wants a shorter string, just slice it
    if max_length is not None:
        return full_digest[:max_length]
    return full_digest


