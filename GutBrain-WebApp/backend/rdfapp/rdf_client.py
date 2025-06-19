from django.conf import settings
from SPARQLWrapper import SPARQLWrapper, JSON, POST, BASIC
import logging

logger = logging.getLogger(__name__)

def get_sparql_client(query_only=True):
    """
    Returns a SPARQLWrapper pointed at either the query endpoint or
    the statements (UPDATE) endpoint, based on `query_only`.
    """
    if query_only:
        url = settings.GRAPHDB["ENDPOINT_URL"]
    else:
        url = settings.GRAPHDB.get(
            "STATEMENTS_URL",
            settings.GRAPHDB["ENDPOINT_URL"]
        )
    sparql = SPARQLWrapper(url)
    
    username = settings.GRAPHDB.get("USERNAME", "")
    password = settings.GRAPHDB.get("PASSWORD", "")
    if username and password:
        sparql.setHTTPAuth(BASIC)
        sparql.setCredentials(username, password)

    return sparql

def run_sparql_query(query_text):
    """
    Executes a SPARQL SELECT/CONSTRUCT/ASK query against GraphDB.
    Returns a Python dict (parsed JSON).
    """
    sparql = get_sparql_client(query_only=True)
    sparql.setMethod(POST)         # use POST to avoid URL‐length limits
    sparql.setQuery(query_text)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
    except Exception as e:
        logger.exception("SPARQL query failed: %s", e)
        raise
    return results

def run_sparql_update(update_text):
    """
    Executes a SPARQL UPDATE (INSERT/DELETE) against GraphDB.
    """
    sparql = get_sparql_client(query_only=False)
    sparql.setMethod(POST)
    sparql.setQuery(update_text)
    try:
        sparql.query()
    except Exception as e:
        logger.exception("SPARQL update failed: %s", e)
        raise
    return
