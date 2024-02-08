import { imageList } from '../const';
import ItemComponent from './ItemComponent';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { fabric } from 'fabric';
import Logo from "../image/logo.png";

export default function ItemList() {
  const [recentImages, setRecentImages] = useState([]);

  useEffect(() => {
    fabric.Object.prototype.objectCaching = true;

    loadRecentImage();
  }, []);

  const loadRecentImage = async () => {
    const q = query(collection(db, "history"), orderBy("createdAt", "desc"), limit(5));

    const querySnapshot = await getDocs(q);
    let recentImages = [];

    querySnapshot.forEach(async (doc) => {
      // const data = doc.data()

      recentImages.push({
        id: doc.id,
        // image: imageData,
        ...doc.data()
      });
    });
    setRecentImages(recentImages);
  }

  return (
      <div>
        <div>
          {/* backbutton */}
          <button onClick={() => window.location.href = '/'}>Back</button>
        </div>
        <div style={{display: 'none'}}>
            { imageList.map((image, index) => {
              return (
                <div className="item" key={index}>
                    <img id={image.file} src={image.image} alt={image.file}/>
                </div>
              )})
            }
            <img id="logo" src={Logo}/>
        </div>
        {recentImages.map((image, index) => {
          return (
            <div key={index}>
              <ItemComponent
                data={image}
              />         
            </div>
          );
        })}
      </div>
  );
}

