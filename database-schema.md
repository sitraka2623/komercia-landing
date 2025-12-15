# Schéma de Base de Données – Plateforme PWA Madagascar

## 1. Diagramme ERD (Entity Relationship Diagram)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────────▶│user_profiles │         │  merchants  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────┐                              ┌──────────────────┐
│   orders    │◀─────────────────────────────│    products      │
└─────────────┘                              └──────────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────┐                              ┌──────────────────┐
│order_items  │                              │ product_images   │
└─────────────┘                              └──────────────────┘
      │
      ▼
┌─────────────┐
│  payments   │
└─────────────┘
```

## 2. Tables détaillées

### 2.1 Gestion des utilisateurs

#### Table: utilisateurs
```sql
CREATE TABLE utilisateurs (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CLIENT', 'COMMERCANT', 'ADMIN', 'LIVREUR')),
    est_actif BOOLEAN DEFAULT true,
    est_verifie BOOLEAN DEFAULT false,
    jeton_verification VARCHAR(255),
    jeton_reinitialisation VARCHAR(255),
    expiration_jeton_reinitialisation TIMESTAMP,
    derniere_connexion TIMESTAMP,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);
```

#### Table: profils_utilisateurs
```sql
CREATE TABLE profils_utilisateurs (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    prenom VARCHAR(100),
    nom VARCHAR(100),
    telephone VARCHAR(20),
    url_avatar VARCHAR(500),
    adresse TEXT,
    ville VARCHAR(100),
    quartier VARCHAR(100),
    code_postal VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profils_utilisateurs_utilisateur ON profils_utilisateurs(utilisateur_id);
```

### 2.2 Gestion des commerçants

#### Table: commercants
```sql
CREATE TABLE commercants (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT UNIQUE NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    nom_entreprise VARCHAR(255) NOT NULL,
    description TEXT,
    url_logo VARCHAR(500),
    url_banniere VARCHAR(500),
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'APPROUVE', 'SUSPENDU', 'REJETE')),
    note DECIMAL(3, 2) DEFAULT 0.00,
    total_avis INT DEFAULT 0,
    telephone VARCHAR(20),
    email VARCHAR(255),
    site_web VARCHAR(255),
    numero_fiscal VARCHAR(100),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commercants_utilisateur ON commercants(utilisateur_id);
CREATE INDEX idx_commercants_statut ON commercants(statut);
```

#### Table: emplacements_commercants
```sql
CREATE TABLE emplacements_commercants (
    id BIGSERIAL PRIMARY KEY,
    commercant_id BIGINT NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
    adresse TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL,
    quartier VARCHAR(100),
    code_postal VARCHAR(20),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    est_principal BOOLEAN DEFAULT true,
    horaires_ouverture JSONB,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emplacements_commercants_commercant ON emplacements_commercants(commercant_id);
CREATE INDEX idx_emplacements_commercants_geo ON emplacements_commercants USING GIST (
    ST_MakePoint(longitude, latitude)::geography
);
```

#### Table: horaires_commercants
```sql
CREATE TABLE horaires_commercants (
    id BIGSERIAL PRIMARY KEY,
    commercant_id BIGINT NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
    jour_semaine INT NOT NULL CHECK (jour_semaine BETWEEN 0 AND 6),
    heure_ouverture TIME,
    heure_fermeture TIME,
    est_ferme BOOLEAN DEFAULT false
);
```

### 2.3 Gestion des produits

#### Table: categories
```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    url_icone VARCHAR(500),
    ordre_affichage INT DEFAULT 0,
    est_actif BOOLEAN DEFAULT true,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

#### Table: produits
```sql
CREATE TABLE produits (
    id BIGSERIAL PRIMARY KEY,
    commercant_id BIGINT NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
    categorie_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    nom VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    prix_compare DECIMAL(10, 2),
    prix_cout DECIMAL(10, 2),
    sku VARCHAR(100),
    code_barre VARCHAR(100),
    quantite_stock INT DEFAULT 0,
    seuil_stock_bas INT DEFAULT 10,
    poids DECIMAL(8, 2),
    dimensions JSONB,
    statut VARCHAR(50) DEFAULT 'BROUILLON' CHECK (statut IN ('BROUILLON', 'ACTIF', 'INACTIF', 'RUPTURE_STOCK')),
    est_vedette BOOLEAN DEFAULT false,
    nombre_vues INT DEFAULT 0,
    nombre_ventes INT DEFAULT 0,
    note DECIMAL(3, 2) DEFAULT 0.00,
    nombre_avis INT DEFAULT 0,
    meta_titre VARCHAR(255),
    meta_description TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_produits_commercant ON produits(commercant_id);
CREATE INDEX idx_produits_categorie ON produits(categorie_id);
CREATE INDEX idx_produits_statut ON produits(statut);
CREATE INDEX idx_produits_slug ON produits(slug);
CREATE INDEX idx_produits_recherche ON produits USING GIN (
    to_tsvector('french', nom || ' ' || COALESCE(description, ''))
);
```

#### Table: images_produits
```sql
CREATE TABLE images_produits (
    id BIGSERIAL PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    url_image VARCHAR(500) NOT NULL,
    url_miniature VARCHAR(500),
    texte_alternatif VARCHAR(255),
    ordre_affichage INT DEFAULT 0,
    est_principal BOOLEAN DEFAULT false,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_produits_produit ON images_produits(produit_id);
```

#### Table: variantes_produits
```sql
CREATE TABLE variantes_produits (
    id BIGSERIAL PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    sku VARCHAR(100),
    prix DECIMAL(10, 2),
    quantite_stock INT DEFAULT 0,
    attributs JSONB,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 Gestion des commandes

#### Table: commandes
```sql
CREATE TABLE commandes (
    id BIGSERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    client_id BIGINT NOT NULL REFERENCES utilisateurs(id),
    commercant_id BIGINT NOT NULL REFERENCES commercants(id),
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE' CHECK (statut IN (
        'EN_ATTENTE', 'CONFIRME', 'EN_TRAITEMENT', 'PRET', 'EXPEDIE', 
        'LIVRE', 'ANNULE', 'REMBOURSE'
    )),
    sous_total DECIMAL(10, 2) NOT NULL,
    taxe DECIMAL(10, 2) DEFAULT 0.00,
    frais_livraison DECIMAL(10, 2) DEFAULT 0.00,
    remise DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'MGA',
    notes TEXT,
    adresse_livraison JSONB,
    adresse_facturation JSONB,
    methode_livraison VARCHAR(50),
    livraison_estimee TIMESTAMP,
    livre_le TIMESTAMP,
    annule_le TIMESTAMP,
    raison_annulation TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commandes_client ON commandes(client_id, cree_le DESC);
CREATE INDEX idx_commandes_commercant ON commandes(commercant_id, cree_le DESC);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_commandes_numero ON commandes(numero_commande);
```

#### Table: articles_commandes
```sql
CREATE TABLE articles_commandes (
    id BIGSERIAL PRIMARY KEY,
    commande_id BIGINT NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
    produit_id BIGINT REFERENCES produits(id) ON DELETE SET NULL,
    variante_produit_id BIGINT REFERENCES variantes_produits(id) ON DELETE SET NULL,
    nom_produit VARCHAR(255) NOT NULL,
    sku_produit VARCHAR(100),
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    prix_total DECIMAL(10, 2) NOT NULL,
    instantane_produit JSONB,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_commandes_commande ON articles_commandes(commande_id);
CREATE INDEX idx_articles_commandes_produit ON articles_commandes(produit_id);
```

#### Table: suivi_commandes
```sql
CREATE TABLE suivi_commandes (
    id BIGSERIAL PRIMARY KEY,
    commande_id BIGINT NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
    statut VARCHAR(50) NOT NULL,
    notes TEXT,
    emplacement VARCHAR(255),
    cree_par BIGINT REFERENCES utilisateurs(id),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suivi_commandes_commande ON suivi_commandes(commande_id, cree_le DESC);
```

### 2.5 Gestion des paiements

#### Table: paiements
```sql
CREATE TABLE paiements (
    id BIGSERIAL PRIMARY KEY,
    commande_id BIGINT NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
    methode_paiement VARCHAR(50) NOT NULL CHECK (methode_paiement IN (
        'MVOLA', 'ORANGE_MONEY', 'AIRTEL_MONEY', 'ESPECES', 'VIREMENT_BANCAIRE'
    )),
    montant DECIMAL(10, 2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'MGA',
    statut VARCHAR(50) DEFAULT 'EN_ATTENTE' CHECK (statut IN (
        'EN_ATTENTE', 'EN_TRAITEMENT', 'COMPLETE', 'ECHOUE', 'REMBOURSE', 'ANNULE'
    )),
    id_transaction VARCHAR(255),
    reference_externe VARCHAR(255),
    numero_telephone VARCHAR(20),
    nom_payeur VARCHAR(255),
    date_paiement TIMESTAMP,
    raison_echec TEXT,
    metadonnees JSONB,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paiements_commande ON paiements(commande_id);
CREATE INDEX idx_paiements_statut ON paiements(statut);
CREATE INDEX idx_paiements_transaction ON paiements(id_transaction);
```

#### Table: journaux_paiements
```sql
CREATE TABLE journaux_paiements (
    id BIGSERIAL PRIMARY KEY,
    paiement_id BIGINT NOT NULL REFERENCES paiements(id) ON DELETE CASCADE,
    type_evenement VARCHAR(50) NOT NULL,
    charge_requete JSONB,
    charge_reponse JSONB,
    code_statut INT,
    message_erreur TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journaux_paiements_paiement ON journaux_paiements(paiement_id, cree_le DESC);
```

### 2.6 Avis et évaluations

#### Table: avis
```sql
CREATE TABLE avis (
    id BIGSERIAL PRIMARY KEY,
    produit_id BIGINT REFERENCES produits(id) ON DELETE CASCADE,
    commercant_id BIGINT REFERENCES commercants(id) ON DELETE CASCADE,
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    commande_id BIGINT REFERENCES commandes(id) ON DELETE SET NULL,
    note INT NOT NULL CHECK (note BETWEEN 1 AND 5),
    titre VARCHAR(255),
    commentaire TEXT,
    est_achat_verifie BOOLEAN DEFAULT false,
    est_approuve BOOLEAN DEFAULT false,
    nombre_utile INT DEFAULT 0,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_cible_avis CHECK (
        (produit_id IS NOT NULL AND commercant_id IS NULL) OR
        (produit_id IS NULL AND commercant_id IS NOT NULL)
    )
);

CREATE INDEX idx_avis_produit ON avis(produit_id);
CREATE INDEX idx_avis_commercant ON avis(commercant_id);
CREATE INDEX idx_avis_utilisateur ON avis(utilisateur_id);
```

### 2.7 Géolocalisation et livraison

#### Table: zones_livraison
```sql
CREATE TABLE zones_livraison (
    id BIGSERIAL PRIMARY KEY,
    commercant_id BIGINT NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    coordonnees_polygone JSONB,
    distance_max_km DECIMAL(8, 2),
    frais_livraison DECIMAL(10, 2) NOT NULL,
    montant_commande_min DECIMAL(10, 2) DEFAULT 0.00,
    temps_estime_minutes INT,
    est_actif BOOLEAN DEFAULT true,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zones_livraison_commercant ON zones_livraison(commercant_id);
```

### 2.8 Intelligence Artificielle et Analytics

#### Table: comportements_utilisateurs
```sql
CREATE TABLE comportements_utilisateurs (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    type_action VARCHAR(50) NOT NULL CHECK (type_action IN (
        'VOIR', 'RECHERCHER', 'AJOUTER_PANIER', 'RETIRER_PANIER', 
        'ACHETER', 'EVALUER', 'FAVORI'
    )),
    produit_id BIGINT REFERENCES produits(id) ON DELETE SET NULL,
    commercant_id BIGINT REFERENCES commercants(id) ON DELETE SET NULL,
    requete_recherche VARCHAR(255),
    metadonnees JSONB,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comportements_utilisateurs_utilisateur ON comportements_utilisateurs(utilisateur_id, cree_le DESC);
CREATE INDEX idx_comportements_utilisateurs_produit ON comportements_utilisateurs(produit_id);
CREATE INDEX idx_comportements_utilisateurs_action ON comportements_utilisateurs(type_action, cree_le DESC);
```

#### Table: recommandations_produits
```sql
CREATE TABLE recommandations_produits (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    produit_id BIGINT NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    score DECIMAL(5, 4) NOT NULL,
    type_recommandation VARCHAR(50) CHECK (type_recommandation IN (
        'COLLABORATIF', 'BASE_CONTENU', 'TENDANCE', 'PERSONNALISE'
    )),
    genere_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_le TIMESTAMP
);

CREATE INDEX idx_recommandations_utilisateur ON recommandations_produits(utilisateur_id, score DESC);
CREATE INDEX idx_recommandations_produit ON recommandations_produits(produit_id);
```

#### Table: analytiques_ventes
```sql
CREATE TABLE analytiques_ventes (
    id BIGSERIAL PRIMARY KEY,
    commercant_id BIGINT NOT NULL REFERENCES commercants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    revenu_total DECIMAL(12, 2) DEFAULT 0.00,
    total_commandes INT DEFAULT 0,
    total_articles_vendus INT DEFAULT 0,
    valeur_commande_moyenne DECIMAL(10, 2) DEFAULT 0.00,
    nouveaux_clients INT DEFAULT 0,
    clients_recurrents INT DEFAULT 0,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(commercant_id, date)
);

CREATE INDEX idx_analytiques_ventes_commercant ON analytiques_ventes(commercant_id, date DESC);
```

#### Table: analytiques_produits
```sql
CREATE TABLE analytiques_produits (
    id BIGSERIAL PRIMARY KEY,
    produit_id BIGINT NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    vues INT DEFAULT 0,
    ajouts_panier INT DEFAULT 0,
    achats INT DEFAULT 0,
    revenu DECIMAL(10, 2) DEFAULT 0.00,
    taux_conversion DECIMAL(5, 4),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(produit_id, date)
);

CREATE INDEX idx_analytiques_produits_produit ON analytiques_produits(produit_id, date DESC);
```

### 2.9 Notifications

#### Table: notifications
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    donnees JSONB,
    est_lu BOOLEAN DEFAULT false,
    lu_le TIMESTAMP,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_utilisateur ON notifications(utilisateur_id, cree_le DESC);
CREATE INDEX idx_notifications_non_lues ON notifications(utilisateur_id, est_lu) WHERE est_lu = false;
```

#### Table: abonnements_push
```sql
CREATE TABLE abonnements_push (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    point_terminaison TEXT NOT NULL,
    cle_p256dh TEXT NOT NULL,
    cle_auth TEXT NOT NULL,
    agent_utilisateur TEXT,
    est_actif BOOLEAN DEFAULT true,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_abonnements_push_utilisateur ON abonnements_push(utilisateur_id);
```

### 2.10 Configuration et système

#### Table: parametres_systeme
```sql
CREATE TABLE parametres_systeme (
    id BIGSERIAL PRIMARY KEY,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: journaux_audit
```sql
CREATE TABLE journaux_audit (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT REFERENCES utilisateurs(id),
    action VARCHAR(100) NOT NULL,
    type_entite VARCHAR(50),
    entite_id BIGINT,
    anciennes_valeurs JSONB,
    nouvelles_valeurs JSONB,
    adresse_ip VARCHAR(45),
    agent_utilisateur TEXT,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journaux_audit_utilisateur ON journaux_audit(utilisateur_id, cree_le DESC);
CREATE INDEX idx_journaux_audit_entite ON journaux_audit(type_entite, entite_id);
```

## 3. Vues matérialisées pour performances

### Vue: statistiques_commercants
```sql
CREATE MATERIALIZED VIEW statistiques_commercants AS
SELECT 
    c.id as commercant_id,
    c.nom_entreprise,
    COUNT(DISTINCT p.id) as total_produits,
    COUNT(DISTINCT cmd.id) as total_commandes,
    COALESCE(SUM(cmd.total), 0) as revenu_total,
    COALESCE(AVG(a.note), 0) as note_moyenne,
    COUNT(DISTINCT a.id) as total_avis
FROM commercants c
LEFT JOIN produits p ON c.id = p.commercant_id
LEFT JOIN commandes cmd ON c.id = cmd.commercant_id AND cmd.statut = 'LIVRE'
LEFT JOIN avis a ON c.id = a.commercant_id
GROUP BY c.id, c.nom_entreprise;

CREATE UNIQUE INDEX idx_statistiques_commercants_id ON statistiques_commercants(commercant_id);
```

## 4. Triggers et fonctions

### Trigger: Mise à jour automatique du timestamp
```sql
CREATE OR REPLACE FUNCTION maj_modifie_le()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modifie_le = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer à toutes les tables avec modifie_le
CREATE TRIGGER maj_utilisateurs_modifie_le BEFORE UPDATE ON utilisateurs
    FOR EACH ROW EXECUTE FUNCTION maj_modifie_le();
```

### Trigger: Mise à jour du stock après commande
```sql
CREATE OR REPLACE FUNCTION maj_stock_produit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE produits 
        SET quantite_stock = quantite_stock - NEW.quantite,
            nombre_ventes = nombre_ventes + NEW.quantite
        WHERE id = NEW.produit_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maj_stock AFTER INSERT ON articles_commandes
    FOR EACH ROW EXECUTE FUNCTION maj_stock_produit();
```
