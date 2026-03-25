export function buildImagePrompts(
  title: string,
  sections: string[],
  category: string
): { prompt: string; caption: string }[] {
  const prompts: { prompt: string; caption: string }[] = [];

  prompts.push({
    prompt: `Create a professional, clean dental blog hero image for an article titled "${title}".
The image should show modern dental equipment in a professional Indian dental clinic setting.
Style: Clean, professional, bright lighting, no text overlay, photorealistic.
Color scheme: Blue and white (DentalKart brand colors).
Category: ${category}.
Do NOT include any text, watermarks, or logos in the image.`,
    caption: title,
  });

  if (sections.length > 1) {
    prompts.push({
      prompt: `Create a clean infographic-style illustration for a dental blog section about "${sections[1]}".
Show a simple visual comparison or process diagram related to ${category}.
Style: Flat design, professional, dental/medical theme, blue and white colors.
Do NOT include any text, watermarks, or logos in the image.`,
      caption: sections[1],
    });
  }

  return prompts;
}
