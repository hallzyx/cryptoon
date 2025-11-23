import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAVORITES_DB_PATH = path.join(__dirname, 'favorites.json');

// Initialize favorites database
export function initFavoritesDb() {
  if (!fs.existsSync(FAVORITES_DB_PATH)) {
    const initialData = { favorites: [] };
    fs.writeFileSync(FAVORITES_DB_PATH, JSON.stringify(initialData, null, 2));
    console.log('✅ Favorites database initialized');
  }
}

// Load favorites from file
function loadFavorites() {
  try {
    const data = fs.readFileSync(FAVORITES_DB_PATH, 'utf8');
    return JSON.parse(data).favorites || [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

// Save favorites to file
function saveFavorites(favorites) {
  try {
    fs.writeFileSync(
      FAVORITES_DB_PATH, 
      JSON.stringify({ favorites }, null, 2)
    );
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
}

// Get user's favorite series
export function getUserFavorites(address) {
  if (!address) return [];
  
  const favorites = loadFavorites();
  return favorites.filter(
    fav => fav.address.toLowerCase() === address.toLowerCase()
  );
}

// Check if series is favorited by user
export function isFavorited(address, seriesId) {
  if (!address || !seriesId) return false;
  
  const favorites = loadFavorites();
  return favorites.some(
    fav => fav.address.toLowerCase() === address.toLowerCase() && 
           fav.seriesId === seriesId
  );
}

// Add series to favorites
export function addFavorite(address, seriesId, seriesTitle, seriesCover) {
  if (!address || !seriesId) {
    return { success: false, error: 'Address and seriesId are required' };
  }

  const favorites = loadFavorites();
  
  // Check if already favorited
  const exists = favorites.some(
    fav => fav.address.toLowerCase() === address.toLowerCase() && 
           fav.seriesId === seriesId
  );

  if (exists) {
    return { success: false, error: 'Already in favorites' };
  }

  // Add new favorite
  const newFavorite = {
    address: address.toLowerCase(),
    seriesId,
    seriesTitle: seriesTitle || `Series ${seriesId}`,
    seriesCover: seriesCover || '',
    timestamp: new Date().toISOString()
  };

  favorites.push(newFavorite);
  saveFavorites(favorites);

  console.log(`⭐ Favorite added: ${address} -> Series ${seriesId}`);
  return { success: true, favorite: newFavorite };
}

// Remove series from favorites
export function removeFavorite(address, seriesId) {
  if (!address || !seriesId) {
    return { success: false, error: 'Address and seriesId are required' };
  }

  const favorites = loadFavorites();
  const initialLength = favorites.length;
  
  const updatedFavorites = favorites.filter(
    fav => !(fav.address.toLowerCase() === address.toLowerCase() && 
             fav.seriesId === seriesId)
  );

  if (updatedFavorites.length === initialLength) {
    return { success: false, error: 'Favorite not found' };
  }

  saveFavorites(updatedFavorites);
  console.log(`💔 Favorite removed: ${address} -> Series ${seriesId}`);
  
  return { success: true };
}

// Get all favorites (admin/debug)
export function getAllFavorites() {
  return loadFavorites();
}

// Initialize on module load
initFavoritesDb();
