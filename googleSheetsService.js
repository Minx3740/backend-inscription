import { google } from 'googleapis';
import { readFile } from 'fs/promises';

const SPREADSHEET_ID = '1fHfzEpyee_2fZL-g_-lO4AD6IKMZ8OU1V6JoIKf7B38'; // À remplacer par l'ID de ton Google Sheet
const SHEET_NAME = 'Feuille 1'; // À adapter si besoin

async function getAuth() {
  const credentials = JSON.parse(await readFile('./credentials.json', 'utf8'));
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes,
  });
  return auth.getClient();
}

export async function addInscriptionIfNotExists(data) {
  const client = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth: client });
  // Récupérer toutes les inscriptions
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:Z`,
  });
  const rows = response.data.values || [];
  // Vérifier unicité nom + facebook
  if (rows.some(row => {
    const nom = row[0] ? row[0].toLowerCase().trim() : '';
    const facebook = row[7] ? row[7].toLowerCase().trim() : '';
    return nom === data.nom.toLowerCase().trim() && facebook === data.facebook.toLowerCase().trim();
  })) {
    return 'exists';
  }
  // Ajouter la nouvelle inscription (ordre des champs)
  const now = new Date().toLocaleString('fr-FR');
  const newRow = [
    data.nom,
    data.prenom,
    data.email,
    data.age,
    data.sex,
    data.adresse,
    data.telephone,
    data.facebook,
    data.maladie,
    data.medicaments,
    data.aliments,
    data.soeurs,
    data.freres,
    data.rang,
    data.statut,
    data.classe,
    data.profession,
    data.aime,
    data.deteste,
    data.hobbies,
    'en attente',
    now
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newRow],
    },
  });
  return 'added';
} 