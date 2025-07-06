# 🏦 Banque Online - Application Bancaire Digitale

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Express](https://img.shields.io/badge/express-4.18.0-green.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue.svg)

Une application bancaire moderne et sécurisée développée avec React.js et Node.js, offrant une expérience utilisateur complète pour la gestion de comptes bancaires.

## 📋 Table des Matières

- [🚀 Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies Utilisées](#️-technologies-utilisées)
- [📁 Structure du Projet](#-structure-du-projet)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [🏃‍♂️ Démarrage](#️-démarrage)
- [👥 Interfaces Utilisateur](#-interfaces-utilisateur)
- [🔐 Sécurité](#-sécurité)
- [📱 Responsive Design](#-responsive-design)
- [🎨 Thèmes](#-thèmes)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## 🚀 Fonctionnalités

### 👤 Espace Client
- ✅ **Authentification sécurisée** (connexion/inscription)
- ✅ **Tableau de bord interactif** avec vue d'ensemble des comptes
- ✅ **Gestion des comptes bancaires** (création, consultation, fermeture)
- ✅ **Historique des transactions** en temps réel
- ✅ **Virements bancaires** entre comptes ou vers d'autres clients
- ✅ **Rechargement de compte** via Stripe
- ✅ **Gestion du profil utilisateur**
- ✅ **Notifications en temps réel**

### 🔧 Espace Administrateur
- ✅ **Dashboard administrateur** avec statistiques avancées
- ✅ **Gestion des utilisateurs** (création, modification, suppression)
- ✅ **Gestion des comptes bancaires**
- ✅ **Supervision des transactions**
- ✅ **Rapports et analyses**
- ✅ **Paramètres système**

### 🎨 Interface Moderne
- ✅ **Design responsive** (mobile, tablette, desktop)
- ✅ **Mode sombre/clair** avec transition fluide
- ✅ **Animations et micro-interactions**
- ✅ **Interface glassmorphisme**
- ✅ **Composants réutilisables**

## 🛠️ Technologies Utilisées

### Frontend
- **React.js 18.2.0** - Framework JavaScript
- **Tailwind CSS 3.3.0** - Framework CSS utilitaire
- **React Router Dom** - Navigation SPA
- **Axios** - Client HTTP
- **React Context** - Gestion d'état
- **Stripe Elements** - Intégration paiement

### Backend
- **Node.js** - Environnement d'exécution JavaScript
- **Express.js 4.18.0** - Framework web
- **Sequelize** - ORM pour base de données
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe
- **Stripe** - Traitement des paiements

### Outils de Développement
- **Git** - Contrôle de version
- **npm** - Gestionnaire de paquets
- **ESLint** - Linter JavaScript
- **Prettier** - Formatage de code

## 📁 Structure du Projet

```
Banque/
├── 📁 backend-banque/
│   ├── 📁 config/
│   │   └── db.js                 # Configuration base de données
│   ├── 📁 controllers/
│   │   ├── authController.js     # Authentification
│   │   ├── clientController.js   # Gestion clients
│   │   ├── compteController.js   # Gestion comptes
│   │   └── ...
│   ├── 📁 middleware/
│   │   └── verifyToken.js        # Vérification JWT
│   ├── 📁 models/
│   │   ├── Client.js             # Modèle Client
│   │   ├── Compte.js             # Modèle Compte
│   │   └── ...
│   ├── 📁 routes/
│   │   ├── authRoutes.js         # Routes authentification
│   │   ├── clientRoutes.js       # Routes client
│   │   └── ...
│   ├── package.json
│   └── index.js                  # Point d'entrée serveur
├── 📁 frontend-banque/
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   └── ClientLayout.js
│   │   │   └── RegisterForms.js
│   │   ├── 📁 contexts/
│   │   │   ├── ThemeContext.js   # Gestion thème
│   │   │   └── AdminThemeContext.js
│   │   ├── 📁 pages/
│   │   │   ├── 📁 frontoffice/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── MesComptes.js
│   │   │   │   ├── login.js
│   │   │   │   └── ...
│   │   │   └── 📁 backoffice/
│   │   │       ├── DashboardAdmin.js
│   │   │       └── ...
│   │   ├── 📁 services/
│   │   │   └── stripeService.js
│   │   ├── 📁 styles/
│   │   │   └── interactive.css   # Styles personnalisés
│   │   ├── 📁 utils/
│   │   │   └── api.js            # Configuration API
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js        # Configuration Tailwind
├── data.sql                      # Données de test
├── script.sql                    # Structure base de données
└── README.md
```

## ⚙️ Installation

### Prérequis
- **Node.js** (version 14 ou supérieure)
- **npm** ou **yarn**
- **PostgreSQL ** (version 15 ou supérieure)
- **Git**

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/banque-online.git
cd banque-online
```

### 2. Installation du Backend
```bash
cd backend-banque
npm install
```

### 3. Installation du Frontend
```bash
cd ../frontend-banque
npm install
```

## 🔧 Configuration

### 1. Base de Données
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE banque_db;
exit

# Importer la structure
mysql -u root -p banque_db < script.sql

# Importer les données de test (optionnel)
mysql -u root -p banque_db < data.sql
```





## 🏃‍♂️ Démarrage

### 1. Démarrer le Backend
```bash
cd backend-banque
npm start
# Le serveur démarre sur http://localhost:3001
```

### 2. Démarrer le Frontend
```bash
cd frontend-banque
npm start
# L'application démarre sur http://localhost:3000
```



## 👥 Interfaces Utilisateur

### 🎯 Interface Client

#### Dashboard
- Vue d'ensemble des comptes
- Soldes en temps réel
- Dernières transactions
- Statistiques personnelles

#### Gestion des Comptes
- Création de nouveaux comptes
- Consultation des détails
- Rechargement via Stripe
- Historique complet

#### Virements
- Virement interne (entre ses comptes)
- Virement externe (vers d'autres clients)
- Validation sécurisée
- Confirmation par email

### 🛠️ Interface Administrateur

#### Dashboard Admin
- Statistiques globales
- Graphiques interactifs
- Monitoring en temps réel
- Indicateurs de performance

#### Gestion Utilisateurs
- Liste des clients
- Création/modification/suppression
- Gestion des statuts
- Historique des actions

## 🔐 Sécurité

### Authentification
- **JWT Tokens** pour les sessions
- **Hachage bcrypt** pour les mots de passe
- **Expiration automatique** des tokens
- **Refresh tokens** pour la sécurité

### Protection API
- **CORS** configuré
- **Rate limiting** pour prévenir les attaques
- **Validation des données** côté serveur
- **Middleware de sécurité**

### Données Sensibles
- **Chiffrement** des données sensibles
- **Audit trail** des transactions
- **Logs sécurisés**
- **Backup automatique**

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 **Mobile** (320px - 768px)
- 📟 **Tablette** (768px - 1024px)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1440px+)

### Fonctionnalités Mobiles
- Navigation hamburger
- Gestures touch
- Optimisation des performances
- Interface tactile optimisée

## 🎨 Thèmes

### Mode Clair
- Interface moderne et épurée
- Couleurs contrastées pour la lisibilité
- Inspiration design bancaire professionnel

### Mode Sombre
- Réduction de la fatigue oculaire
- Économie d'énergie sur OLED
- Design moderne et élégant

### Personnalisation
- Transition fluide entre thèmes
- Mémorisation des préférences
- Animation des changements



## 📚 Documentation API

### Endpoints Principaux

#### Authentification
- `POST /auth/register` - Inscription client
- `POST /auth/login` - Connexion
- `GET /auth/profile-client` - Profil utilisateur
- `POST /auth/logout` - Déconnexion

#### Comptes
- `GET /comptes/mes-comptes` - Liste des comptes
- `POST /comptes/creer` - Créer un compte
- `GET /comptes/:id` - Détails d'un compte
- `DELETE /comptes/:id` - Fermer un compte

#### Transactions
- `GET /transactions` - Historique des transactions
- `POST /transactions/depot` - Effectuer un dépôt
- `POST /transactions/retrait` - Effectuer un retrait

#### Virements
- `POST /virements/interne` - Virement interne
- `POST /virements/externe` - Virement externe
- `GET /virements/historique` - Historique des virements




## 🙏 Remerciements

- [React.js](https://reactjs.org/) - Framework JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Stripe](https://stripe.com/) - Solution de paiement
- [Font Awesome](https://fontawesome.com/) - Icônes
- [Unsplash](https://unsplash.com/) - Images de stock

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <h3>🏦 Banque Online - L'avenir de la banque digitale</h3>
  <p>Développé avec ❤️ par l'équipe Banque Online</p>
  
  ![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb.svg)
  ![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933.svg)
  ![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)
</div>
