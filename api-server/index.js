const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

let db; // Instance de la connexion à la base de données



// Connexion à la base de données MongoDB
MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('ecommerce');
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Endpoint pour récupérer les produits depuis MongoDB
app.get("/api/products", (req, res) => {
  db.collection('produits').find().toArray()
    .then(products => {
      res.send(products);
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      res.status(500).send('Internal Server Error');
    });
});
// Endpoint pour ajouter un produit
app.post("/api/products", (req, res) => {
  const product = req.body;
  db.collection('produits').insertOne(product)
    .then(result => {
      res.status(201).send();
    })
    .catch(error => {
      console.error('Error adding product:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour rechercher des produits
app.get("/api/products/search", (req, res) => {
  const { name, title, category, details } = req.query;
  const query = {};

  if (name) query.name = new RegExp(name, 'i');
  if (title) query.title = new RegExp(title, 'i');
  if (category) query.category = category.toLowerCase();
  if (details) query.details = new RegExp(details, 'i');

  db.collection('produits').find(query).toArray()
    .then(filteredProducts => {
      res.send(filteredProducts);
    })
    .catch(error => {
      console.error('Error searching products:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour supprimer un produit
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id; // Récupération de l'ID du produit à supprimer depuis les paramètres de la requête

  // Suppression du produit en utilisant son ID spécifié
  db.collection('produits').deleteOne({ _id: new ObjectId(productId) })
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(204).send(); // Le produit a été supprimé avec succès
      } else {
        res.status(404).send("Product not found");
      }
    })
    .catch(error => {
      console.error('Error deleting product:', error);
      res.status(500).send('Internal Server Error');
    });
});


//modifier
// Endpoint pour mettre à jour un produit
app.put("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  // Supprimez le champ _id des données de mise à jour
  delete updatedProduct._id;

  db.collection('produits').updateOne({ _id: new ObjectId(productId) }, { $set: updatedProduct })
    .then(result => {
      if (result.modifiedCount === 1) {
        res.status(200).send(); // Le produit a été mis à jour avec succès
      } else {
        res.status(404).send("Product not found"); // Le produit n'a pas été trouvé
      }
    })
    .catch(error => {
      console.error('Error updating product:', error);
      res.status(500).send('Internal Server Error');
    });
});


// Endpoint pour ajouter un produit au panier d'un utilisateur
app.post("/api/cart/:userId/add", (req, res) => {
  const userId = req.params.userId; // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
  const product = req.body; // Récupérer les données du produit depuis le corps de la requête

  // Recherche de l'utilisateur par son ID
  db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(userId) }, // Filtrer l'utilisateur par son ID
    { $push: { cart: product } }, // Ajouter le produit au tableau "cart"
    { returnOriginal: false } // Renvoyer le document mis à jour plutôt que l'original
  )
    .then(result => {
      if (result.value) {
        res.status(200).send(result.value.cart); // Renvoyer le panier mis à jour de l'utilisateur
      } else {
        res.status(404).send("User not found");
      }
    })
    .catch(error => {
      console.error('Error adding product to cart:', error);
      res.status(500).send('Internal Server Error');
    });
});


// Endpoint pour récupérer le panier d'un utilisateur

app.get("/api/user/:userId/cart", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupérer tous les produits dans le panier de l'utilisateur correspondant à l'ID fourni
    const cartItems = await db.collection('cart').find({ userId: userId }).toArray();

    res.send(cartItems);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier de l\'utilisateur:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Endpoint pour supprimer un produit du panier d'un utilisateur
app.delete("/api/cart/:userId/remove/:productId", (req, res) => {
  const userId = req.params.userId; // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
  const productId = req.params.productId; // Récupérer l'ID du produit depuis les paramètres de la requête

  // Recherche de l'utilisateur par son ID et suppression du produit du panier
  db.collection('users').findOneAndUpdate(
    { 
      _id: new ObjectId(userId), // Filtrer l'utilisateur par son ID
    },
    { 
      $pull: { 
        cart: { _id: productId } // Supprimer le produit du tableau "cart"
      } 
    },
    { 
      returnOriginal: false // Renvoyer le document mis à jour plutôt que l'original
    }
  )
  .then(result => {
    if (result.value) {
      res.status(200).send(result.value.cart); // Renvoyer le panier mis à jour de l'utilisateur
    } else {
      res.status(404).send("User not found or product not in cart");
    }
  })
  .catch(error => {
    console.error('Error removing product from cart:', error);
    res.status(500).send('Internal Server Error');
  });
});



// Endpoint pour authentifier un utilisateur
app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;
  db.collection('users').findOne({ email, password })
    .then(user => {
      if (user) {
        res.status(200).send({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          cart:user.cart,
          userType: user.userType,
          tel:user.tel
        });
      } else {
        res.status(401).send("Invalid user credentials.");
      }
    })
    .catch(error => {
      console.error('Error signing in:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour récupérer le panier
app.get("/api/cart", (req, res) => {
  db.collection('cart').find().toArray()
    .then(cartItems => {
      res.send(cartItems);
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.post("/api/register", (req, res) => {
  const { firstName, lastName, email, password, userType,tel } = req.body;

  // Vérifiez si l'utilisateur existe déjà dans la base de données
  db.collection('users').findOne({ email: email.toLowerCase() })
    .then(existingUser => {
      if (existingUser) {
        // L'utilisateur avec cet email existe déjà
        res.status(409).json({ success: false, message: "This email is already in use. Please use a different email." });
      } else {
        // L'email n'est pas déjà utilisé, ajoutez l'utilisateur à la base de données
        const newUser = { firstName, lastName, email: email.toLowerCase(), password ,userType,  cart: [] ,tel };
        db.collection('users').insertOne(newUser)
          .then(result => {
            res.status(201).json({ success: true, message: "User registered successfully." }); // Utilisation du code HTTP 201 pour succès
          })
          .catch(error => {
            console.error('Error registering user:', error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
          });
      }
    })
    .catch(error => {
      console.error('Error checking existing user:', error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    });
});

// Endpoint pour récupérer tous les utilisateurs
app.get("/api/users", (req, res) => {
  db.collection('users').find().toArray()
    .then(users => {
      res.send(users);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour mettre à jour un utilisateur spécifique
app.put("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;
  const updatedUserData = req.body; // Les données mises à jour de l'utilisateur seront envoyées dans le corps de la requête

  const objectId = new ObjectId(userId); // Créer un nouvel objet ObjectId à partir de l'ID de l'utilisateur

  db.collection('users').updateOne({ _id: objectId }, { $set: updatedUserData })
    .then(result => {
      if (result.modifiedCount === 1) {
        res.status(200).send('Utilisateur mis à jour avec succès');
      } else {
        res.status(404).send('Utilisateur non trouvé');
      }
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour supprimer un utilisateur par son ID
app.delete("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;

  // Vérifiez si l'ID de l'utilisateur est fourni dans la requête
  if (!userId) {
    return res.status(400).send("ID de l'utilisateur non fourni");
  }

  // Supprimez l'utilisateur de la base de données en utilisant ObjectId correctement avec new
  db.collection('users').deleteOne({ _id: new ObjectId(userId) })
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(200).send("Utilisateur supprimé avec succès");
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    })
    .catch(error => {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      res.status(500).send('Erreur interne du serveur');
    });
});

//update quantite
app.put('/api/cart/:userId/update/:productId', (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;
  const selectedQuantity = req.body.selectedQuantity;

  db.collection('users').findOne({ _id: new ObjectId(userId) })
    .then(user => {
      if (!user) {
        return res.status(404).send("User not found");
      }

      // Recherche du produit dans le panier de l'utilisateur
      const productIndex = user.cart.findIndex(item => item._id.toString() === productId);
      if (productIndex === -1) {
        return res.status(404).send("Product not found in user's cart");
      }

      // Mise à jour de la quantité sélectionnée du produit
      user.cart[productIndex].selectedQuantity = selectedQuantity;

      // Mise à jour de l'utilisateur dans la base de données
      return db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { cart: user.cart } }
      );
    })
    .then(result => {
      if (result.modifiedCount === 0) {
        return res.status(500).send("Failed to update user's cart");
      }
      res.status(200).send("Selected quantity updated successfully");
    })
    .catch(error => {
      console.error('Error updating selected quantity:', error);
      res.status(500).send('Internal Server Error');
    });
});



// Endpoint pour récupérer les détails d'un produit par ID
app.get("/api/products/:productId", (req, res) => {
  const productId = req.params.productId; // Récupérer l'ID du produit depuis les paramètres de la requête

  // Se connecter à MongoDB et récupérer les détails du produit par ID
  MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      const db = client.db('ecommerce');
      db.collection('produits').findOne({ _id: new ObjectId(productId) })
        .then(product => {
          res.send(product); // Renvoyer les détails du produit au client
        })
        .catch(error => {
          console.error('Error fetching product details:', error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(error => {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
    });
});


// Endpoint pour passer une commande
app.post("/api/commandes", async (req, res) => {
  try {
    const { userId, address } = req.body; // Récupérer l'ID de l'utilisateur connecté et l'adresse de livraison

    // Récupérer l'utilisateur avec son panier depuis la collection "users"
    const utilisateur = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const produitsDuPanier = utilisateur.cart; // Récupérer les produits du panier de l'utilisateur

    // Calculer le total
    const total = produitsDuPanier.reduce((sum, product) => sum + (product.price * product.selectedQuantity), 0);

    // Créer une nouvelle commande avec les produits du panier, l'ID de l'utilisateur, la date actuelle, le total et l'adresse de livraison
    const nouvelleCommande = {
      produits: produitsDuPanier,
      utilisateur: userId,
      date: new Date(), // Ajouter la date actuelle à la commande
      total: total, // Ajouter le total à la commande
      address: address ,// Ajouter l'adresse de livraison à la commande
      status: "Pending",
      notification: ""
    };

    // Enregistrer la nouvelle commande dans la collection "orders" dans la base de données
    const result = await db.collection('orders').insertOne(nouvelleCommande);

    // Vérifier si l'insertion s'est bien passée
    if (result.insertedCount === 1) {
      res.status(201).json({ message: 'Commande passée avec succès.' });
    } else {
      res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
  }
});


// Endpoint pour récupérer toutes les commandes
app.get("/api/commandes", async (req, res) => {
  try {
    const commandes = await db.collection('orders').find().toArray();
    res.status(200).json(commandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes.' });
  }
});


// Endpoint pour récupérer les commandes d'un utilisateur spécifique
app.get("/api/utilisateur/:userId/commandes", async (req, res) => {
  try {
    const userId = req.params.userId; // Récupérer l'ID de l'utilisateur depuis les paramètres de l'URL
    const commandes = await db.collection('orders').find({ utilisateur: userId }).toArray(); // Récupérer les commandes où le champ "utilisateur" correspond à l'ID de l'utilisateur
    res.status(200).json(commandes); // Renvoyer les commandes récupérées
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes de l\'utilisateur.' });
  }
});



const port = 3000;

app.listen(port, () => console.log(`API Server listening on port ${port}`));






/*


const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

let db; // Instance de la connexion à la base de données

// Connexion à la base de données MongoDB
MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('ecommerce');
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Endpoint pour récupérer les produits depuis MongoDB
app.get("/api/products", (req, res) => {
  db.collection('produits').find().toArray()
    .then(products => {
      res.send(products);
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      res.status(500).send('Internal Server Error');
    });
});
// Endpoint pour ajouter un produit
app.post("/api/products", (req, res) => {
  const product = req.body;
  db.collection('produits').insertOne(product)
    .then(result => {
      res.status(201).send();
    })
    .catch(error => {
      console.error('Error adding product:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour rechercher des produits
app.get("/api/products/search", (req, res) => {
  const { name, title, category, details } = req.query;
  const query = {};

  if (name) query.name = new RegExp(name, 'i');
  if (title) query.title = new RegExp(title, 'i');
  if (category) query.category = category.toLowerCase();
  if (details) query.details = new RegExp(details, 'i');

  db.collection('produits').find(query).toArray()
    .then(filteredProducts => {
      res.send(filteredProducts);
    })
    .catch(error => {
      console.error('Error searching products:', error);
      res.status(500).send('Internal Server Error');
    });
});
// Endpoint pour supprimer un produit
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;

  db.collection('produits').deleteOne({ id: Number(productId) }) // Utilisation de 'id' au lieu de '_id'
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(204).send(); // Le produit a été supprimé avec succès
      } else {
        res.status(404).send("Product not found");
      }
    })
    .catch(error => {
      console.error('Error deleting product:', error);
      res.status(500).send('Internal Server Error');
    });
});
//modifier
// Endpoint pour mettre à jour un produit
app.put("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  // Supprimez le champ _id des données de mise à jour
  delete updatedProduct._id;

  db.collection('produits').updateOne({ id: Number(productId) }, { $set: updatedProduct })
    .then(result => {
      if (result.modifiedCount === 1) {
        res.status(200).send(); // Le produit a été mis à jour avec succès
      } else {
        res.status(404).send("Product not found"); // Le produit n'a pas été trouvé
      }
    })
    .catch(error => {
      console.error('Error updating product:', error);
      res.status(500).send('Internal Server Error');
    });
});


// Endpoint pour ajouter un produit au panier
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    // Ajoutez le produit au panier de l'utilisateur correspondant
    await db.collection('users').updateOne(
      { _id: userId }, 
      { $push: { cart: productId } }
    );

    res.status(201).send("Product added to cart successfully.");
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Endpoint pour récupérer le panier d'un utilisateur

app.get("/api/user/:userId/cart", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupérer tous les produits dans le panier de l'utilisateur correspondant à l'ID fourni
    const cartItems = await db.collection('cart').find({ userId: userId }).toArray();

    res.send(cartItems);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier de l\'utilisateur:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint pour authentifier un utilisateur
app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;
  db.collection('users').findOne({ email, password })
    .then(user => {
      if (user) {
        res.status(200).send({
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      } else {
        res.status(401).send("Invalid user credentials.");
      }
    })
    .catch(error => {
      console.error('Error signing in:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour ajouter un produit au panier
app.post("/api/cart", (req, res) => {
  const cartItem = req.body;
  db.collection('cart').insertOne(cartItem)
    .then(result => {
      res.status(201).send();
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Endpoint pour récupérer le panier d'un utilisateur

app.get("/api/user/:userId/cart", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupérer tous les produits dans le panier de l'utilisateur correspondant à l'ID fourni
    const cartItems = await db.collection('cart').find({ userId: userId }).toArray();

    res.send(cartItems);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier de l\'utilisateur:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post("/api/register", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Vérifiez si l'utilisateur existe déjà dans la base de données
  db.collection('users').findOne({ email: email.toLowerCase() })
    .then(existingUser => {
      if (existingUser) {
        // L'utilisateur avec cet email existe déjà
        res.status(409).json({ success: false, message: "This email is already in use. Please use a different email." });
      } else {
        // L'email n'est pas déjà utilisé, ajoutez l'utilisateur à la base de données
        const newUser = { firstName, lastName, email: email.toLowerCase(), password };
        db.collection('users').insertOne(newUser)
          .then(result => {
            res.status(201).json({ success: true, message: "User registered successfully." }); // Utilisation du code HTTP 201 pour succès
          })
          .catch(error => {
            console.error('Error registering user:', error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
          });
      }
    })
    .catch(error => {
      console.error('Error checking existing user:', error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    });
});


const port = 3000;

app.listen(port, () => console.log(`API Server listening on port ${port}`));


*/













/*const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const corsOptions = {
  origin: 'http://localhost:4200', // ou '*' pour autoriser toutes les origines
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // autoriser les cookies et les en-têtes d'autorisation
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cors());

let cart = [];

app.get("/api/products", (req, res) => {
  let products = [
    {
      id:1,
      name:"AER22",
      title:"Tablette SAM 12 Pouce",
      quantity: 5,
      price:2334,
      category:"tablet",
      details:"Plus de détails sur le produit 1",
      imagePath:"assets/tablette12_pouces.webp",
      rating:2
    },
   
    {
      id:2,
      name:"EFRRR",
      title:"IPhone 14",
      quantity: 0,
      price:11000,
      category:"phone",
      details:"Plus de détails sur le produit 2",
      imagePath:"assets/iphone 14.jpeg",
      rating:4
    },
    {
      id:3,
      name:"SQZEE",
      title:"Smart TV 48 Pouces",
      quantity:3,
      price:8000,
      category:"smarttv",
      details:"Plus de détails sur le produit 3",
      imagePath:"assets/smart tv 48 pouces.jpg"
    },
    {
      id:4,
      name:"RTVVV",
      title:"Iphone 14",
      quantity:6,
      price:11000,
      category:"phone",
      details:"Plus de détails sur le produit 4 , est un tres bon PHONE avec carateristiques , de 300gb at un bon camera",
      imagePath:"assets/iphone 14.jpeg"
    },
    {
      id:5,
      name:"Xiaomi Redmi",
      title:"Redmi Note 11",
      quantity:6,
      price:3500,
      category:"phone",
      details:"Plus de détails sur le produit 5",
      imagePath:"assets/redmiNote11.png",
      rating:4
    },
   
  ];
  res.send(products);
});
// Route pour rechercher des produits
app.get("/api/products", (req, res) => {
  // Récupérer les termes de recherche de la requête
  const { name, title, category, details } = req.query;

  // Filtrer les produits en fonction des termes de recherche
  let filteredProducts = products.filter(product => {
    // Vérifier chaque attribut par rapport aux termes de recherche
    return (!name || product.name.toLowerCase().includes(name.toLowerCase())) &&
           (!title || product.title.toLowerCase().includes(title.toLowerCase())) &&
           (!category || product.category.toLowerCase() === category.toLowerCase()) &&
           (!details || product.details.toLowerCase().includes(details.toLowerCase()));
  });

  // Renvoyer les produits filtrés
  res.send(filteredProducts);
});
app.post("/api/cart", (req, res) => {
  cart = req.body;
  setTimeout(() => res.status(201).send(), 20);
});

const users = {
  "saibari@uae.ac.ma": {
    firstName: "maroua",
    lastName: "saibari",
    email: "saibari@uae.ac.ma",
    password: "test",
  }
  
};

app.post("/api/signin", (req, res) => {
  const user = users[req.body.email];
  if (user && user.password === req.body.password) {
    res.status(200).send({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } else {
    res.status(401).send("Invalid user credentials.");
  }
});

app.get("/api/cart", (req, res) => res.send(cart));

const port = 3000;

app.listen(port, () => console.log(`API Server listening on port ${port}`));


*/