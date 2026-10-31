import type { components } from './generated/openapi'

type ReferencedImage = components['schemas']['ReferencedImage']
type ReferencedFile = components['schemas']['ReferencedFile']

export type MediaFieldType = 'image' | 'file' | 'video'

/** Any content read: a document, a document page, a taxonomy with its terms, or a term. */
export interface MediaReferences {
  referencedImages: ReferencedImage[]
  referencedFiles: ReferencedFile[]
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Looks up a media field's value in the read that carried it. The list is chosen
 * by the field's type, not the asset's, as the API splits them. Answers an array in
 * the value's order, whether the field holds one value or several. A uuid the read
 * does not list is left out. In a file or video field a non-uuid string is an
 * external URL and is returned as given.
 */
export function resolveFieldMedia(read: MediaReferences, fieldType: 'image', value: unknown): ReferencedImage[]
export function resolveFieldMedia(read: MediaReferences, fieldType: 'file' | 'video', value: unknown): (ReferencedFile | string)[]
export function resolveFieldMedia(read: MediaReferences, fieldType: MediaFieldType, value: unknown): (ReferencedImage | ReferencedFile | string)[] {
  if (fieldType !== 'image' && fieldType !== 'file' && fieldType !== 'video') {
    throw new TypeError('resolveFieldMedia: fieldType must be image, file or video')
  }
  const listed = fieldType === 'image' ? read.referencedImages : read.referencedFiles
  const byUuid = new Map<string, ReferencedImage | ReferencedFile>(listed.map(asset => [asset.uuid.toLowerCase(), asset]))
  const resolved: (ReferencedImage | ReferencedFile | string)[] = []
  for (const entry of Array.isArray(value) ? value : [value]) {
    if (typeof entry !== 'string' || entry === '') continue
    if (UUID.test(entry)) {
      const asset = byUuid.get(entry.toLowerCase())
      if (asset) resolved.push(asset)
    }
    else if (fieldType !== 'image') {
      resolved.push(entry)
    }
  }
  return resolved
}
