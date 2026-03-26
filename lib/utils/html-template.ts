export function wrapInHtmlTemplate(
  content: string,
  title: string,
  description: string,
  imageUrls: { url: string; caption: string }[] = []
): string {
  let htmlWithImages = content;

  if (imageUrls.length > 0) {
    // Count total heading tags (h2 and h3) to calculate even distribution
    const totalHeadings = (content.match(/<\/h[23]>/gi) || []).length;
    const interval =
      totalHeadings > 0
        ? Math.max(1, Math.floor(totalHeadings / imageUrls.length))
        : 1;

    let headingCount = 0;
    let imgIndex = 0;

    htmlWithImages = content.replace(/<\/h[23]>/gi, (match) => {
      headingCount++;

      // Insert image after every Nth heading, evenly spaced
      if (headingCount % interval === 0 && imgIndex < imageUrls.length) {
        const img = imageUrls[imgIndex];
        imgIndex++;
        return `${match}
<figure style="margin: 32px 0; text-align: center;">
  <img src="${img.url}" alt="${img.caption}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);" loading="lazy" />
  <figcaption style="color: #555; font-size: 13px; margin-top: 10px; font-style: italic;">${img.caption}</figcaption>
</figure>`;
      }
      return match;
    });

    // Append any remaining images that were not inserted (not enough headings)
    while (imgIndex < imageUrls.length) {
      const img = imageUrls[imgIndex];
      htmlWithImages += `
<figure style="margin: 32px 0; text-align: center;">
  <img src="${img.url}" alt="${img.caption}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);" loading="lazy" />
  <figcaption style="color: #555; font-size: 13px; margin-top: 10px; font-style: italic;">${img.caption}</figcaption>
</figure>`;
      imgIndex++;
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
    figure img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    figcaption { color: #666; font-size: 14px; margin-top: 8px; font-style: italic; }
    .meta-description { color: #666; font-style: italic; margin-bottom: 24px; }
  </style>
</head>
<body>
${htmlWithImages}
</body>
</html>`;
}
