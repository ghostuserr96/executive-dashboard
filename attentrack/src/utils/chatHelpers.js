export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateShort = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(timestamp);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getFileExtension = (fileName) => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const isImageFile = (fileName, mimeType) => {
  if (mimeType && mimeType.startsWith('image/')) return true;
  const ext = getFileExtension(fileName);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
};

export const isPDFFile = (fileName, mimeType) => {
  if (mimeType === 'application/pdf') return true;
  const ext = getFileExtension(fileName);
  return ext === 'pdf';
};

export const isDocxFile = (fileName, mimeType) => {
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
  const ext = getFileExtension(fileName);
  return ext === 'docx';
};

export const isExcelFile = (fileName, mimeType) => {
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  )
    return true;
  const ext = getFileExtension(fileName);
  return ['xlsx', 'xls', 'csv'].includes(ext);
};

export const isAttachmentSupported = (fileName, mimeType) => {
  return (
    isImageFile(fileName, mimeType) ||
    isPDFFile(fileName, mimeType) ||
    isDocxFile(fileName, mimeType) ||
    isExcelFile(fileName, mimeType)
  );
};

export const getFileCategory = (fileName, mimeType) => {
  if (isImageFile(fileName, mimeType)) return 'image';
  if (isPDFFile(fileName, mimeType)) return 'pdf';
  if (isDocxFile(fileName, mimeType)) return 'document';
  if (isExcelFile(fileName, mimeType)) return 'spreadsheet';
  return 'other';
};

export const getFileIcon = (fileName, mimeType) => {
  if (isImageFile(fileName, mimeType)) return 'image';
  if (isPDFFile(fileName, mimeType)) return 'pdf';
  if (isDocxFile(fileName, mimeType)) return 'doc';
  if (isExcelFile(fileName, mimeType)) return 'excel';
  return 'file';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarUrl = (name, seed) => {
  const safeSeed = seed || name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeSeed)}&background=3b82f6&color=fff&bold=true`;
};

export const getDepartmentColor = (department) => {
  const colors = {
    Engineering: '#3b82f6',
    Product: '#8b5cf6',
    Design: '#ec4899',
    'Human Resources': '#10b981',
    Legal: '#f59e0b',
    Finance: '#06b6d4',
    Marketing: '#f97316',
  };
  return colors[department] || '#6b7280';
};

export const truncateText = (text, maxLength = 40) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateMessageId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;