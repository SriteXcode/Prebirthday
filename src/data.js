// Use Vite's glob import to load all images
const modules = import.meta.glob('./assets/images/*.jpg', { eager: true });

// Convert to array and sort by filename
export const images = Object.keys(modules)
  .sort((a, b) => {
    // Extract numbers from filenames for correct numerical sort (1, 2, ... 10, not 1, 10, 2)
    const numA = parseInt(a.match(/(\d+)/)[0]);
    const numB = parseInt(b.match(/(\d+)/)[0]);
    return numA - numB;
  })
  .map((path) => modules[path].default);
