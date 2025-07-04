import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { addInscriptionIfNotExists } from './googleSheetsService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Route d'inscription
app.post('/api/inscription', async (req, res) => {
  const { nom, prenom, email, age, sex, adresse, telephone, soeurs, freres, rang, statut, classe, profession } = req.body;
  // Vérification des champs obligatoires
  if (
    !nom || !prenom || !email || !age || !sex || !adresse || !telephone ||
    soeurs === undefined || freres === undefined || rang === undefined || !statut ||
    (statut === 'Etudiant' && !classe) ||
    (statut === 'Travailleur' && !profession)
  ) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
  }
  try {
    const result = await addInscriptionIfNotExists(req.body);
    if (result === 'exists') {
      return res.status(409).json({ message: 'Vous avez déjà soumis une demande.' });
    }
    return res.status(201).json({ message: 'Votre demande a bien été envoyée et est en attente de validation.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
}); 
