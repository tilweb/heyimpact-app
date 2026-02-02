import fs from 'fs';
import path from 'path';
import config from '../config.js';
import OpenAI from 'openai';

function getLLMClient() {
  return new OpenAI({
    baseURL: config.adacorApiBase,
    apiKey: config.adacorApiKey || 'not-set',
  });
}

async function chatCompletion(prompt, maxTokens = 1000, temperature = 0.2) {
  const client = getLLMClient();
  const response = await client.chat.completions.create({
    model: config.adacorModel,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content.trim();
}

async function fileToText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (ext === '.txt' || ext === '.md') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Nicht unterstuetztes Dateiformat: ${ext}`);
}

const VALID_TOPICS = ['E1', 'E2', 'E3', 'E4', 'E5', 'S1', 'S2', 'S3', 'S4', 'G1'];
const VALID_POLICY_TYPES = ['Richtlinie', 'Strategie', 'Leitlinie', 'Verhaltenskodex', 'Verpflichtung', 'Standard'];
const VALID_STATUSES = ['Entwurf', 'Genehmigt', 'Umgesetzt', 'In Pruefung', 'Archiviert'];

function validateExtracted(data) {
  const result = { ...data };

  if (result.topic && !VALID_TOPICS.includes(result.topic)) {
    result.topic = '';
  }
  if (result.policy_type && !VALID_POLICY_TYPES.includes(result.policy_type)) {
    result.policy_type = 'Richtlinie';
  }
  if (result.status && !VALID_STATUSES.includes(result.status)) {
    result.status = 'Entwurf';
  }
  if (typeof result.is_mandatory !== 'boolean') {
    result.is_mandatory = false;
  }

  result.title = result.title || '';
  result.description = result.description || '';
  result.responsible_person = result.responsible_person || '';
  result.responsible_department = result.responsible_department || '';

  return result;
}

export async function extractPolicyFromDocument(filePath) {
  const rawText = await fileToText(filePath);
  const truncated = rawText.slice(0, 8000);

  const prompt = `Du bist ein Experte fuer ESRS-Nachhaltigkeitsberichterstattung.

Analysiere den folgenden Dokumenttext und extrahiere die Informationen fuer eine Nachhaltigkeitsrichtlinie.

Antworte NUR mit einem validen JSON-Objekt mit genau diesen Feldern:
{
  "topic": "ESRS-Thema-Code, eines von: E1, E2, E3, E4, E5, S1, S2, S3, S4, G1 (oder leer wenn unklar)",
  "title": "Titel der Richtlinie",
  "description": "Kurzbeschreibung der Richtlinie (2-4 Saetze)",
  "policy_type": "eines von: Richtlinie, Strategie, Leitlinie, Verhaltenskodex, Verpflichtung, Standard",
  "is_mandatory": true oder false,
  "status": "eines von: Entwurf, Genehmigt, Umgesetzt, In Pruefung, Archiviert",
  "responsible_person": "Name der verantwortlichen Person (oder leer)",
  "responsible_department": "Name der Abteilung (oder leer)"
}

Wichtig:
- topic muss eines der genannten ESRS-Themen sein (E1=Klimawandel, E2=Umweltverschmutzung, E3=Wasser, E4=Biodiversitaet, E5=Kreislaufwirtschaft, S1=Eigene Belegschaft, S2=Wertschoepfungskette, S3=Betroffene Gemeinschaften, S4=Verbraucher, G1=Unternehmensfuehrung)
- Wenn ein Feld nicht aus dem Text ableitbar ist, setze einen leeren String
- Antworte NUR mit dem JSON, keine Erklaerung

DOKUMENTTEXT:
${truncated}`;

  const llmResponse = await chatCompletion(prompt, 1000, 0.2);

  // Parse JSON from LLM response
  let extracted;
  try {
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Kein JSON in LLM-Antwort gefunden');
    extracted = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`LLM-Antwort konnte nicht als JSON geparst werden: ${e.message}`);
  }

  const validated = validateExtracted(extracted);

  return {
    extracted: validated,
    raw_text_preview: rawText.slice(0, 500),
  };
}

export async function extractFromDocument(sourceId) {
  const filepath = path.join(config.uploadsDir, sourceId);
  if (!fs.existsSync(filepath)) {
    throw new Error('Datei nicht gefunden');
  }

  return {
    extracted_fields: [],
    extracted_certifications: [],
    extracted_policies: [],
    extracted_targets: [],
    extracted_actions: [],
    data_conflicts: [],
    status: 'extraction_not_implemented',
    message: 'Dokument-Extraktion wird in einer späteren Phase implementiert',
  };
}
