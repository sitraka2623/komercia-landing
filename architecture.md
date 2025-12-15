# Architecture Technique – Plateforme PWA Madagascar

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTS (PWA)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Client     │  │  Commerçant  │  │     Admin    │      │
│  │   Mobile     │  │   Dashboard  │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / NGINX                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Backend    │   │  Service IA  │   │   Service    │
│  Spring Boot │   │   Python     │   │  Paiement    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    Redis     │   │   Storage    │   │  Services    │
│    Cache     │   │   (Images)   │   │  Externes    │
└──────────────┘   └──────────────┘   └──────────────┘
                                              │
                        ┌─────────────────────┼─────────────────┐
                        ▼                     ▼                 ▼
                ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
                │  Mobile      │   │   Mapbox/    │   │   Firebase   │
                │   Money      │   │ OpenStreetMap│   │     (FCM)    │
                │   APIs       │   │              │   │              │
                └──────────────┘   └──────────────┘   └──────────────┘
```

## 2. Architecture Frontend (PWA)

### 2.1 Structure ReactJS

```
src/
├── components/
│   ├── common/           # Composants réutilisables
│   ├── client/           # Composants client
│   ├── merchant/         # Composants commerçant
│   └── admin/            # Composants admin
├── pages/
│   ├── client/
│   ├── merchant/
│   └── admin/
├── services/
│   ├── api.service.js    # Appels API
│   ├── auth.service.js   # Authentification
│   ├── cache.service.js  # Gestion cache offline
│   └── geo.service.js    # Géolocalisation
├── store/                # Redux/Context
├── utils/
├── hooks/
├── assets/
├── sw.js                 # Service Worker
└── manifest.json         # PWA Manifest
```

### 2.2 Technologies Frontend

- **Framework** : React 18+
- **Routing** : React Router v6
- **State Management** : Redux Toolkit / Context API
- **UI Library** : Material-UI / Tailwind CSS
- **Maps** : Leaflet.js + React-Leaflet
- **HTTP Client** : Axios
- **PWA** : Workbox
- **Forms** : React Hook Form + Yup
- **Charts** : Recharts / Chart.js

### 2.3 Service Worker (PWA)

```javascript
// Stratégies de cache
- Cache First : Images, CSS, JS statiques
- Network First : API calls, données dynamiques
- Stale While Revalidate : Produits, catalogues
```

## 3. Architecture Backend (Spring Boot)

### 3.1 Structure du projet

```
src/main/java/com/madagascar/ecommerce/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── RedisConfig.java
├── controller/
│   ├── AuthController.java
│   ├── ProductController.java
│   ├── OrderController.java
│   ├── PaymentController.java
│   └── MerchantController.java
├── service/
│   ├── UserService.java
│   ├── ProductService.java
│   ├── OrderService.java
│   ├── PaymentService.java
│   ├── GeoLocationService.java
│   └── AIRecommendationService.java
├── repository/
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   └── OrderRepository.java
├── model/
│   ├── entity/
│   └── dto/
├── security/
│   ├── JwtTokenProvider.java
│   └── JwtAuthenticationFilter.java
├── exception/
└── util/
```

### 3.2 Technologies Backend

- **Framework** : Spring Boot 3.x
- **Security** : Spring Security + JWT
- **Database** : Spring Data JPA
- **Cache** : Redis
- **Validation** : Hibernate Validator
- **Documentation** : Swagger/OpenAPI
- **Logging** : SLF4J + Logback
- **Testing** : JUnit 5 + Mockito

## 4. Base de données PostgreSQL

### 4.1 Schéma principal

```sql
-- Utilisateurs
users (id, email, password, role, created_at, updated_at)
user_profiles (user_id, first_name, last_name, phone, address)

-- Commerçants
merchants (id, user_id, business_name, description, status)
merchant_locations (merchant_id, latitude, longitude, address, city, district)

-- Produits
products (id, merchant_id, name, description, price, stock, category_id)
product_images (id, product_id, image_url, is_primary)
categories (id, name, parent_id)

-- Commandes
orders (id, customer_id, merchant_id, total, status, created_at)
order_items (id, order_id, product_id, quantity, price)
order_tracking (id, order_id, status, timestamp)

-- Paiements
payments (id, order_id, amount, method, transaction_id, status)
payment_logs (id, payment_id, request, response, timestamp)

-- Géolocalisation
delivery_zones (id, merchant_id, polygon_coordinates, max_distance)

-- IA / Analytics
user_behaviors (id, user_id, action, product_id, timestamp)
product_recommendations (id, user_id, product_id, score)
sales_analytics (id, merchant_id, date, revenue, orders_count)
```

### 4.2 Indexes et optimisations

```sql
-- Index pour recherche géographique
CREATE INDEX idx_merchant_location ON merchant_locations 
USING GIST (ST_MakePoint(longitude, latitude));

-- Index pour recherche produits
CREATE INDEX idx_products_search ON products 
USING GIN (to_tsvector('french', name || ' ' || description));

-- Index pour performances
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);
CREATE INDEX idx_products_merchant ON products(merchant_id, status);
```

## 5. Service d'Intelligence Artificielle

### 5.1 Architecture du service IA (Python)

```
ai-service/
├── app/
│   ├── models/
│   │   ├── recommendation.py
│   │   ├── demand_forecast.py
│   │   └── search_ranking.py
│   ├── api/
│   │   └── routes.py
│   ├── utils/
│   └── config.py
├── data/
├── models/              # Modèles entraînés
├── requirements.txt
└── Dockerfile
```

### 5.2 Technologies IA

- **Framework** : FastAPI
- **ML** : TensorFlow / PyTorch
- **Recommandation** : Collaborative Filtering
- **NLP** : spaCy / Transformers
- **Data** : Pandas, NumPy
- **Cache** : Redis

### 5.3 Modèles IA

1. **Recommandation de produits**
   - Collaborative Filtering (User-User, Item-Item)
   - Content-Based Filtering
   - Hybrid Approach

2. **Prévision de demande**
   - Time Series Analysis (ARIMA, LSTM)
   - Détection de tendances

3. **Recherche intelligente**
   - TF-IDF + Word Embeddings
   - Correction orthographique
   - Ranking ML

## 6. Intégration Mobile Money

### 6.1 Architecture de paiement

```
Client → Backend → Payment Service → Mobile Money API
                         ↓
                    Webhook Handler
                         ↓
                    Order Update
```

### 6.2 Flux de paiement

1. Client initie le paiement
2. Backend crée une transaction
3. Appel API Mobile Money (MVola/Orange/Airtel)
4. Attente de confirmation (webhook ou polling)
5. Mise à jour du statut de commande
6. Notification client

### 6.3 Sécurité des paiements

- Tokenisation des données sensibles
- Signature HMAC des requêtes
- Logs complets des transactions
- Retry mechanism avec idempotence
- Timeout et gestion d'erreurs

## 7. Géolocalisation

### 7.1 Stack cartographique

- **Tiles** : OpenStreetMap
- **Rendering** : Leaflet.js
- **Geocoding** : Nominatim / Mapbox
- **Routing** : OSRM (Open Source Routing Machine)

### 7.2 Fonctionnalités géo

- Calcul de distance (Haversine)
- Recherche par rayon
- Clustering de marqueurs
- Zones de livraison (polygones)
- Itinéraires optimisés

## 8. Infrastructure et déploiement

### 8.1 Environnements

- **Development** : Local
- **Staging** : Serveur de test
- **Production** : Cloud (AWS/Azure) ou VPS

### 8.2 Conteneurisation (Docker)

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["80:80"]
  
  backend:
    build: ./backend
    ports: ["8080:8080"]
    depends_on: [postgres, redis]
  
  ai-service:
    build: ./ai-service
    ports: ["8000:8000"]
  
  postgres:
    image: postgres:15
    volumes: [postgres-data:/var/lib/postgresql/data]
  
  redis:
    image: redis:7-alpine
```

### 8.3 CI/CD

- **Version Control** : Git
- **CI/CD** : GitHub Actions / GitLab CI
- **Tests automatisés** : JUnit, Jest
- **Déploiement** : Docker Compose / Kubernetes

## 9. Sécurité

### 9.1 Mesures de sécurité

- HTTPS obligatoire (SSL/TLS)
- JWT avec refresh tokens
- Rate limiting (API)
- CORS configuré
- Input validation
- SQL Injection prevention (JPA)
- XSS protection
- CSRF tokens

### 9.2 Authentification JWT

```
Login → JWT Access Token (15min) + Refresh Token (7 jours)
       → Stockage sécurisé (httpOnly cookies)
       → Renouvellement automatique
```

## 10. Monitoring et logs

- **Logs** : ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring** : Prometheus + Grafana
- **APM** : New Relic / Datadog
- **Alertes** : Email/SMS pour incidents critiques

## 11. Scalabilité

### 11.1 Stratégies

- Load balancing (Nginx)
- Cache Redis pour sessions et données fréquentes
- CDN pour assets statiques
- Database replication (Master-Slave)
- Horizontal scaling (containers)

### 11.2 Performance

- Lazy loading des images
- Pagination des listes
- Compression Gzip
- Minification JS/CSS
- Service Worker caching
