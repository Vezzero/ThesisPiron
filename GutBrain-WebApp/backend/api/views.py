import re
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rdfapp.rdf_client import run_sparql_query

@require_http_methods(["GET"])
def list_term_mentions(request):
    term = request.GET.get("term", "").strip()
    safe_term = term.replace('"', '\\"')

    filter_clause = (
    f'FILTER(LCASE(STR(?indname)) = LCASE("{safe_term}"))'
    if safe_term else ""
    )
    sparql = f"""

PREFIX xsd:      <http://www.w3.org/2001/XMLSchema#>
PREFIX gutbrain: <https://w3id.org/hereditary/ontology/gutbrain/resource/>
PREFIX gutprop:  <https://w3id.org/hereditary/ontology/gutbrain/schema/>
PREFIX rdfs:     <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT
  ?paperid
  ?title
  (GROUP_CONCAT(DISTINCT ?author; separator=", ") AS ?authors)
  ?journal
  ?pubYear
  ?indname
  ?comment
  ?annotator
  ?senttext
  ?sent
  ?abstracttext
  ?titletext
  ?mentiontext
  ?p
  ?collection
  ?classLabel
  ?class
  ?ind

WHERE {{

  ?x a gutprop:PaperCollection ;
        rdfs:label ?collection;
        gutprop:contains ?p .

  ?p a gutprop:Paper ;
     gutprop:paperId       ?paperid ;
     gutprop:hasTitle      ?title ;
     gutprop:paperAuthor      ?author;
     gutprop:paperJournal     ?journal;
     gutprop:paperAnnotator ?annotator;
     gutprop:paperYear  ?pubYear ;    
     gutprop:hasAbstract     ?abstract .

    ?abstract a gutprop:PaperAbstract ;
              gutprop:hasAbstractText ?abstracttext .

    ?title a gutprop:PaperTitle;
             gutprop:hasTitleText ?titletext.
  # Mentions
  ?mention a gutprop:Mention ;
           gutprop:hasMentionText  ?mentiontext ;
           gutprop:locatedIn       ?sent .
        
  # Sentence
  ?sent a gutprop:Sentence ;
        gutprop:hasSentenceText ?senttext;
        gutprop:partOf         ?abstract .

  # Individual and its comment
  ?ind gutprop:containedIn   ?mention ;
       rdfs:label            ?indname ;
       rdf:type             ?class.
	OPTIONAL {{ ?ind rdfs:comment ?comment . }}
    ?class rdfs:label ?classLabel
  

  {filter_clause}
}}
"""

    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    raw = []
    for b in results["results"]["bindings"]:
        comment = b.get("comment", {}).get("value", "")
        m_def = re.search(r"^(.*?\[Definition Source:[^\]]+\])", comment)
        if m_def:
            definition = m_def.group(1).strip()
            ontology_match = ""
        else:
            definition = ""
            m_match = re.search(r"^(.+?)\s+Match\s*$", comment)
            if m_match:
                ontology_match = m_match.group(1).strip()
            else:
                definition = comment
                ontology_match = ""

        raw.append({
            "paperid":       b["paperid"]["value"],
            "title":         b.get("title", {}).get("value", ""),
            "author":        b.get("author", {}).get("value", ""),
            "journal":       b.get("journal", {}).get("value", ""),
            "pubYear":       b.get("pubYear", {}).get("value", ""),
            "indname":       b["indname"]["value"],
            "definition":    definition,
            "ontologyMatch": ontology_match,
            "annotator":     b.get("annotator", {}).get("value", ""),
            "senttext":      b["senttext"]["value"],
            "sent":      b["sent"]["value"],
            "abstracttext":      b["abstracttext"]["value"],
            "titletext":      b["titletext"]["value"],
            "definition":    definition,
            "ontologyMatch": ontology_match,
            "mentiontext":  b["mentiontext"]["value"],
            "paper":        b["p"]["value"],
            "collection":  b.get("collection", {}).get("value", ""),
            "classLabel":  b.get("classLabel", {}).get("value", ""),
            "classIri":       b["class"]["value"],
            "ind":         b["ind"]["value"],
        })

    merged = {}
    for m in raw:
        key = (m["paperid"], m["senttext"])
        if key not in merged:
            merged[key] = m.copy()
        else:
            entry = merged[key]
            if m["definition"] and not entry["definition"]:
                entry["definition"] = m["definition"]
            if m["ontologyMatch"] and not entry["ontologyMatch"]:
                entry["ontologyMatch"] = m["ontologyMatch"]

    return JsonResponse({"mentions": list(merged.values())})

@require_http_methods(["GET"])
def list_property_term(request):
    term = request.GET.get("term", "").strip()
    if not term:
        return JsonResponse({"error": "Missing `term` parameter"}, status=400)

    sparql = f"""
PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>

SELECT 
  ?prop
  (COUNT(DISTINCT ?obj)    AS ?count)
  (SAMPLE(?propLabel)      AS ?label)
WHERE {{

  ?seed
     rdfs:label        ?lbl .
  FILTER( REGEX(STR(?lbl), "^{term}$", "i") )

  ?seed ?prop ?obj .
  FILTER(isIRI(?obj))
  FILTER( STRSTARTS(STR(?prop),
        "https://w3id.org/hereditary/ontology/gutbrain/schema/") )
  FILTER(?prop != gutprop:containedIn)

  OPTIONAL {{ ?prop rdfs:label ?propLabel }}
}}
GROUP BY ?prop
ORDER BY DESC(?count)

"""

    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])
    termx_list = []
    for b in bindings:
        termx_list.append({
            "prop":  b["prop"]["value"],
            "label": b.get("label", {}).get("value", b["prop"]["value"].split("/").pop()),
            "count": int(b["count"]["value"])
        })
    return JsonResponse({"relations": termx_list})

@require_http_methods(["GET"])
def list_property_objects(request):
    term = request.GET.get("term", "").strip()
    prop  = request.GET.get("prop",  "").strip()
    if not term or not prop:
        return JsonResponse(
            {"error": "Missing required `term` or `prop` parameter"},
            status=400
        )

    # clean up the inputs
    safe_term = term.replace('"', '\\"')
    # strip any angle-brackets the client might have included
    prop_iri  = prop.strip().strip("<>")

    sparql = f"""
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>

SELECT DISTINCT ?obj ?objLabel
WHERE {{
  ?paper
      a                 gutprop:Paper ;
    					gutprop:paperId ?paperId;
      gutprop:hasAbstract  ?abstract .
  ?abstract
      a                   gutprop:PaperAbstract ;
    				      gutprop:hasAbstractText ?abstractText;
      gutprop:composedOf  ?sentence .
  ?sentence
      a                   gutprop:Sentence;
    					  gutprop:hasSentenceText ?sentText;
    					  gutprop:partOf ?abstract.
  ?mention
      a                   gutprop:Mention ;
      gutprop:locatedIn   ?sentence .
  ?seed
     rdfs:label        ?lbl;
     gutprop:containedIn ?mention;
     <{prop_iri}> ?obj .

  FILTER( LCASE(STR(?lbl)) = LCASE("{safe_term}") )

  OPTIONAL {{ ?obj rdfs:label ?objLabel }}
}}
"""

    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])
    objects = []
    for b in bindings:
        uri = b["obj"]["value"]
        label = b.get("objLabel", {}).get("value") or uri.split("/")[-1]
        objects.append({
            "uri":   uri,
            "label": label,
            
        })
        print(f"Found object: {uri} ({label})")

    return JsonResponse({"objects": objects})

@require_http_methods(["GET"])
def list_class_individuals(request):

    class_param = request.GET.get("class", "").strip()
    if not class_param:
        return JsonResponse(
            {"error": "Missing required `class` parameter"},
            status=400
        )

    class_iri = class_param.strip().strip("<>")

    sparql = f"""
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?seed ?lbl
WHERE {{

  ?seed rdf:type <{class_iri}> ;
               rdfs:label ?lbl .
    
}}
ORDER BY ?lbl ?seed
"""

    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])
    individuals = []
    for b in bindings:
        uri   = b["seed"]["value"]
        label = b.get("lbl", {}).get("value") or uri.rsplit("/", 1)[-1]
        individuals.append({
            "uri":   uri,
            "label": label
        })

    return JsonResponse({"individuals": individuals})


@require_http_methods(["GET"])
def list_all_individuals(request):
    sparql = """

PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT
  ?ind
  ?indname
WHERE {{
  ?ind a owl:NamedIndividual ;
       rdfs:label    ?indname .

  FILTER(
    !REGEX(?indname, "mention",  "i") &&
    !REGEX(?indname, "abstract", "i") &&
    !REGEX(?indname, "paper",    "i") &&
    !REGEX(?indname, "title",    "i") &&
    !REGEX(?indname, "sentence", "i") &&
    !REGEX(?indname, "collection", "i") &&
    !REGEX(?indname, "Concept Scheme", "i")
  )
}}
ORDER BY LCASE(?indname)
"""
    results = run_sparql_query(sparql)
    bindings = results["results"]["bindings"]
    individuals = [
        { "uri": b["ind"]["value"], "label": b["indname"]["value"] }
        for b in bindings
    ]
    return JsonResponse({ "individuals": individuals })

@require_http_methods(["GET"])
def paper_details(request):
    paper_id = request.GET.get("paperId", "").strip()
    if not paper_id:
        return JsonResponse({"error": "Missing paperId"}, status=400)

    # we're going to match the paperId exactly
    filter_clause = f'FILTER(STR(?paperid) = "{paper_id}") .'

    sparql = f"""
PREFIX xsd:      <http://www.w3.org/2001/XMLSchema#>
PREFIX gutbrain: <https://w3id.org/hereditary/ontology/gutbrain/resource/>
PREFIX gutprop:  <https://w3id.org/hereditary/ontology/gutbrain/schema/>
PREFIX rdfs:     <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT
  ?paperid
  (?p as ?uri)
  ?titletext
  ?author
  ?journal
  ?annotator
  ?pubYear
  ?collection
  ?abstracttext
WHERE {{
  # get the collection and paper IRI
  ?col a gutprop:PaperCollection ;
       rdfs:label       ?collection ;
       gutprop:contains ?p       .

  # restrict to our paper IRI
  ?p   a gutprop:Paper ;
       gutprop:paperId        ?paperid ;
       gutprop:hasTitle       ?title ;
       gutprop:paperAuthor    ?author ;
       gutprop:paperJournal   ?journal ;
       gutprop:paperAnnotator ?annotator ;
       gutprop:paperYear      ?pubYear ;
       gutprop:hasAbstract    ?abstract .

  # title text node
  ?title a gutprop:PaperTitle ;
         gutprop:hasTitleText ?titletext .

  # abstract text node
  ?abstract a gutprop:PaperAbstract ;
            gutprop:hasAbstractText ?abstracttext .

  {filter_clause}
}}
LIMIT 1
"""

    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])
    if not bindings:
        return JsonResponse({"error": "Paper not found"}, status=404)

    b = bindings[0]
    paper = {
        "paperid":      b["paperid"]["value"],
        "uri":          b["uri"]["value"],
        "titletext":    b.get("titletext", {}).get("value", ""),
        "author":       b.get("author", {}).get("value", ""),
        "journal":      b.get("journal", {}).get("value", ""),
        "annotator":    b.get("annotator", {}).get("value", ""),
        "pubYear":      b.get("pubYear", {}).get("value", ""),
        "collection":   b.get("collection", {}).get("value", ""),
        "abstracttext": b.get("abstracttext", {}).get("value", ""),
    }

    return JsonResponse({"paper": paper})

@require_http_methods(["GET"])
def list_details(request):
    sparql = """
PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT
  ?annotator
  ?paper
  ?collection
  ?year
  ?journal
  (GROUP_CONCAT(DISTINCT ?author; separator=", ") AS ?authors)
WHERE {
  ?col a gutprop:PaperCollection ;
       rdfs:label            ?collection ;
       gutprop:contains     ?pap .

  ?pap a            gutprop:Paper ;
       gutprop:paperAnnotator ?annotator ;
       gutprop:paperId        ?paper ;
       gutprop:paperYear      ?year ;
       gutprop:paperJournal   ?journal ;
       gutprop:paperAuthor    ?author .
}
GROUP BY
  ?annotator
  ?paper
  ?collection
  ?year
  ?journal
ORDER BY
  ?collection
  ?paper
"""
    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])

    annos      = set()
    papers     = set()
    colls      = set()
    years      = set()
    journals   = set()
    authors    = set()

    for b in bindings:
        annos.add(b["annotator"]["value"])
        papers.add(b["paper"]["value"])
        colls.add(b["collection"]["value"])
        years.add(b["year"]["value"])
        journals.add(b["journal"]["value"])
        authors.add(b["authors"]["value"])

    return JsonResponse({
        "annotators": sorted(annos),
        "papers":     sorted(papers),
        "collections":sorted(colls),
        "years":      sorted(years),
        "journals":   sorted(journals),
        "authors":    sorted(authors),
    })