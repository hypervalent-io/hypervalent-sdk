import type { OPERATION_IDS } from './generated/spec'

type OperationId = (typeof OPERATION_IDS)[number]

/**
 * Every public operation and the methods that call it. Names are relative to
 * the client, or to `hv.project()` when they are not `whoami`, `orgToken` or
 * `projects`. `test/operations.test.ts` holds this to the vendored spec, and
 * calls each method to check that it reaches its operation's route.
 */
export const OPERATION_METHODS = {
  getTokenOrgless: ['whoami'],
  getToken: ['orgToken'],
  listProjects: ['projects.list', 'projects.pages', 'projects.iterate'],

  listDocuments: ['documents.list', 'documents.pages', 'documents.iterate'],
  getDocument: ['documents.get'],
  createDocument: ['documents.create'],
  updateDocument: ['documents.update'],
  publishDocument: ['documents.publish'],
  unpublishDocument: ['documents.unpublish'],
  trashDocument: ['documents.trash'],

  // The API has no term list: a taxonomy read carries the page of terms.
  getTaxonomy: ['taxonomies.get', 'terms.list', 'terms.pages', 'terms.iterate'],
  getTerm: ['terms.get'],
  createTerm: ['terms.create'],
  updateTerm: ['terms.update'],
  publishTerm: ['terms.publish'],
  unpublishTerm: ['terms.unpublish'],
  trashTerm: ['terms.trash'],

  listDocumentTypes: ['doctypes.list'],
  getDocumentType: ['doctypes.get'],
  createDocumentType: ['doctypes.create'],
  updateDocumentType: ['doctypes.update'],

  listTaxonomies: ['taxonomies.list'],
  createTaxonomy: ['taxonomies.create'],
  updateTaxonomy: ['taxonomies.update'],

  listAtoms: ['atoms.list'],
  getAtom: ['atoms.get'],
  createAtom: ['atoms.create'],
  updateAtom: ['atoms.update'],

  listMolecules: ['molecules.list'],
  getMolecule: ['molecules.get'],
  createMolecule: ['molecules.create'],
  updateMolecule: ['molecules.update'],

  listSettings: ['settings.list'],
  getSetting: ['settings.get'],

  listDesignTokens: ['designTokens.list'],
  updateDesignTokens: ['designTokens.update'],
  listDesignTokenSchemes: ['designTokens.schemes'],
  getDesignTheme: ['designTokens.theme'],
  updateDesignTheme: ['designTokens.updateTheme'],
  getDesignTokensCss: ['designTokens.css'],
  getDesignTokensW3C: ['designTokens.w3c'],

  listLibrary: ['library.list'],
  planLibraryInsert: ['library.plan'],
  insertLibraryItems: ['library.insert'],

  uploadMedia: ['media.upload', 'media.uploadFromUrl']
} as const satisfies Record<OperationId, readonly string[]>
