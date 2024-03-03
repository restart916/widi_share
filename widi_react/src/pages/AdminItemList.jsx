import { imageList } from '../const';
import ItemComponent from './ItemComponent';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { fabric } from 'fabric';
import Logo from "../image/logo.png";

export default function AdminItemList() {
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
      const data = doc.data()
      recentItems.push({
        id: doc.id,
        originalCustomImage: data.customImage,
        ...data
      });
    });
    const newItems = [...recentImages, ...recentItems]

    setRecentSnapshot(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setRecentImages(newItems);
    setIsLoad(false);
  }

  const addShowList = async (image) => {
    if (window.confirm('Show List에 추가하시겠습니까?')) {
      console.log('show list', image);
      
      const data = {
        ...image,
        customImage: image.originalCustomImage,
        historyId: image.id,
      }

      await addDoc(collection(db, "showlist"), data);
    }

  }

  return (
      <div className='body-content'>
        <div style={{padding: '8px'}}>
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
            <div key={index} style={styles.item} onClick={() => addShowList(image)}>
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
      padding: '20px 0px',
      width: `${headerWidth}px`
    },
    backButton: {
      width: '24px',
      height: '24px'
    },
    recentText: {
      padding: '16px 0px',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    item: {
      width: '100%',
      paddingBottom: '20px'
    }
  }
};
