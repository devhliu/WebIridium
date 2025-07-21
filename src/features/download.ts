export const promptDownloadUrl = (name: string, url: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Prompts the user to download a string which will be put into a file.
 * @param name - name of the file the download will be
 * @param content - the string to download
 * @param type - the file type of the file that will be downloaded
 */
export const promptDownloadString = (
  name: string,
  content: string,
  type: string,
) => {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  promptDownloadUrl(name, url);
  URL.revokeObjectURL(url);
};
