import fs from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

const contactsPath = path.resolve("db", "contacts.json");

async function updateContacts(contacts) {
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
  await updateContacts(contacts);
  return result;
}

export async function addContact(name, email, phone) {
  const contacts = await listContacts();
  const newContact = { id: nanoid(), name, email, phone };
  contacts.push(newContact);
  await updateContacts(contacts);
  return newContact;
}
