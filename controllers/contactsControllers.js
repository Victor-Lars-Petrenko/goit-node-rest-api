import {
  getContactById,
  listContacts,
  removeContact,
} from "../services/contactsServices.js";

export const getAllContacts = async (req, res) => {
  const allContacts = await listContacts();
  res.status(200).json(allContacts);
};

export const getOneContact = async (req, res) => {
  const id = req.params.id;
  const oneContact = await getContactById(id);
  if (oneContact) {
    return res.status(200).json(oneContact);
  }
  res.status(404).json({ message: "Not found" });
};

export const deleteContact = async (req, res) => {
  const deletedContact = await removeContact(req.params.id);
  if (deletedContact) {
    return res.status(200).json(deletedContact);
  }
  res.status(404).json({ message: "Not found" });
};

export const createContact = (req, res) => {};

export const updateContact = (req, res) => {};
