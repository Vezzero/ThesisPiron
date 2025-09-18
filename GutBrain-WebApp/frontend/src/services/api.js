export async function listAuthors() {
  const resp = await fetch("/app/gutbrainkb/api/list_authors/");
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.authors);
}

export async function listClassesWithIndividuals() {
  const resp = await fetch("/app/gutbrainkb/api/list_classes_with_inds/");
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.classes);
}

export async function listAllIndividuals() {
  const resp = await fetch("/app/gutbrainkb/api/list_all_individuals/");
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.individuals);
}

export async function fetchTermMentions(term) {
  const { fetchTermMentions } = await import("../services/graphServices");
  return fetchTermMentions(term);
}

export async function listPropertyTerm(term) {
  const resp = await fetch(
    `/app/gutbrainkb/api/list_property_term/?term=${encodeURIComponent(term)}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.relations);
}

export async function listClassIndividuals(classIri) {
  const resp = await fetch(
    `/app/gutbrainkb/api/list_class_individuals/?class=${encodeURIComponent(classIri)}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.individuals);
}

export async function listPublicationsPerYear(term) {
  const resp = await fetch(
    `/app/gutbrainkb/api/list_publications_per_year/?term=${encodeURIComponent(term)}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  const { chartData } = await resp.json();
  return chartData;
}

export async function listPropertyObjects(term, prop) {
  const resp = await fetch(
    `/app/gutbrainkb/api/list_property_objects/?term=${encodeURIComponent(
      term
    )}&prop=${encodeURIComponent(prop)}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.objects);
}

export async function getPaperDetails(paperId) {
  const resp = await fetch(
    `/app/gutbrainkb/api/paper_details/?paperId=${encodeURIComponent(paperId)}`
  );
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json().then(json => json.paper);
}
