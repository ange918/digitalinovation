import { redirect } from 'next/navigation';

/**
 * La moderation a fusionne avec le reste du board : deux tableaux de bord
 * concurrents sur les memes donnees se contredisaient des qu'une decision
 * etait prise dans l'un. Les liens et signets existants restent valides.
 */
export default function ModerationPage() {
  redirect('/admin#demandes');
}
