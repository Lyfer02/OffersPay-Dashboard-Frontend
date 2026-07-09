export const exportBlogsToJson = (data, filename = 'blogs_export.json') => {
  const json = JSON.stringify(data, null, 2); // pretty print
  const blob = new Blob([json], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  URL.revokeObjectURL(link.href);
};
