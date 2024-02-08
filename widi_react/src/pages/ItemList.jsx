import { imageList } from '../const';
import ItemComponent from './ItemComponent';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { fabric } from 'fabric';
import Logo from "../image/logo.png";
import ArrowBack from "../image/arrow_back.svg";

export default function ItemList() {
  const [recentImages, setRecentImages] = useState([]);

  const styles = createStyles();

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

  const handleBack = () => {
    console.log('back');
    window.location.href = '/';
  }

  return (
      <div>
        <div style={styles.header}>
          <div>
            <img src={ArrowBack} alt="arrowback" style={styles.backButton} onClick={handleBack}/>
          </div>
        </div>
        <div style={styles.recentText}>
          <div>
            최근 만들어진 이미지
          </div>
        </div>
        <div style={{display: 'none'}}>
            { imageList.map((image, index) => {
              return (
                <div key={index}>
                    <img id={image.file} src={image.image} alt={image.file}/>
                </div>
              )})
            }
            <img id="logo" src={Logo}/>
        </div>
        {recentImages.map((image, index) => {
          return (
            <div key={index} style={styles.item}>
              <ItemComponent
                data={image}
              />         
            </div>
          );
        })}
      </div>
  );
}


const createStyles = () => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
  },
  backButton: {
    width: '24px',
    height: '24px'
  },
  recentText: {
    padding: '16px 20px',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  item: {
    width: '100%',
    padding: '10px'
  }
});
