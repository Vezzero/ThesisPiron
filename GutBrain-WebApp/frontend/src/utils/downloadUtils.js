export async function downloadJsonIndividual(individual, relationsList, mentions) {
  const term = individual.indname;
  
  const allRelationEntries = await Promise.all(
    relationsList.map(async r => {
      const url = `/app/gutbrainkb/api/list_property_objects/?term=${encodeURIComponent(term)}&prop=${encodeURIComponent(r.prop)}`;
      let objects = [];
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(await resp.text());
        const json = await resp.json();
        objects = json.objects || [];
      } catch (e) {
        console.error("Failed to load objects for", r.prop, e);
      }
      return objects.map(o => ({
        entitySubject: term,
        predicate:     r.prop,
        entityObject:  o.label,
        relationCount: r.count,
        objectUri:     o.uri
      }));
    })
  );

  const relationsExport = allRelationEntries.flat();

  const sentencesExport = mentions
    .filter(m => m.indname === term)
    .map(m => ({
      sentenceUri:       m.sent  || "",
      sentenceText:      m.senttext     || "",
      sentenceAnnotator: m.annotator    || "",
      partOf: {
        paperId:         m.paperid,
        paperUri:        m.paper        || "",
        paperTitle:      m.titletext    || "",
        paperAbstract:   m.abstracttext || "",
        paperAuthor:     m.author       || "",
        publicationYear: m.pubYear      || "",
        paperJournal:    m.journal      || ""
      },
      locatedIn: { mentionText: m.mentiontext }
    }));

  const payload = {
    fullName:      individual.indname,
    uri:           individual.ind,
    class:         individual.classLabel   || "",
    definition:    individual.definition   || "",
    ontologyMatch: (individual.ontologyMatch || "").trim(),
    relations:     relationsExport,
    sentences:     sentencesExport
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const safeName = term.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

function ttlEscape(str = "") {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

export async function downloadRdfIndividual(individual, relationsList, mentions) {
  const term       = individual.indname;
  const subj       = `<${individual.ind}>`;
  const papers     = Array.from(new Set(mentions.map(m => m.paper)));

  const relObjs = await Promise.all(
    relationsList.map(async r => {
      const url = `/app/gutbrainkb/api/list_property_objects/`
        + `?term=${encodeURIComponent(term)}`
        + `&prop=${encodeURIComponent(r.prop)}`;
      let objects = [];
      try {
        const resp = await fetch(url);
        if (resp.ok) objects = (await resp.json()).objects || [];
      } catch (_) {}
      return { prop: r.prop, objects };
    })
  );

  let ttl = "";
  ttl += `@prefix gutprop: <https://w3id.org/hereditary/ontology/gutbrain/schema/> .\n`;
  ttl += `@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .\n`;
  ttl += `@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .\n`;
  ttl += `@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\n`;

  ttl += `${subj}\n`;
  ttl += `    rdf:type owl:NamedIndividual ,\n`;
  ttl += `             <${individual.classIri}> ;\n`;
  ttl += `    rdfs:label "${ttlEscape(term)}" ;\n`;
  ttl += `    rdfs:comment "${ttlEscape(individual.definition)}" ;\n`;
  ttl += `    rdfs:comment "${ttlEscape(individual.ontologyMatch)}" ;\n`;


  const mentionUris = Array.from(
    new Set(
      mentions
        .filter(m => m.indname === term)
        .map(m => m.mention)
    )
  );
  mentionUris.forEach(uri => {
    ttl += `    gutprop:containedIn <${uri}> ;\n`;
  });

  relObjs.forEach(({ prop, objects }) => {
    const short = prop.split("/").pop();
    objects.forEach(o => {
      ttl += `gutprop:${short} <${o.uri}> ;\n`;
    });
  });

  ttl = ttl.replace(/;\n$/, " .\n\n");

  relObjs.flatMap(r => r.objects).forEach(o => {
    ttl += `<${o.uri}> rdfs:label "${ttlEscape(o.label)}" .\n`;
  });
  ttl += `\n`;

const colls = new Map();
mentions.forEach(m => {
  if (m.collectionUri) {
    colls.set(m.collectionUri, m.collection);
  }
});

for (const [uri, label] of colls.entries()) {
  const collUri = `<${uri}>`;
  ttl += `${collUri} a gutprop:PaperCollection ;\n`;
  ttl += `    rdfs:label "${ttlEscape(label)}" ;\n`;

  const papersInThisColl = mentions
    .filter(m => m.collectionUri === uri)
    .map(m => m.paper);

  const uniqPapers = Array.from(new Set(papersInThisColl));

  uniqPapers.forEach(pu => {
    ttl += `    gutprop:contains <${pu}> ;\n`;
  });
  ttl = ttl.replace(/;\n$/, " .\n\n");
}

  for (const pu of papers) {
  const sentForPaper = mentions.filter(
    m => m.paper === pu && m.indname === term
  );
  if (!sentForPaper.length) continue;

  const {
    abstracttext = "",
    titletext    = "",
    abstract: abstractUriStr,
    title:     titleUriStr,
    abstractLabel,
    titleLabel
  } = sentForPaper[0];

  const absUri = `<${abstractUriStr}>`;
  const ttlUri = `<${titleUriStr}>`;

  const absSents = sentForPaper
    .filter(s => !s.sent.endsWith("_0"))
    .map(s => `<${s.sent}>`);
  ttl += `${absUri} a gutprop:PaperAbstract ;\n`;
  if (abstractLabel) {
    ttl += `    rdfs:label "${ttlEscape(abstractLabel)}" ;\n`;
  }
  ttl += `    gutprop:hasAbstractText """${ttlEscape(abstracttext)}""" ;\n`;
  ttl += absSents.length
    ? `    gutprop:composedOf ${absSents.join(", ")} .\n\n`
    : `    .\n\n`;

  const titleSents = sentForPaper
    .filter(s => s.sent.endsWith("_0"))
    .map(s => `<${s.sent}>`);
  ttl += `${ttlUri} a gutprop:PaperTitle ;\n`;
  if (titleLabel) {
    ttl += `    rdfs:label "${ttlEscape(titleLabel)}" ;\n`;
  }
  ttl += `    gutprop:hasTitleText """${ttlEscape(titletext)}""" ;\n`;
  ttl += titleSents.length
    ? `    gutprop:composedOf ${titleSents.join(", ")} .\n\n`
    : `    .\n\n`;

  sentForPaper.forEach(s => {
  const mentionUri = `<${s.mention}>`;
  ttl += `${mentionUri} a gutprop:Mention ;\n`;
  ttl += `    rdfs:label           "${ttlEscape(s.mentionLabel)}" ;\n`;
  ttl += `    gutprop:hasMentionText "${ttlEscape(s.mentiontext)}" ;\n`;
  ttl += `    gutprop:locatedIn     <${s.sent}> .\n\n`;
  });

  sentForPaper.forEach(s => {
    const partOfUri = s.sent.endsWith("_0") ? ttlUri : absUri;
    ttl += `<${s.sent}>\n`;
    ttl += `    a gutprop:Sentence ;\n`;
    ttl += `    rdfs:label "${ttlEscape(s.sentenceLabel)}" ;\n`;
    ttl += `    gutprop:hasSentenceText "${ttlEscape(s.senttext)}" ;\n`;
    ttl += `    gutprop:partOf ${partOfUri} .\n\n`;
  });

  const m = sentForPaper[0];
  ttl += `<${pu}> a gutprop:Paper ;\n`;
  ttl += `    rdfs:label            "${ttlEscape(m.paperLabel)}" ;\n`;
  ttl += `    gutprop:paperId       "${ttlEscape(m.paperid)}"^^xsd:integer ;\n`;
  ttl += `    gutprop:paperJournal  "${ttlEscape(m.journal)}" ;\n`;
  ttl += `    gutprop:paperAuthor   "${ttlEscape(m.author)}" ;\n`;
  ttl += `    gutprop:paperYear     "${ttlEscape(m.pubYear)}"^^xsd:gYear ;\n`;
  ttl += `    gutprop:paperAnnotator "${ttlEscape(m.annotator)}" ;\n`;
  ttl += `    gutprop:hasAbstract   ${absUri} ;\n`;
  ttl += `    gutprop:hasTitle      ${ttlUri} .\n\n`;
}

  const blob = new Blob([ttl], { type: "text/turtle" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${term.replace(/\s+/g, "_")}.ttl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

