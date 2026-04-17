import { LibraryItem, ARPhoto } from "../types/tattoo";

const LIBRARY_KEY = "inkAnatomy_library";
const AR_PHOTOS_KEY = "inkAnatomy_arPhotos";

export const storage = {
  // Library items
  getLibraryItems(): LibraryItem[] {
    const data = localStorage.getItem(LIBRARY_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveLibraryItem(item: LibraryItem): void {
    const items = this.getLibraryItems();
    const exists = items.find((i) => i.id === item.id);
    if (!exists) {
      items.push(item);
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
    }
  },

  removeLibraryItem(id: string): void {
    const items = this.getLibraryItems().filter((i) => i.id !== id);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
  },

  updateLibraryItemDescription(id: string, description: string): void {
    const items = this.getLibraryItems();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.savedDescription = description;
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
    }
  },

  // AR photos
  getARPhotos(): ARPhoto[] {
    const data = localStorage.getItem(AR_PHOTOS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveARPhoto(photo: ARPhoto): void {
    const photos = this.getARPhotos();
    photos.push(photo);
    localStorage.setItem(AR_PHOTOS_KEY, JSON.stringify(photos));
  },

  removeARPhoto(id: string): void {
    const photos = this.getARPhotos().filter((p) => p.id !== id);
    localStorage.setItem(AR_PHOTOS_KEY, JSON.stringify(photos));
  },

  updateARPhoto(id: string, updates: Partial<ARPhoto>): void {
    const photos = this.getARPhotos();
    const idx = photos.findIndex((p) => p.id === id);
    if (idx !== -1) {
      photos[idx] = { ...photos[idx], ...updates };
      localStorage.setItem(AR_PHOTOS_KEY, JSON.stringify(photos));
    }
  },

  // Community posts (user-shared tattoos)
  getCommunityPosts(): Array<{ id: string; tattooImageUrl: string; arPhotoUrl: string; title: string; description: string; postedAt: string }> {
    const data = localStorage.getItem("inkAnatomy_communityPosts");
    return data ? JSON.parse(data) : [];
  },

  addCommunityPost(post: { id: string; tattooImageUrl: string; arPhotoUrl: string; title: string; description: string; postedAt: string }): boolean {
    try {
      const posts = this.getCommunityPosts();
      posts.push(post);
      localStorage.setItem("inkAnatomy_communityPosts", JSON.stringify(posts));
      return true;
    } catch (e) {
      console.error("Failed to save community post (likely localStorage quota exceeded):", e);
      return false;
    }
  },
};