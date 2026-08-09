import type { FicheInscription, PieceJointe } from '@/types';

export async function exportFichePDF(fiche: FicheInscription) {
  // Import différé : jsPDF ne doit alourdir que le bundle du backoffice, jamais le site public.
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pieces: PieceJointe[] = JSON.parse(fiche.pieces_jointes || '[]');
  let y = 20;

  const ligne = (label: string, valeur: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} :`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(valeur || '-', 70, y);
    y += 8;
  };

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Fiche de demande d\'admission — Best Berry', 14, y);
  y += 6;
  doc.setDrawColor(76, 154, 42);
  doc.line(14, y, 196, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Enfant', 14, y);
  y += 8;
  ligne('Nom', fiche.enfant_nom);
  ligne('Prénom', fiche.enfant_prenom);
  ligne('Date de naissance', fiche.enfant_date_naissance);
  ligne('Sexe', fiche.enfant_sexe);
  ligne('Niveau visé', fiche.niveau_vise);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Parent / tuteur', 14, y);
  y += 8;
  ligne('Nom', fiche.parent_nom);
  ligne('Lien de parenté', fiche.lien_parente);
  ligne('Téléphone', fiche.parent_telephone);
  ligne('Email', fiche.parent_email);
  ligne('Adresse', fiche.parent_adresse);

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Suivi du dossier', 14, y);
  y += 8;
  ligne('Statut', fiche.statut);
  ligne('Date de réception', new Date(fiche.$createdAt).toLocaleString('fr-FR'));

  if (pieces.length) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Pièces jointes fournies', 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    pieces.forEach((p) => {
      doc.text(`- ${p.type} : ${p.nom_original}`, 14, y);
      y += 7;
    });
  }

  doc.save(`inscription_${fiche.enfant_nom}_${fiche.enfant_prenom}.pdf`);
}

export function exportInscriptionsCSV(fiches: FicheInscription[]) {
  const colonnes = [
    'enfant_nom', 'enfant_prenom', 'enfant_date_naissance', 'enfant_sexe', 'niveau_vise',
    'parent_nom', 'lien_parente', 'parent_telephone', 'parent_email', 'parent_adresse',
    'statut', 'date_reception',
  ];

  const echapper = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const lignes = [
    colonnes.join(','),
    ...fiches.map((f) =>
      [
        f.enfant_nom, f.enfant_prenom, f.enfant_date_naissance, f.enfant_sexe, f.niveau_vise,
        f.parent_nom, f.lien_parente, f.parent_telephone, f.parent_email, f.parent_adresse,
        f.statut, new Date(f.$createdAt).toLocaleDateString('fr-FR'),
      ].map(echapper).join(','),
    ),
  ];

  // BOM UTF-8 pour un affichage correct des accents dans Excel
  const blob = new Blob(['\uFEFF' + lignes.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscriptions_best_berry_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
