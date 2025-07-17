import { storageUrl } from '@/utils/env'

export function resolveStoragePath(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${storageUrl}/storage/${path}`
}
