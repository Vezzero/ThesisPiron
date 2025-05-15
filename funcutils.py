import re

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

def get_foodon_description(foodon_id: str, txt_file_path: str) -> str:

    lookup = foodon_id if foodon_id.upper().startswith("FOODON_") else f"FOODON_{foodon_id}"
    
    # Build a regex that captures the label before "(NCIT_xxx)" or "[NCIT_xxx]"
    pattern = re.compile(rf"^\s*(.*?)\s*[\(\[]{re.escape(lookup)}[\)\]]")

    with open(txt_file_path, "r", encoding="utf-8") as fh:
        for line in fh:
            match = pattern.match(line)
            if match:
                return match.group(1).strip()

    raise KeyError(f"FOODON ID '{foodon_id}' not found in '{txt_file_path}'.")

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

