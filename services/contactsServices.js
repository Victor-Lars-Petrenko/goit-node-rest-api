import fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

const contactsPath = path.resolve("db", "contacts.json");

async function formatContacts(contacts) {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
}

export async function listContacts() {
  const contacts = await fs.readFile(contactsPath);
  return JSON.parse(contacts);
}

export async function getContactById(contactId) {
  const contacts = await listContacts();
  return contacts.find(({ id }) => id === contactId) || null;
}

export async function removeContact(contactId) {
  const contacts = await listContacts();
  const deleteIdx = contacts.findIndex(({ id }) => id === contactId);
  if (deleteIdx === -1) return null;
  const [result] = contacts.splice(deleteIdx, 1);
  await formatContacts(contacts);
  return result;
}

export async function addContact(contactInfo) {
  const contacts = await listContacts();
  const newContact = { id: nanoid(), ...contactInfo };
  contacts.push(newContact);
  await formatContacts(contacts);
  return newContact;
}

export async function modifyContact(contactId, contactNewInfo) {
  const contactToUpdate = await getContactById(contactId);
  if (!contactToUpdate) {
    return null;
  }
  const contacts = await listContacts();
  const newContact = { ...contactToUpdate, ...contactNewInfo };
  contacts.push(newContact);
  await formatContacts(contacts);
  return newContact;
}
