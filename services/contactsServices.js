import { Contact } from "../models/Contact.js";

export const listContacts = () => Contact.find({});

export const getContactById = (contactId) => Contact.findById(contactId);

export const removeContact = (contactId) =>
  Contact.findByIdAndDelete(contactId);

export const addContact = (contactInfo) => Contact.create(contactInfo);

export const modifyContact = (contactId, contactNewInfo) =>
  Contact.findByIdAndUpdate(contactId, contactNewInfo);

export const modifyStatusContact = (contactId, newStatus) =>
  Contact.findByIdAndUpdate(contactId, newStatus);
