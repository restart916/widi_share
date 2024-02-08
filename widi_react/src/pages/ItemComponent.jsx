import { fontList, imageList } from '../const';
import React, { useState, useEffect } from 'react';
import { generateImage } from '../utils';

export default function ItemComponent(
  {
    data
  }
) {
  const [image, setImage] = useState(null);
  
  const styles = createStyles();

  useEffect(() => {
    const init = async () => {
      const {
        imageData
      } = await generateImage(
        {
            uniqueId: data.id,
            text: data.text,
            name: data.name,
            username: data.username,
            font: data.font,
            color: data.color,
            charSpacing: data.charSpacing,
            imageFile: data.imageFile,
            customImage: data.customImage,
            customImageWidth: data.customImageWidth,
            customImageHeight: data.customImageHeight
        }
      );
      setImage(imageData);
    }
    init();
    // console.log(data);
  }, [data]);

  return (
    <div>
      {
        image ? (
          <img src={image} alt="image" 
            style={styles.image}
          />
        ) : (
          <div>
            Loading...
          </div>
        )
      }
    </div>
  );
}


const createStyles = () => ({
  image: {
    width: '100%',
    borderRadius: '6px', 
  }
});
