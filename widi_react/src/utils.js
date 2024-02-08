import { fabric } from 'fabric';

const generateImage = async ({
    uniqueId = 'canvas',
    text,
    name,
    username,
    font,
    color,
    charSpacing,
    imageFile,
    customImage,
    customImageWidth,
    customImageHeight
  }) => {
  const imageSize = 360;
  const margin = 20 ;

  console.log('uniqueId', uniqueId)
  const fabricCanvas = new fabric.Canvas(uniqueId, {
    isDrawingMode: false,
    width: imageSize,
    height: imageSize,
    allowTouchScrolling: false,
  })
  
  if (customImage) {
      // console.log('wow', customImage)
      var imgInstance = new fabric.Image(customImage, {
          left: 0,
          top: 0,
          right: customImageWidth,
          bottom: customImageHeight,
          scaleX: imageSize / customImageWidth,
          scaleY: imageSize / customImageHeight,
          opacity: 1,
          selectable: false,
      });
      fabricCanvas.add(imgInstance);
  } else {
      let imgElement = document.getElementById(imageFile);
      let imgInstance = new fabric.Image(imgElement, {
          left: 0,
          top: 0,
          right: 1200,
          bottom: 1200,
          scaleX: imageSize / 1200,
          scaleY: imageSize / 1200,
          opacity: 1,
          selectable: false,
      });
      fabricCanvas.add(imgInstance);
  }

  let textbox = new fabric.Textbox(text, { 
      left: margin,
      width: imageSize - (margin * 2) - 8,
      fontSize: 15, 
      fontFamily: font,
      lineHeight: 1.5,
      selectable: false,
      fill: color,
      textAlign: 'left',
      charSpacing: charSpacing,
      splitByGrapheme: true,
  });

  textbox.top = (imageSize - (textbox.height + 54)) / 2
  fabricCanvas.add(textbox);

  let nameText = new fabric.Text(name, { 
      left: margin,
      width: imageSize - (margin * 2),
      fontSize: 14, 
      fontFamily: 'NotoSans',
      top: (textbox.top + textbox.height + 16),
      selectable: false,
      fill: color,
  });
  fabricCanvas.add(nameText);

  if (username) {
      let usernameText = new fabric.Text(`${username}`, { 
          left: margin,
          width: imageSize - (margin * 2),
          fontSize: 14, 
          fontFamily: 'NotoSansThin',
          top: (textbox.top + textbox.height + 38),
          selectable: false,
          fill: `${color}B0`,
      });
      fabricCanvas.add(usernameText);
  }

  const logoScale = 0.3
  let logoElement = document.getElementById('logo');
  let logoInstance = new fabric.Image(logoElement, {
      left: imageSize - (150 * logoScale) - 10,
      top: imageSize - (60 * logoScale) - 10,
      scaleX: logoScale,
      scaleY: logoScale,
      opacity: 1,
      selectable: false,
  });
  fabricCanvas.add(logoInstance);

  return {
    canvas: fabricCanvas,
    imageData: fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 4,
    })
  }
}


export { generateImage };