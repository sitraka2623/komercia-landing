# Documentation API REST – Plateforme PWA Madagascar

## 1. Informations générales

**Base URL**: `https://api.madagascar-ecommerce.com/v1`

**Format**: JSON

**Authentification**: JWT Bearer Token

**Headers requis**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

## 2. Authentification

### 2.1 Inscription
```http
POST /auth/register
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "CLIENT",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+261340000000"
}
```

**Response 201**:
```json
{
  "success": true,
  "message": "Inscription réussie. Vérifiez votre email.",
  "data": {
    "userId": 1,
    "email": "user@example.com"
  }
}
```

### 2.2 Connexion
```http
POST /auth/login
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "CLIENT",
      "profile": {
        "firstName": "Jean",
        "lastName": "Dupont"
      }
    }
  }
}
```

### 2.3 Rafraîchir le token
```http
POST /auth/refresh
```

**Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 3. Produits

### 3.1 Liste des produits
```http
GET /products?page=1&limit=20&category=electronics&minPrice=1000&maxPrice=50000&sort=price_asc
```

**Query Parameters**:
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20, max: 100)
- `category`: Slug de catégorie
- `merchantId`: ID du commerçant
- `search`: Recherche textuelle
- `minPrice`, `maxPrice`: Filtres de prix
- `sort`: `price_asc`, `price_desc`, `newest`, `popular`, `rating`
- `latitude`, `longitude`, `radius`: Recherche géographique (radius en km)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Smartphone XYZ",
        "slug": "smartphone-xyz",
        "description": "Description du produit",
        "price": 25000,
        "compareAtPrice": 30000,
        "images": [
          {
            "url": "https://cdn.example.com/image1.jpg",
            "thumbnail": "https://cdn.example.com/thumb1.jpg",
            "isPrimary": true
          }
        ],
        "category": {
          "id": 5,
          "name": "Électronique"
        },
        "merchant": {
          "id": 10,
          "businessName": "Tech Store",
          "rating": 4.5,
          "location": {
            "city": "Antananarivo",
            "district": "Analakely"
          }
        },
        "stock": 15,
        "rating": 4.7,
        "reviewsCount": 23,
        "distance": 2.5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20
    }
  }
}
```

### 3.2 Détails d'un produit
```http
GET /products/{id}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Smartphone XYZ",
    "description": "Description complète...",
    "price": 25000,
    "stock": 15,
    "sku": "PHONE-XYZ-001",
    "images": [...],
    "variants": [
      {
        "id": 1,
        "name": "Noir - 64GB",
        "price": 25000,
        "stock": 10,
        "attributes": {
          "color": "Noir",
          "storage": "64GB"
        }
      }
    ],
    "merchant": {...},
    "category": {...},
    "reviews": [...],
    "relatedProducts": [...]
  }
}
```

### 3.3 Créer un produit (Commerçant)
```http
POST /products
Authorization: Bearer {merchant_token}
```

**Body**:
```json
{
  "name": "Nouveau produit",
  "description": "Description",
  "price": 15000,
  "categoryId": 5,
  "stock": 50,
  "sku": "PROD-001",
  "images": [
    "https://cdn.example.com/image1.jpg"
  ]
}
```

### 3.4 Mettre à jour un produit
```http
PUT /products/{id}
Authorization: Bearer {merchant_token}
```

### 3.5 Supprimer un produit
```http
DELETE /products/{id}
Authorization: Bearer {merchant_token}
```

## 4. Panier

### 4.1 Obtenir le panier
```http
GET /cart
Authorization: Bearer {token}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 10,
          "name": "Produit A",
          "price": 5000,
          "image": "..."
        },
        "quantity": 2,
        "subtotal": 10000
      }
    ],
    "summary": {
      "subtotal": 10000,
      "tax": 0,
      "shippingFee": 1000,
      "discount": 0,
      "total": 11000
    }
  }
}
```

### 4.2 Ajouter au panier
```http
POST /cart/items
Authorization: Bearer {token}
```

**Body**:
```json
{
  "productId": 10,
  "variantId": 1,
  "quantity": 2
}
```

### 4.3 Mettre à jour la quantité
```http
PUT /cart/items/{itemId}
Authorization: Bearer {token}
```

**Body**:
```json
{
  "quantity": 3
}
```

### 4.4 Supprimer du panier
```http
DELETE /cart/items/{itemId}
Authorization: Bearer {token}
```

## 5. Commandes

### 5.1 Créer une commande
```http
POST /orders
Authorization: Bearer {token}
```

**Body**:
```json
{
  "items": [
    {
      "productId": 10,
      "variantId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+261340000000",
    "address": "Lot II A 123",
    "city": "Antananarivo",
    "district": "Analakely",
    "postalCode": "101"
  },
  "deliveryMethod": "HOME_DELIVERY",
  "paymentMethod": "MVOLA",
  "notes": "Livraison après 18h"
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "orderId": 100,
    "orderNumber": "ORD-2025-100",
    "total": 11000,
    "status": "PENDING",
    "paymentUrl": "https://payment.mvola.mg/pay/abc123"
  }
}
```

### 5.2 Liste des commandes
```http
GET /orders?status=PENDING&page=1&limit=20
Authorization: Bearer {token}
```

### 5.3 Détails d'une commande
```http
GET /orders/{id}
Authorization: Bearer {token}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "orderNumber": "ORD-2025-100",
    "status": "PROCESSING",
    "customer": {...},
    "merchant": {...},
    "items": [...],
    "shippingAddress": {...},
    "payment": {
      "method": "MVOLA",
      "status": "COMPLETED",
      "amount": 11000,
      "transactionId": "MVL123456"
    },
    "tracking": [
      {
        "status": "PENDING",
        "timestamp": "2025-12-15T10:00:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2025-12-15T10:30:00Z"
      }
    ],
    "createdAt": "2025-12-15T10:00:00Z"
  }
}
```

### 5.4 Mettre à jour le statut (Commerçant)
```http
PATCH /orders/{id}/status
Authorization: Bearer {merchant_token}
```

**Body**:
```json
{
  "status": "PROCESSING",
  "notes": "Commande en préparation"
}
```

### 5.5 Annuler une commande
```http
POST /orders/{id}/cancel
Authorization: Bearer {token}
```

**Body**:
```json
{
  "reason": "Changement d'avis"
}
```

## 6. Paiements

### 6.1 Initier un paiement Mobile Money
```http
POST /payments/mobile-money/initiate
Authorization: Bearer {token}
```

**Body**:
```json
{
  "orderId": 100,
  "method": "MVOLA",
  "phoneNumber": "+261340000000",
  "amount": 11000
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "paymentId": 50,
    "transactionId": "MVL123456",
    "status": "PENDING",
    "message": "Composez *111# pour confirmer le paiement"
  }
}
```

### 6.2 Vérifier le statut du paiement
```http
GET /payments/{paymentId}/status
Authorization: Bearer {token}
```

### 6.3 Webhook Mobile Money (Callback)
```http
POST /payments/webhooks/mobile-money
```

**Body** (exemple MVola):
```json
{
  "transactionId": "MVL123456",
  "status": "SUCCESS",
  "amount": 11000,
  "phoneNumber": "+261340000000",
  "timestamp": "2025-12-15T10:35:00Z",
  "signature": "abc123def456"
}
```

## 7. Géolocalisation

### 7.1 Rechercher des commerces à proximité
```http
GET /merchants/nearby?latitude=-18.8792&longitude=47.5079&radius=5
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "merchants": [
      {
        "id": 10,
        "businessName": "Tech Store",
        "location": {
          "latitude": -18.8800,
          "longitude": 47.5100,
          "address": "Analakely, Antananarivo",
          "distance": 1.2
        },
        "rating": 4.5,
        "isOpen": true,
        "openingHours": {...}
      }
    ]
  }
}
```

### 7.2 Calculer l'itinéraire
```http
GET /geo/route?fromLat=-18.8792&fromLng=47.5079&toLat=-18.8800&toLng=47.5100
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "distance": 1.2,
    "duration": 5,
    "route": {
      "type": "LineString",
      "coordinates": [
        [47.5079, -18.8792],
        [47.5100, -18.8800]
      ]
    }
  }
}
```

### 7.3 Géocodage (Adresse → Coordonnées)
```http
GET /geo/geocode?address=Analakely,Antananarivo
```

### 7.4 Géocodage inverse (Coordonnées → Adresse)
```http
GET /geo/reverse?latitude=-18.8792&longitude=47.5079
```

## 8. Intelligence Artificielle

### 8.1 Recommandations personnalisées
```http
GET /ai/recommendations
Authorization: Bearer {token}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "product": {...},
        "score": 0.95,
        "reason": "Basé sur vos achats précédents"
      }
    ]
  }
}
```

### 8.2 Recherche intelligente
```http
GET /ai/search?q=telephon&autocorrect=true
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "correctedQuery": "téléphone",
    "suggestions": ["téléphone", "téléphone portable", "téléphone fixe"],
    "products": [...]
  }
}
```

### 8.3 Analyse de ventes (Commerçant)
```http
GET /ai/analytics/sales?period=30days
Authorization: Bearer {merchant_token}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "trends": {
      "revenue": {
        "current": 500000,
        "previous": 450000,
        "growth": 11.1
      }
    },
    "topProducts": [...],
    "predictions": {
      "nextWeekSales": 125000,
      "stockAlerts": [...]
    }
  }
}
```

## 9. Commerçants

### 9.1 Profil du commerçant
```http
GET /merchants/{id}
```

### 9.2 Créer un compte commerçant
```http
POST /merchants
Authorization: Bearer {token}
```

**Body**:
```json
{
  "businessName": "Ma Boutique",
  "description": "Description de la boutique",
  "phone": "+261340000000",
  "email": "contact@boutique.com",
  "location": {
    "address": "Lot II A 123",
    "city": "Antananarivo",
    "district": "Analakely",
    "latitude": -18.8792,
    "longitude": 47.5079
  },
  "openingHours": [
    {
      "dayOfWeek": 1,
      "openTime": "08:00",
      "closeTime": "18:00"
    }
  ]
}
```

### 9.3 Tableau de bord commerçant
```http
GET /merchants/dashboard
Authorization: Bearer {merchant_token}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "todayOrders": 15,
      "todayRevenue": 75000,
      "pendingOrders": 5,
      "lowStockProducts": 3
    },
    "recentOrders": [...],
    "topProducts": [...]
  }
}
```

## 10. Administration

### 10.1 Liste des utilisateurs
```http
GET /admin/users?role=MERCHANT&status=PENDING
Authorization: Bearer {admin_token}
```

### 10.2 Approuver un commerçant
```http
POST /admin/merchants/{id}/approve
Authorization: Bearer {admin_token}
```

### 10.3 Statistiques globales
```http
GET /admin/analytics
Authorization: Bearer {admin_token}
```

## 11. Notifications

### 11.1 Liste des notifications
```http
GET /notifications?unreadOnly=true
Authorization: Bearer {token}
```

### 11.2 Marquer comme lu
```http
PUT /notifications/{id}/read
Authorization: Bearer {token}
```

### 11.3 S'abonner aux notifications push
```http
POST /notifications/push/subscribe
Authorization: Bearer {token}
```

**Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

## 12. Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Requête invalide |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Accès refusé |
| 404 | Not Found | Ressource introuvable |
| 409 | Conflict | Conflit (ex: email déjà utilisé) |
| 422 | Unprocessable Entity | Validation échouée |
| 429 | Too Many Requests | Limite de taux dépassée |
| 500 | Internal Server Error | Erreur serveur |

**Format d'erreur**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "Format d'email invalide"
      }
    ]
  }
}
```

## 13. Rate Limiting

- **Limite générale**: 100 requêtes/minute par IP
- **Authentification**: 5 tentatives/15 minutes
- **Paiements**: 10 requêtes/minute

**Headers de réponse**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702650000
```
