import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Teacher OS',
    short_name: 'Teacher OS',
    description: 'The operating system for teachers — report comments, lesson planning, email templates, and resources.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFB',
    theme_color: '#0D9488',
    orientation: 'any',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
