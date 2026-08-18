export const getAnonymousUserId = (): string => {
  const STORAGE_KEY = 'cidade_alta_anon_uid';
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
};
