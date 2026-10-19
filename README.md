# Los Sinaloa’s — espace de gestion

Tableau de bord responsive inspiré de la maquette du site : navigation familiale, caisses, activités, inventaire, membres, recrutements, REECEL, opérations, demandes Drogue et hiérarchie. Le **Centre de veille** rassemble les opérations à venir, les demandes actives, les candidatures en attente, les stocks faibles et l’activité récente. L’affiche de présentation n’est pas utilisée en fond. Sans configuration Supabase, le mode démo conserve ses changements dans le navigateur.

## Lancer en local

1. Installe Node.js 20 ou supérieur.
2. Depuis ce dossier, lance `npm install`, puis `npm run dev`.
3. Ouvre l’adresse locale indiquée par Vite.

Sans variables Supabase, les formulaires fonctionnent en mode démo. La connexion est activée quand les deux variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont renseignées.

## Connecter Supabase

1. Crée un projet Supabase et garde son URL de projet ainsi que sa clé publique **anon/publishable**.
2. Dans **SQL Editor → New query**, colle le contenu de [`supabase/schema.sql`](supabase/schema.sql) et clique sur **Run**. Ça crée les tables, les comptes automatiques, les validations et les règles de sécurité RLS. Sur une ancienne installation, relance ce schéma mis à jour : il remplace les règles de l’application et conserve les autres politiques du projet.
3. Dans **Authentication → URL Configuration**, règle la Site URL sur l’adresse Vercel et ajoute-la aux Redirect URLs. Les personnes peuvent ensuite créer leur compte avec le bouton **Connexion → S’inscrire** du site. Supabase envoie un e-mail de confirmation si la confirmation d’adresse est activée dans les réglages d’authentification. Le déclencheur SQL crée automatiquement leur profil et leur membre au grade Recrue.
4. Une fois le compte créé, attribue-lui le grade Patron dans SQL Editor en remplaçant l’adresse :

   ```sql
   update public.profiles p
   set display_name = 'El Patrón', rank = '👑・EL PATRÓN'
   from auth.users u
   where p.id = u.id and u.email = 'ADRESSE_DU_PATRON';
   ```

5. Copie l’URL du projet dans `VITE_SUPABASE_URL` et la clé publique dans `VITE_SUPABASE_ANON_KEY`. Pour le développement local, crée `.env.local` à la racine du site avec ces deux lignes, puis redémarre Vite.

La clé `anon` est destinée au navigateur. Ne mets jamais la clé `service_role` dans une variable `VITE_` ni dans le code client. Le schéma active RLS : les comptes familiaux actifs peuvent consulter les données ; les écritures de caisse, stock, candidatures, REECEL, membres et profils sont limitées aux grades concernés.

Après la première connexion d’El Patrón, ouvre **Modération → Comptes familiaux et grades** pour attribuer les autres rôles. Cette page est réservée à El Patrón, la Mano Derecha et la Mano de Izquierda. Les six jefes ont chacun un assistant. Le jefe de recrutement (et les modérateurs) peut ajouter, accepter ou refuser une candidature. À l’acceptation, elle est ajoutée au roster au grade Recrue. Ensuite, invite cette personne dans **Supabase → Authentication → Users** avec la même adresse e-mail que la candidature : son compte se reliera automatiquement à la ligne membre. Les comptes non encore liés restent visibles comme membres du roster. Pour retirer un membre qui a un compte, désactive son compte depuis Modération ; pour retirer une ligne de roster sans compte, utilise l’action de retrait dans Membres. Un grade peut être changé depuis Modération et se synchronise au profil.

Le jefe REECEL et les modérateurs peuvent ajouter, valider ou refuser une vente déclarée. Une vente validée crédite automatiquement la caisse sale, une seule fois. Dans le catalogue REECEL, le jefe, son assistant et le haut commandement peuvent fixer des articles et leurs prix ; seuls les trois modérateurs peuvent retirer un article du catalogue. Tous les membres actifs peuvent préparer un panier. **Vente** retire les quantités de l’inventaire et crédite la caisse sale ; **Rachat** débite la caisse sale et ajoute les quantités à l’inventaire. Le stock et le solde sont vérifiés avant validation.

Le jefe de Plaza et son assistant peuvent ajouter ou retirer des fonds en saisissant un montant positif ou négatif. Le jefe Arsenal et son assistant gèrent le stock. Le jefe Opérations et son assistant tiennent le calendrier ; toute la famille voit les dates et peut ouvrir une fiche pour ses détails. Le jefe Drogue et son assistant publient les demandes, visibles sur le tableau de bord. Une demande Drogue terminée peut être supprimée par ces gestionnaires et le haut commandement. Le Centre de veille est réservé au haut commandement. Les autres grades consultent les données sans pouvoir les modifier. Chaque personne peut cliquer sur son nom en haut à droite pour modifier son nom affiché et son mot de passe.

Pour un site déjà connecté à une ancienne version du schéma, exécute de nouveau le fichier SQL mis à jour dans l’éditeur Supabase afin d’ajouter le catalogue REECEL, les transactions, les assistants et les règles d’accès.

## Publier sur Vercel

1. Mets le dossier du site dans un dépôt Git (par exemple GitHub), puis dans Vercel choisis **Add New → Project** et importe ce dépôt.
2. Vérifie les réglages Vite : commande de build `npm run build`, dossier de sortie `dist`.
3. Dans **Project → Settings → Environment Variables**, ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` pour Preview et Production.
4. Clique sur **Deploy**. À chaque modification ensuite, pousse un commit : Vercel reconstruira le site. `vercel.json` gère les routes de l’application monopage.

Si le dépôt contient déjà ce dossier comme sous-dossier, définis ce sous-dossier comme **Root Directory** dans la configuration Vercel.

## Comptes et grades

Les utilisateurs peuvent s’inscrire depuis **Connexion → S’inscrire**, puis se connecter avec leur adresse e-mail et leur mot de passe. Chaque nouveau compte démarre comme **Recrue**. Une candidature acceptée devient une ligne du roster comme **Recrue** ; l’inscription avec la même adresse e-mail relie automatiquement le compte à cette ligne. L’inscription est ouverte à toute personne qui connaît l’adresse du site : partage le lien uniquement avec les personnes que tu souhaites autoriser.

Les trois modérateurs ouvrent **Modération → Comptes familiaux et grades** pour choisir un grade dans la liste, désactiver un compte ou le réactiver. Les grades sont aussi affichés dans **Hiérarchie** ; sélectionner une carte montre les profils actifs de ce rang. La page Modération et le Centre de veille sont réservés à El Patrón, Mano Derecha et Mano de Izquierda. Les règles RLS et les fonctions Supabase vérifient aussi les permissions côté base. Les opérations REECEL du panier ajoutent une ligne à `reecel_transactions` et débitent ou créditent `cash_ledger` selon le mode choisi.

## Notes

- Les lignes initiales (caisse, inventaire, membres, activités et candidatures) sont des exemples de démonstration. Une base Supabase neuve commence avec ses propres données.
- Le mode démo utilise les valeurs d’exemple et le stockage local du navigateur. Supabase synchronise `profiles`, `members`, `inventory_items`, `applications`, `cash_ledger`, `sales`, `activities`, `operations` et `drug_requests`.
