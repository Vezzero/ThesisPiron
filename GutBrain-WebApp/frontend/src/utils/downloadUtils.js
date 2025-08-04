export async function downloadJsonIndividual(individual, relationsList, mentions) {
  const term = individual.indname;
  
  const allRelationEntries = await Promise.all(
    relationsList.map(async r => {
      const url = `/api/list_property_objects/?term=${encodeURIComponent(term)}&prop=${encodeURIComponent(r.prop)}`;
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
