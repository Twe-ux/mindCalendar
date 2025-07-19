# MindMap Calendar

Application web complète combinant une mind map interactive et un système de calendrier synchronisé avec Google Calendar, permettant de transformer des idées en tâches planifiées.

## 🚀 Fonctionnalités

### Mind Map Interactive
- Interface de création de nœuds (idées/tâches)
- Connexions entre les nœuds
- Catégorisation par couleurs et priorités
- Édition inline des nœuds
- Métadonnées pour chaque nœud (période d'exécution, priorité, tags)
- Zoom et pan
- Sauvegarde automatique

### Système de Calendrier
- Vue mensuelle, hebdomadaire, journalière
- Synchronisation bidirectionnelle avec Google Calendar
- Affichage des tâches issues de la mind map
- Drag & drop des tâches vers le calendrier
- Gestion des conflits de planification

### Intégration Mind Map ↔ Calendrier
- Panneau latéral avec tâches non planifiées
- Système de drag & drop intuitif
- Mise à jour en temps réel
- Notifications pour les deadlines

## 🛠️ Stack Technique

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: API Routes Next.js, MongoDB avec Mongoose
- **Authentication**: NextAuth.js avec Google Provider
- **Mind Map**: @xyflow/react (React Flow)
- **Calendrier**: React Big Calendar
- **Google Integration**: Google Calendar API
- **Drag & Drop**: @dnd-kit

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
```

### Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Calendar
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URIs de redirection autorisées :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.com/api/auth/callback/google` (production)

### Configuration MongoDB

Vous pouvez utiliser :
- [MongoDB Atlas](https://www.mongodb.com/atlas) (recommandé pour la production)
- Une instance MongoDB locale

## 🚀 Installation et Démarrage

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
```bash
# Éditer .env.local avec vos valeurs
```

3. **Démarrer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
mindmap-calendar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── mindmap/
│   │   │   ├── calendar/
│   │   │   └── google-sync/
│   │   ├── dashboard/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── MindMap/
│   │   ├── Calendar/
│   │   ├── TaskPanel/
│   │   └── AuthProvider.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── mongodb.ts
│   │   ├── google-calendar.ts
│   │   └── types.ts
│   └── models/
│       ├── MindMapNode.ts
│       └── CalendarEvent.ts
├── .env.local
├── package.json
└── README.md
```

## 🔗 API Endpoints

### Mind Map API
- `GET /api/mindmap` - Récupérer la mind map utilisateur
- `POST /api/mindmap` - Créer un nœud

### Calendar API
- `GET /api/calendar` - Récupérer les événements
- `POST /api/calendar` - Créer un événement

### Google Sync API
- `GET /api/google-sync?action=import` - Importer depuis Google Calendar
- `POST /api/google-sync` - Exporter vers Google Calendar

## 🎯 Utilisation

1. **Connexion** : Connectez-vous avec votre compte Google
2. **Mind Map** : Créez des nœuds d'idées dans la mind map
3. **Planification** : Glissez-déposez les tâches vers le calendrier
4. **Synchronisation** : Synchronisez avec Google Calendar
5. **Gestion** : Suivez vos tâches dans le panneau latéral

## 🔧 Développement

### Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
```

### Technologies utilisées

- **React 19** avec Server Components
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **React Flow** pour la mind map interactive
- **React Big Calendar** pour l'interface calendrier
- **NextAuth.js** pour l'authentification
- **Mongoose** pour MongoDB
- **@dnd-kit** pour le drag and drop

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.
