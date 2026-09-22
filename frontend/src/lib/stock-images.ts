/**
 * Imágenes temporales de stock (Unsplash) usadas como placeholder mientras
 * no haya fotos propias de la clínica. Reemplazar por fotos reales cuando
 * estén disponibles: alcanza con cambiar estas URLs.
 */
function unsplash(id: string, w: number, h: number) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
}

export const stockImages = {
  hero: (w = 1600, h = 900) => unsplash('1576091160399-112ba8d25d1d', w, h),
  diagnostico: (w = 800, h = 600) => unsplash('1631563019676-dade0dbdb8fc', w, h),
  equipoMedico: (w = 800, h = 600) => unsplash('1579684385127-1ef15d508118', w, h),
  consultas: (w = 800, h = 600) => unsplash('1666214280391-8ff5bd3c0bf0', w, h),
  tratamientos: (w = 800, h = 600) => unsplash('1584982751601-97dcc096659c', w, h),
};
