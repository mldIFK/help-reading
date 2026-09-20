/**
 * Erreur d'import porteuse d'un message deja redige pour le parent.
 *
 * Elle vit dans son propre module pour que l'aiguillage des formats et la
 * reconnaissance d'image puissent tous deux la lever sans dependre l'un de
 * l'autre.
 */
export class FileImportError extends Error {}
