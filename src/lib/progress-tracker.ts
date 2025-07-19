// Progress tracking utilities for Getting Started widget

export const markFirstSearch = () => {
  localStorage.setItem('movieFirstSearch', 'true');
  // Dispatch custom event to notify dashboard
  window.dispatchEvent(new CustomEvent('progressUpdate', { 
    detail: { action: 'firstSearch', completed: true } 
  }));
};

export const markFirstLibrary = () => {
  localStorage.setItem('movieFirstLibrary', 'true');
  // Dispatch custom event to notify dashboard
  window.dispatchEvent(new CustomEvent('progressUpdate', { 
    detail: { action: 'firstLibrary', completed: true } 
  }));
};

export const markFirstSave = () => {
  localStorage.setItem('movieFirstSave', 'true');
  // Dispatch custom event to notify dashboard
  window.dispatchEvent(new CustomEvent('progressUpdate', { 
    detail: { action: 'firstSave', completed: true } 
  }));
};

export const getProgressStatus = () => {
  return {
    profileSetup: localStorage.getItem('movieProfileCompleted') === 'true',
    firstSearch: localStorage.getItem('movieFirstSearch') === 'true',
    firstLibrary: localStorage.getItem('movieFirstLibrary') === 'true',
    firstSave: localStorage.getItem('movieFirstSave') === 'true'
  };
}; 