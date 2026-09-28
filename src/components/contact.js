// Cualquier parte de la web puede abrir la carta de contacto del footer (p. ej. "contacto" del menú)
export const OPEN_CONTACT_EVENT = 'open-contact';
export const openContact = () => window.dispatchEvent(new Event(OPEN_CONTACT_EVENT));
