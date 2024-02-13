import { imageList } from '../const';
import ItemComponent from './ItemComponent';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { fabric } from 'fabric';
import Logo from "../image/logo.png";
import ArrowBack from "../image/arrow_back.svg";

export default function ItemList() {
  const [recentImages, setRecentImages] = useState([]);
  const [recentSnapshot, setRecentSnapshot] = useState(null);
  const [isLoad, setIsLoad] = useState(false);

  const width = window.innerWidth;
  const styles = createStyles(width);

  useEffect(() => {
    fabric.Object.prototype.objectCaching = true;
    loadRecentImage();
  }, []);

  useEffect(() => {
    window.onscroll = () => {
      // console.log('scroll', window.innerHeight + document.documentElement.scrollTop, document.documentElement.offsetHeight);
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight) {
        // console.log('bottom');
        loadRecentImage();
      }
    }
  }, [recentSnapshot, recentImages]);

  const loadRecentImage = async () => {
    if (isLoad) {
      console.log('loading');
      return;
    }

    setIsLoad(true);

    let q = null;
    if (recentSnapshot) {
      q = query(collection(db, "history"), orderBy("createdAt", "desc"), startAfter(recentSnapshot), limit(5));
    } else {
      q = query(collection(db, "history"), orderBy("createdAt", "desc"), limit(5));
    }
    const querySnapshot = await getDocs(q);

    let recentItems = [];

    querySnapshot.forEach(async (doc) => {
      // const data = doc.data()

      recentItems.push({
        id: doc.id,
        // image: imageData,
        ...doc.data()
      });
    });
    const newItems = [...recentImages, ...recentItems]
    // console.log(newItems.length)

    setRecentSnapshot(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setRecentImages(newItems);
    setIsLoad(false);
  }

  const handleBack = () => {
    // console.log('back');
    window.location.href = '/';
  }

  const moveToDetail = (image) => {
    window.location.href = `/detail/${image.id}`;
  }

  return (
      <div className='body-content'>
        <div style={styles.header}>
          <div>
            <img src={ArrowBack} alt="arrowback" style={styles.backButton} onClick={handleBack}/>
          </div>
        </div>
        <div style={styles.recentText}>
          <div>
            만들어진 이미지
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
            <div key={index} style={styles.item} onClick={() => moveToDetail(image)}>
              <ItemComponent
                data={image}
              />         
            </div>
          );
        })}
      </div>
  );
}


const createStyles = (screenWidth) => {
  const headerWidth = screenWidth - 20;
  return {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '20px',
      width: `${headerWidth}px`
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
  }
};
