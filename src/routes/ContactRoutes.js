const express = require("express");
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const router = express.Router();

/**
 * 📌 1. Ajouter un contact
 */
router.post("/", async (req, res) => {
  try {
    const { name, role, email, phone, availability, horses } = req.body;
    const newContact = new Contact({ name, role, email, phone, availability, horses, interventions: [] });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 📌 2. Modifier un contact
 */
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 3. Supprimer un contact
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) return res.status(404).json({ error: "Contact non trouvé" });

    res.json({ message: "Contact supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 4. Rechercher un contact
 */
router.get("/search", async (req, res) => {
  try {
    const { name, role, availability } = req.query;

    let query = {};
    if (name) query.name = { $regex: new RegExp(name, "i") };
    if (role) query.role = { $regex: new RegExp(role, "i") };
    if (availability) query.availability = { $regex: new RegExp(availability, "i") };

    const contacts = await Contact.find(query);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 📌 Get all contacts with populated horses
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().populate('horses', 'name'); // 🆕 Populate horses with only 'name' field
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

/**
 * 📌 5. Associer des contacts aux chevaux
 */
router.post("/:id/assign-horse", async (req, res) => {
  try {
    const id = req.params.id.trim();
    const { horseName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    if (!contact.horses.includes(horseName)) {
      contact.horses.push(horseName);
      await contact.save();
    }

    res.json({ message: `Cheval "${horseName}" attribué à ${contact.name}`, contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Ajouter une intervention à un contact
 */
router.post("/:id/intervention", async (req, res) => {
  try {
    const id = req.params.id.trim();
    const { horseName, type, description, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    const newIntervention = {
      horseName,
      type,
      description,
      date: date || new Date(),
    };

    contact.interventions.push(newIntervention);
    await contact.save();

    res.json({ message: "✅ Intervention ajoutée avec succès", contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Obtenir l'historique des interventions d'un contact
 */
router.get("/:id/interventions", async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const contact = await Contact.findById(id).select("name interventions");
    if (!contact) {
      return res.status(404).json({ error: "Contact non trouvé" });
    }

    res.json({ contactName: contact.name, interventions: contact.interventions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Obtenir tous les contacts
 */
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
