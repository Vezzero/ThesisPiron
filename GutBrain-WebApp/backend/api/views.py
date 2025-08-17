import re
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rdfapp.rdf_client import run_sparql_query
import logging


logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
def list_everything(request):
    term = request.GET.get("term", "").strip()
    logger.debug("raw term: %r", term)
    safe_term = term.replace('"', '\\"')
    logger.debug("safe_term: %r", safe_term)

    filter_clause = (
    f'FILTER(LCASE(STR(?indname)) = LCASE("{safe_term}"))'
    if safe_term else ""
    )
    sparql = f"""
                PREFIX xsd:      <http://www.w3.org/2001/XMLSchema#>
                PREFIX gutbrain: <https://w3id.org/hereditary/ontology/gutbrain/resource/>
                PREFIX gutprop:  <https://w3id.org/hereditary/ontology/gutbrain/schema/>
                PREFIX rdfs:     <http://www.w3.org/2000/01/rdf-schema#>
                PREFIX rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

                SELECT DISTINCT
                ?paperid
                ?mention
                ?title
                ?abstract
                ?author
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
                ?x
                ?abstractLabel
                ?titleLabel
                ?mentionLabel
                ?sentenceLabel
                ?paperLabel

                WHERE {{
                ?x a gutprop:PaperCollection ;
                    rdfs:label       ?collection ;
                    gutprop:contains ?p .

                ?p a gutprop:Paper ;
                    rdfs:label          ?paperLabel ;
                    gutprop:paperId     ?paperid ;
                    gutprop:hasTitle    ?title ;
                    gutprop:paperAuthor ?author ;
                    gutprop:paperJournal ?journal ;
                    gutprop:paperAnnotator ?annotator ;
                    gutprop:paperYear   ?pubYear ;
                    gutprop:hasAbstract ?abstract .

                ?abstract a gutprop:PaperAbstract ;
                            gutprop:hasAbstractText ?abstracttext .
                OPTIONAL {{ ?abstract rdfs:label ?abstractLabel }}

                ?title a gutprop:PaperTitle ;
                        gutprop:hasTitleText ?titletext .
                OPTIONAL {{ ?title rdfs:label ?titleLabel }}

                # Mentions (label optional)
                ?mention a gutprop:Mention ;
                        gutprop:hasMentionText ?mentiontext ;
                        gutprop:locatedIn      ?sent .
                OPTIONAL {{ ?mention rdfs:label ?mentionLabel }}

                # Sentences from EITHER abstract OR title
                {{
                    ?sent a gutprop:Sentence ;
                        gutprop:hasSentenceText ?senttext ;
                        gutprop:partOf          ?abstract .
                }}
                UNION
                {{
                    ?sent a gutprop:Sentence ;
                        gutprop:hasSentenceText ?senttext ;
                        gutprop:partOf          ?title .
                }}
                OPTIONAL {{ ?sent rdfs:label ?sentenceLabel }}

                # Individual and its comment
                ?ind gutprop:containedIn ?mention ;
                    rdfs:label           ?indname ;
                    rdf:type             ?class .
                OPTIONAL {{ ?ind rdfs:comment ?comment }}
                ?class rdfs:label ?classLabel .

                FILTER NOT EXISTS {{
                    ?ind rdf:type ?subcls .
                    ?subcls rdfs:subClassOf+ ?class .
                    FILTER(?subcls != ?class)
                }}

                {filter_clause}
                }}
                ORDER BY ?paperid ?senttext
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
            "mentiontext":  b["mentiontext"]["value"],
            "paper":        b["p"]["value"],
            "collection":  b.get("collection", {}).get("value", ""),
            "classLabel":  b.get("classLabel", {}).get("value", ""),
            "classIri":       b["class"]["value"],
            "ind":         b["ind"]["value"],
            "abstract":    b["abstract"]["value"],
            "title":       b["title"]["value"],
            "collectionUri":  b["x"]["value"],
            "abstractLabel": b["abstractLabel"]["value"],
            "titleLabel": b["titleLabel"]["value"],
            "mentionLabel": b["mentionLabel"]["value"],
            "sentenceLabel": b["sentenceLabel"]["value"],
            "paperLabel": b["paperLabel"]["value"],
            "mention" : b["mention"]["value"]
        })

    merged = {}
    for m in raw:
        key = (m["paperid"], m["senttext"], m["mentiontext"])
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
            "count": int(b["count"]["value"]),
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

    safe_term = term.replace('"', '\\"')
    prop_iri  = prop.strip().strip("<>")

    sparql = f"""
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>

                    SELECT DISTINCT ?obj ?objLabel
                    WHERE {{
                    ?paper
                        a                 gutprop:Paper ;
                                            gutprop:paperId ?paperId;
                        gutprop:hasAbstract  ?abstract ;
                        gutprop:hasTitle     ?title .

                    ?abstract
                        a                   gutprop:PaperAbstract ;
                                            gutprop:hasAbstractText ?abstractText.

                    ?title a gutprop:PaperTitle ;
                        gutprop:hasTitleText ?titletext .

                    # Sentences from EITHER abstract OR title
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?abstract .
                        }}
                        UNION
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?title .
                        }}
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
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>
                PREFIX rdfs:     <http://www.w3.org/2000/01/rdf-schema#>

                SELECT
                ?seed
                ?lbl
                ?classComment
                ?indComment
                (COUNT(DISTINCT ?p) AS ?count)
                WHERE {{
                ?p a gutprop:Paper ;
                    gutprop:paperYear  ?year ;
                    gutprop:hasAbstract ?abstract;
                    gutprop:hasTitle    ?title .

                ?abstract a gutprop:PaperAbstract .
                ?title a gutprop:PaperTitle .
                # Sentences from EITHER abstract OR title
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?abstract .
                        }}
                        UNION
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?title .
                        }}
                ?mention a gutprop:Mention ;
                        gutprop:hasMentionText  ?mtext ;
                        gutprop:locatedIn      ?sentence .
                        
                        ?seed rdf:type <{class_iri}> ;
                            rdfs:label ?lbl;
                            gutprop:containedIn ?mention.

                        <{class_iri}> rdfs:label ?classLabel ;
                                    rdfs:comment ?classComment .
                    OPTIONAL {{ ?seed rdfs:comment ?indComment . }}
                }}
                GROUP BY ?seed ?lbl ?classComment ?indComment
                ORDER BY ?lbl
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
        label_count = b.get("count", {}).get("value", "1")
        comment = b.get("classComment", {}).get("value", "")
        indComment = b.get("indComment", {}).get("value", "")
        m_def = re.search(r"^(.*?\[Definition Source:[^\]]+\])", indComment)
        if m_def:
            definition = m_def.group(1).strip()
        else:
            definition = ""

        individuals.append({
            "uri":   uri,
            "label": label,
            "count": int(label_count),
            "comment": comment,
            "definition": definition,
        })

        merged = {}
        for m in individuals:
            key = (m["uri"], m["label"])
            if key not in merged:
                merged[key] = m.copy()
            else:
                entry = merged[key]
                if m["definition"] and not entry["definition"]:
                    entry["definition"] = m["definition"]

    return JsonResponse({"individuals": list(merged.values())})


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

    journal_counts = {}
    year_counts    = {}
    collection_counts = {}
    annot_set      = set()
    paper_set      = set()
    author_set     = set()

    for b in bindings:
        annot_set .add(b["annotator"]["value"])
        paper_set .add(b["paper"]["value"])
        j = b["journal"]["value"]
        journal_counts[j] = journal_counts.get(j, 0) + 1
        y = b["year"]["value"]
        year_counts[y] = year_counts.get(y, 0) + 1
        c = b["collection"]["value"]
        collection_counts[c] = collection_counts.get(c, 0) + 1

        author_set.add(b["authors"]["value"])

    journals = [
        {"value": j, "count": c}
        for j, c in sorted(journal_counts.items(), key=lambda x: x[0].lower())
    ]
    years = [
        {"value": y, "count": c}
        for y, c in sorted(year_counts.items(), key=lambda x: x[0])
    ]
    collections = [
        {"value": c, "count": d}
        for c, d in sorted(collection_counts.items(), key=lambda x: x[0])
    ]

    return JsonResponse({
        "annotators": sorted(annot_set),
        "papers":     sorted(paper_set),
        "collections":collections,
        "years":      years,
        "journals":   journals,
        "authors":    sorted(author_set),
    })

from collections import Counter

@require_http_methods(["GET"])
def list_authors(request):
    sparql = """
                PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>

                SELECT DISTINCT
                ?p
                ?authors
                WHERE {
                ?p a gutprop:Paper ;
                    gutprop:paperAuthor ?authors .
                }
            """
    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])
    
    counter = Counter()
    for b in bindings:
        raw = b["authors"]["value"]
        for name in raw.split(";"):
            name = name.strip()
            if name:
                counter[name] += 1

    authors_list = [
        {"name": name, "count": count}
        for name, count in counter.most_common()
    ]

    return JsonResponse({"authors": authors_list})

@require_http_methods(["GET"])
def list_classes_with_individuals(request):
    sparql = """
                PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>
                PREFIX bt:      <https://w3id.org/brainteaser/ontology/schema/>
                PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>

                SELECT
                ?cls
                ?clsLabel
                ?ind
                ?indLabel
                (COUNT(DISTINCT ?paper) AS ?numpapers)
                WHERE {
                ?paper
                    a                 gutprop:Paper ;
                    gutprop:hasAbstract  ?abstract ;
                    gutprop:hasTitle     ?title .
                ?abstract
                    a                 gutprop:PaperAbstract .
                ?title a gutprop:PaperTitle .
                # Sentences from EITHER abstract OR title
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?abstract .
                        }}
                        UNION
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?title .
                        }}
                ?mention
                    a                   gutprop:Mention ;
                    gutprop:locatedIn   ?sentence .

                # Restrict to only those 13 classes
                VALUES ?cls {
                    bt:AnatomicalSite
                    gutprop:Animal
                    gutprop:BiomedicalTechnique
                    gutprop:Chemical
                    gutprop:DietarySupplement
                    bt:DiseaseDisorderOrFinding
                    gutprop:Drug
                    gutprop:Family
                    gutprop:Food
                    gutprop:Species
                    bt:Gene
                    gutprop:Human
                    gutprop:Mention
                    gutprop:Microbiome
                    gutprop:Paper
                    gutprop:PaperAbstract
                    gutprop:PaperCollection
                    gutprop:PaperTitle
                    gutprop:Sentence
                    gutprop:StatisticalTechnique
                }

                ?cls rdfs:label ?clsLabel .

                ?ind
                    a         ?cls ;
                    rdfs:label ?indLabel ;
                    gutprop:containedIn ?mention .
                }
                GROUP BY
                ?cls
                ?clsLabel
                ?ind
                ?indLabel
                ORDER BY
                ASC(?clsLabel)
                ASC(?indLabel)
             """
    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])

    classes = {}
    for b in bindings:
        cls_iri   = b["cls"]["value"]
        cls_lbl   = b["clsLabel"]["value"]
        ind_iri   = b["ind"]["value"]
        ind_lbl   = b["indLabel"]["value"]

        num_papers = int(b["numpapers"]["value"])

        if cls_iri not in classes:
            classes[cls_iri] = {
                "classIri":   cls_iri,
                "classLabel": cls_lbl,
                "individuals": []
            }
        classes[cls_iri]["individuals"].append({
            "uri":   ind_iri,
            "label": ind_lbl,
            "count":  num_papers,
        })

    payload = sorted(
      classes.values(),
      key=lambda c: c["classLabel"].lower()
    )

    return JsonResponse({ "classes": payload }, json_dumps_params={"indent":2})

@require_http_methods(["GET"])
def list_publications_per_year(request):
    term = request.GET.get("term", "").strip()
    if not term:
        return JsonResponse(
            {"error": "Missing required query parameter: term"},
            status=400
        )

    sparql = f"""
                PREFIX gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/>
                PREFIX rdfs:     <http://www.w3.org/2000/01/rdf-schema#>

                SELECT
                ?year
                (COUNT(DISTINCT ?p) AS ?count)
                WHERE {{
                ?p a gutprop:Paper ;
                    gutprop:paperYear  ?year ;
                    gutprop:hasAbstract ?abstract;
                    gutprop:hasTitle    ?title .
                ?abstract a gutprop:PaperAbstract .
                ?title a gutprop:PaperTitle .
                # Sentences from EITHER abstract OR title
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?abstract .
                        }}
                        UNION
                        {{
                            ?sentence a gutprop:Sentence ;
                                gutprop:hasSentenceText ?senttext ;
                                gutprop:partOf          ?title .
                        }}
                        OPTIONAL {{ ?sentence rdfs:label ?sentenceLabel }}
                ?mention a gutprop:Mention ;
                        gutprop:hasMentionText  ?mtext ;
                        gutprop:locatedIn      ?sentence .
                        
                
                ?seed rdfs:label ?indname;
                        gutprop:containedIn ?mention.
                FILTER(LCASE(STR(?indname)) = LCASE("{term}"))
                }}
                GROUP BY ?year
                ORDER BY ?year
               """
    try:
        results = run_sparql_query(sparql)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    bindings = results.get("results", {}).get("bindings", [])

    chart_data = [["Year", "Count"]]
    for b in bindings:
        year  = b["year"]["value"]
        count = int(b["count"]["value"])
        chart_data.append([year, count])

    return JsonResponse(
        {"chartData": chart_data},
        json_dumps_params={"indent": 2}
    )