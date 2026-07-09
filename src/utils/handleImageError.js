export const handleImgError = (e) => {
  const fallback = "/img/noimage.jpeg";
  if (e.target.src !== window.location.origin + fallback) {
    e.target.src = fallback;
  }
};