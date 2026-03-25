export function wrapInHtmlTemplate(
  content: string,
  title: string,
  description: string,
  imageUrls: { url: string; caption: string }[] = []
): string {
  let htmlWithImages = content;
  if (imageUrls.length > 0) {
    const sections = htmlWithImages.split(/<h2/gi);
    if (sections.length > 2) {
      const interval = Math.floor(sections.length / (imageUrls.length + 1));
      let imgIndex = 0;
      for (let i = interval; i < sections.length && imgIndex < imageUrls.length; i += interval) {
        const img = imageUrls[imgIndex];
        const imgHtml = `<figure style="margin: 24px 0; text-align: center;">
  <img src="${img.url}" alt="${img.caption}" style="max-width: 100%; border-radius: 8px;" />
  <figcaption style="color: #666; font-size: 14px; margin-top: 8px;">${img.caption}</figcaption>
</figure>
`;
        sections[i] = imgHtml + "<h2" + sections[i];
        imgIndex++;
      }
      htmlWithImages = sections.join("");
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.7;
      max-width: 800px;
      margin: auto;
      padding: 24px;
      color: #333;
      background: #fff;
    }
    h1 { color: #0066CC; font-size: 28px; margin-bottom: 8px; }
    h2 { color: #0066CC; font-size: 22px; margin-top: 32px; border-bottom: 2px solid #e8f0fe; padding-bottom: 8px; }
    h3 { font-size: 18px; margin-top: 20px; color: #444; }
    ul, ol { margin-left: 20px; }
    li { margin-bottom: 6px; }
    a { color: #0066CC; text-decoration: none; }
    a:hover { text-decoration: underline; }
    blockquote { border-left: 4px solid #0066CC; margin-left: 0; padding-left: 16px; color: #555; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
    figure { margin: 24px 0; text-align: center; }
    figure img { max-width: 100%; border-radius: 8px; }
    figcaption { color: #666; font-size: 14px; margin-top: 8px; }
    .meta-description { color: #666; font-style: italic; margin-bottom: 24px; }
  </style>
</head>
<body>
${htmlWithImages}
</body>
</html>`;
}
