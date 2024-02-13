import { imageList } from '../const';
import ItemComponent from './ItemComponent';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getDoc, doc } from "firebase/firestore";
import { fabric } from 'fabric';
import Logo from "../image/logo.png";
import ArrowBack from "../image/arrow_back.svg";
import { useParams } from 'react-router-dom';

export default function ItemDetail() {
  const [recentImage, setRecentImage] = useState(null);
  let { id } = useParams();
  const width = window.innerWidth;
  const styles = createStyles(width);

  useEffect(() => {
    // console.log('params', id);
    fabric.Object.prototype.objectCaching = true;
    loadRecentImage();
  }, []);

  const loadRecentImage = async () => {
    const docData = await getDoc(doc(db, "history", id))
    setRecentImage({
      id: docData.id,
      ...docData.data()
    });
  }

  const handleBack = () => {
    // console.log('back');
    window.location.href = '/list';
  }

  return (
      <div className='body-content'>
        <div style={styles.header}>
          <div>
            <img src={ArrowBack} alt="arrowback" style={styles.backButton} onClick={handleBack}/>
          </div>
        </div>
        {/* <div style={styles.recentText}>
          <div>
            최근 만들어진 이미지
          </div>
        </div> */}
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
        {
          recentImage && (
            <div style={styles.item}>
              <ItemComponent
                data={recentImage}
              />
            </div>
          ) 
        }
        <div style={{marginInline: '10px'}}>
          {
            recentImage && (
              <div className='detailInput'>
                <textarea 
                  type="text" 
                  value={recentImage.text}
                  readOnly={true}
                  style={{resize: 'none', height: '200px', marginBottom: '12px', marginTop: '20px'}}
                  className="inputTweetName">
                </textarea>
                <input 
                    type="text" 
                    value={recentImage.name}
                    readOnly={true}
                    className="inputTweetName">
                </input>
                <input 
                    type="text" 
                    value={recentImage.username}
                    readOnly={true}
                    className="inputTweetName">
                </input>
              </div>
            ) 
          }
        </div>
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
