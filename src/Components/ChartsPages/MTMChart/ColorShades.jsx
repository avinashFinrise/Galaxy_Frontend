export function ColorShades(hexColor, numberOfShades) {
  // Convert hex color to RGB
  const red = parseInt(hexColor.substring(1, 3), 16);
  const green = parseInt(hexColor.substring(3, 5), 16);
  const blue = parseInt(hexColor.substring(5, 7), 16);

  const lighterColorShades = [];
  const step = 1 / (numberOfShades + 1);

  const maxRGB = 230; // Maximum value for any RGB component to prevent shades too close to white

  for (let i = 1; i <= numberOfShades; i++) {
    // Calculate new RGB values based on the step
    const newRed = Math.min(Math.round(red + (maxRGB - red) * i * step), maxRGB);
    const newGreen = Math.min(Math.round(green + (maxRGB - green) * i * step), maxRGB);
    const newBlue = Math.min(Math.round(blue + (maxRGB - blue) * i * step), maxRGB);

    // Convert RGB back to hex
    const newHexColor =
      "#" +
      ((1 << 24) | (newRed << 16) | (newGreen << 8) | newBlue)
        .toString(16)
        .slice(1);

    lighterColorShades.push(newHexColor);
  }

  return lighterColorShades;
}
