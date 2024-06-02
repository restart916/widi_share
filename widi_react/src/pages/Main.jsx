import '../main.css';

import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'bootstrap';
import { fabric } from 'fabric';
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore"; 
import { ref, uploadBytes } from "firebase/storage";
import { logEvent } from "firebase/analytics";
import { analytics, db, storage } from '../firebase';
import { fontList, imageList } from '../const';
import { generateImage } from '../utils';
import ItemComponent from './ItemComponent';

import HeaderRound from '../image/header_round.svg';
import BannerImage from '../image/banner_image.png';
import Logo from "../image/logo.png";
import Arrow from "../image/arrow_forward.svg";
import CheckCircle from "../image/check_circle.svg";
import ImgUpload from "../image/img_upload.svg";
import IconCharSpacingLeft from "../image/icon_char_spacing_left.svg";
import IconCharSpacingRight from "../image/icon_char_spacing_right.svg";

export default function Main() {
  const [imageData, setImageData] = useState('');
  const [selectImage, setSelectImage] = useState(imageList[0].file);
  const [selectFont, setSelectFont] = useState(fontList[0]['family']);
  const [selectColor, setSelectColor] = useState('#FFFFFF');
  const [selectCharSpacing, setSelectCharSpacing] = useState(100);
  const [tweetText, setTweetText] = useState('');
  const [tweetName, setTweetName] = useState('');
  const [tweetUsername, setTweetUsername] = useState('');
  const [customImage, setCustomImage] = useState(null);
  const [customImageWidth, setCustomImageWidth] = useState(100);
  const [customImageHeight, setCustomImageHeight] = useState(100);
  const [customFile, setCustomFile] = useState(null);
  
  const [recentImages, setRecentImages] = useState([]);
  const [canvas, setCanvas] = useState(null);
  const [allowHistory, setAllowHistory] = useState(true);
  const [timer, setTimer] = useState(null);
  const fileupload = useRef(null);

  useEffect(() => {
    fabric.Object.prototype.objectCaching = true;
    loadRecentImage();
  }, []);

  const loadRecentImage = async () => {
    const q = query(collection(db, "showlist"), orderBy("createdAt", "desc"), limit(5));

    const querySnapshot = await getDocs(q);
    let recentImages = [];

    querySnapshot.forEach(async (doc) => {
      recentImages.push({
        id: doc.id,
        // image: imageData,
        ...doc.data()
      });
    });
    setRecentImages(recentImages);
  }

  const saveToHistory = async () => {
    let uploadImage = null;

    if (customFile) {
      const ext = customImage.src.split(';')[0].split('/')[1];
      const storageRef = ref(storage, 'images/' + new Date().toISOString() + '.' + ext);

      uploadImage = await uploadBytes(storageRef, customFile, {
        contentType: 'image/' + ext,
      });
    }

    const data = {
      "text": tweetText,
      "name": tweetName,
      "username": tweetUsername,
      "font": selectFont,
      "color": selectColor,
      "charSpacing": selectCharSpacing,
      "imageFile": selectImage,
      "customImage": uploadImage ? uploadImage.metadata.fullPath : null,
      "customImageWidth": customImageWidth,
      "customImageHeight": customImageHeight,
      "createdAt": new Date().toISOString(),
    }
    console.log('saveToHistory', data)
    
    await addDoc(collection(db, "history"), data);
  }

  const render = (threshold = 100) => {
    clearTimeout(timer)

    // save to firestore
    if (allowHistory) {
        saveToHistory()
    }

    const t = setTimeout(() => {
        setTimer(null)
        redraw()
        showModal()                    
    }, threshold)
    setTimer(t)
  }

  const showModal = () => {
    // document.getElementById('modal').style.display='flex'
  }
  const closeModal = () => {
    // document.getElementById('modal').style.display='none'
  }
  
  const redraw = async () => {
    if (canvas == null) {
        
    } else {
        canvas.dispose()
    }

    const {
      canvas: newCanvas,
      imageData
    } = await generateImage(
      {
        text: tweetText,
        name: tweetName,
        username: tweetUsername,
        font: selectFont,
        color: selectColor,
        charSpacing: selectCharSpacing,
        imageFile: selectImage,
        customImage,
        customImageWidth,
        customImageHeight
      }
    );

    setCanvas(newCanvas)
    setImageData(imageData)

    // this.errorMessage = ''
    // this.loadingMessage = ''
    // this.resultMessage = '아래 이미지를 꾸욱 눌러 <strong>저장</strong>해 주세요'
    
    console.log('finished render')
  }

  const checkSelected = (image) => {
    return image.file === selectImage ? 'selected' : 'no-selected'
  }
  const checkSelectedFont = (font) => {
    return font === selectFont ? 'selected-font' : ''
  }
  const checkSelectedColor = (color) => {
    return color === selectColor ? 'selected-color' : ''
  }

  const onClickRecent = async (imageData) => {
    logEvent(analytics, 'select_recent_image', {imageData});
    moveToListPage()
  }

  const onClickCreateImage = () => {
    logEvent(analytics, 'create_image');

    render(0)

    setTimeout(() => {
      // scroll to specific div with animation
      document.getElementById('scroll-target').scrollIntoView({
        behavior: 'smooth'
      });
    }, 100)
  }

  const onClickImage = async (image) => {
    logEvent(analytics, 'select_image', {image});
    
    setSelectImage(image.file)
    setSelectColor(image.fontColor)

    fileupload.current.value = null;
    setCustomImage(null)
    setCustomFile(null)
  }

  const onClickFileUpload = () => {
    fileupload.current.click();
  }

  const onClickFont = async (family) => {
    setSelectFont(family);
    logEvent(analytics, 'select_font', {family});
  }
  const onClickColor = async (color) => {
    setSelectColor(color);
    logEvent(analytics, 'select_color', {color});
  }

  const moveHome = () => {
    window.location.href="https://share.wimouniv.com/";
  }
  const openDuetTodo = () => {
    window.open('https://apps.apple.com/kr/app/%EB%93%80%EC%97%A3%ED%88%AC%EB%91%90/id6445875698', '_blank');
  }
  const sendCopyLog = () => {
    logEvent(analytics, 'copy_image');
  }

  const changeImageInput = (e) => {
    console.log('changeImageInput', e.target.files[0])
    let file = e.target.files[0]
    
    var reader = new FileReader();
    reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
          // check image file size (2mb limit)
            if (file.size > 2 * 1024 * 1024) {
              console.log('이미지 파일 크기가 너무 큽니다. 2MB 이하의 이미지를 사용해주세요.')
              return
            }

            console.log('imgObj', imgObj)
            setCustomImage(imgObj)
            setCustomImageHeight(imgObj.height)
            setCustomImageWidth(imgObj.width)
            setSelectImage(null)
        }
    };
    setCustomFile(file)
    reader.readAsDataURL(file);
  }

  const shareImage = async () => {
    logEvent(analytics, 'share_image');

    let share_url = 'https://share.wimouniv.com/'
    
    const newText = '위모에서 만들기'

    let dataURL = imageData;
    let byteString = atob(dataURL.split(',')[1]);
    let mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {type: mimeString});
    let file = new File([blob], 'image.png', {type: mimeString});

    const shareData = {
        title: newText,
        text: newText,
        url: share_url,
        files: [file],
    }

    if (navigator.share) {
        await navigator.share(shareData)
    } else {
        if (navigator.clipboard) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/plain": new Blob([`${newText} ${share_url}`], {type: "text/plain"}),
                    [mimeString]: blob
                })
            ]);
        
            // show toast
            var toastElList = [].slice.call(document.querySelectorAll('.toast'))
            var toastList = toastElList.map(function (toastEl) {
              return new Toast(toastEl, {autohide: true, delay: 3000})
            });
            toastList.forEach(toast => toast.show()); // This will show all toasts
        } else {
            console.log('navigator.clipboard is not supported')
            // this.errorMessage = '공유하기 기능을 지원하지 않는 브라우저입니다.'
        }
    }
  }
  const saveImage = async () => {
    logEvent(analytics, 'save_image');

    let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        // Open the image in a new window for iOS
        window.open(imageData);
    } else {
        let a = document.createElement('a');
        a.href = imageData;
        a.download = 'image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  }

  const moveToListPage = () => {
    window.location.href = '/list';
  }

  const scriptElement = useRef(null);

  // script 태그를 동적으로 추가
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://t1.daumcdn.net/kas/static/ba.min.js"
    );
    script.setAttribute(
      "charset",
      "utf-8"
    );

    script.setAttribute("async", "true");
    scriptElement.current?.appendChild(script);
  }, []);


  return (
    <>
      <div id="app">
            
        <div className="header">
          <div ref={scriptElement}>
            <ins
              className="kakao_ad_area"
              style={{ display: "none" }}
              data-ad-unit    = "DAN-sprUUbzsH1FNCx00" 
              data-ad-width   = "320" 
              data-ad-height  = "50"></ins> 
          </div>          
          <div id='productName'>
            <img src={HeaderRound} onClick={moveHome} />
          </div>
        </div>

        <div className="body-content">
          <div className='recent-row'>
            <div className="recent-text">
              만들어진 이미지
            </div>
            <div className="recent-more" onClick={moveToListPage}>
              더보기
              <img src={Arrow} />
            </div>
          </div>
          <div id='recentImage' className="container ps-0 pe-0">       
            
            { recentImages.map((imageData, index) => {
              return (
                <div className="item" key={imageData.id}>
                  <div onClick={() => onClickRecent(imageData)} style={{width: '150px', borderRadius: '6px'}}>
                    <ItemComponent data={imageData} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        { imageData != '' && (
          <>
            <div id='scroll-target' className='gray-zone'>
            </div>
            <div className='body-content'>

              <div className='detailInput'>
                {/* <p className="modal-emoji">🎉</p> */}
                  <p className="modal-text">짠! 이미지가 만들어졌어요 🎉</p>
                
                  <div className="">
                      <div id='result'>
                        <img src={imageData} onCopy={sendCopyLog} />
                      </div>
                  </div>
                  <div className="modal-bottom">
                      <div className="modal-button share-button" onClick={shareImage}>
                          공유하기
                      </div>
                      <div className="modal-button save-button" onClick={saveImage}>
                          이미지 저장
                      </div>
                  </div>
              </div>
          </div>
        </>
        )}

        <div className='gray-zone'>
        </div>

        <div className="body-content">
          <div className='detailInput'>
            <p style={{marginTop: '40px', fontWeight: '700'}}>이미지로 만들고 싶은 <br />내용을 써주세요</p>

            <textarea 
              type="text" 
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="내용을 넣어주세요"
              style={{resize: 'none', height: '200px', marginBottom: '12px', marginTop: '20px'}}
              className="inputTweetName">
            {/* @keyup="render"
              @change="render"
              @input="render"
              @paste="render" */}
            </textarea>
            <input 
                type="text" 
                value={tweetName}
                onChange={(e) => setTweetName(e.target.value)}
                placeholder="제목"
                className="inputTweetName">
            </input>
            <input 
                type="text" 
                value={tweetUsername}
                onChange={(e) => setTweetUsername(e.target.value)}
                placeholder="글쓴이"
                className="inputTweetName">
            </input>
          </div>
            <div id='selectImage' className="container ps-0 pe-0">
                <div className="item">
                  <div onClick={onClickFileUpload}>
                    <img id='upload' src={ImgUpload} alt="upload" className="no-selected" />
                  </div>
                </div>
                {
                  customImage && (
                    <div className="item">
                      <div >
                        <img id='custom' src={customImage.src} alt="custom" className="selected" />
                      </div>
                    </div>
                  )
                }
                { imageList.filter((image) => image.visible).map((image, index) => {
                  return (
                    <div className="item" key={index}>
                      <div onClick={() => onClickImage(image)}>
                        <img id={image.file} src={image.image} alt={image.file}
                        className={checkSelected(image)} />
                      </div>
                    </div>
                  )})
                }
                <input 
                    type="file" 
                    ref={fileupload}
                    onChange={changeImageInput}
                    style={{marginTop: '16px', 'display': 'none'}}
                    >
                </input>
            </div>

            <div className="divied"></div>

            <div id='selectFont' className='container ps-0 pe-0' style={{marginTop: '24px'}}>
              <div className='font-text'>
                폰트
              </div>
              { fontList.map((font, index) => {
                return (
                  <div className="item-button" key={index}>
                    <div className={`fontButton ${checkSelectedFont(font.family)}`} onClick={() => onClickFont(font.family)} >
                      {font.name}
                    </div>
                  </div>
                )
              })}
            </div>
    
            <div id='selectColor' className="container ps-0 pe-0" style={{marginTop: '20px'}}>
                <div className="item-button" style={{marginRight: '8px'}}>
                    <div className={`colorButton colorButtonWhite ${checkSelectedColor("#FFFFFF")}`} onClick={() => onClickColor('#FFFFFF')}>
                        가
                    </div>
                </div>
                <div className="item-button">
                    <div className={`colorButton colorButtonBlack ${checkSelectedColor("#1C1C1E")}`} onClick={() => onClickColor('#1C1C1E')}>
                        가
                    </div>
                </div>
            </div>

            <div id='selectCharSpacing' className="container ps-0 pe-0" style={{marginBottom: '20px', marginTop: '24px', display: 'flex'}}>
                <div className="char-spacing-icon" style={{height: '40px'}}>
                    <div style={{display: 'flex', height: '40px', alignItems: 'center', fontSize: '14px'}}>
                        <img src={IconCharSpacingLeft} style={{width: '24px', height: '24px'}} />
                    </div>
                </div>
                <div className="item-button" style={{flexGrow: '1'}}>
                    <div style={{padding: '0px 16px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <input type="range" min="0" max="500" step="10" className="slider customSlider" id="myRange" 
                          value={selectCharSpacing}
                          list="values"
                          onChange={(e) => setSelectCharSpacing(e.target.value)}
                        />
                        <datalist id="values">
                          <option value="0" label="0"></option>
                          <option value="100" label="100"></option>
                          <option value="200" label="200"></option>
                          <option value="300" label="300"></option>
                          <option value="400" label="400"></option>
                          <option value="500" label="500"></option>
                        </datalist>
                    </div>
                </div>
                <div className="char-spacing-icon" style={{height: '40px'}}>
                    <div style={{display: 'flex', height: '40px', alignItems: 'center', fontSize: '14px'}}>
                        <img src={IconCharSpacingRight} style={{width: '24px', height: '24px'}} />
                    </div>
                </div>
            </div>

            {imageData != '' && (
              <>
                <div className="roundCreateButton" onClick={onClickCreateImage}>
                  이미지 만들기
                </div>
                <div className="float-bottom-text">
                  <div style={{marginRight: '4px'}}>
                    <input type="checkbox" id="check" name="check" 
                      checked={allowHistory}
                      onChange={(e) => setAllowHistory(e.target.checked)}
                    />
                  </div>
                  <div>
                    만든 기록 남기기
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{paddingTop: '36px'}}>
            {/* <div onClick={openDuetTodo} 
              style={{background: 'black', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div 
                  style={{display: 'flex'}}>
                    <div>
                        <img src={BannerImage}
                          style={{width: '40px'}} />
                    </div> 
                    <div style={{marginLeft: '12px'}}>
                    <div style={{color: 'white', fontSize: '16px', fontWeight: 'bold'}}>
                            듀엣투두
                        </div> 
                        <div 
                          style={{color: 'white', opacity: '50%', fontSize: '14px'}}>
                            오타쿠용 할일 관리 앱
                        </div>
                    </div> 
                </div>
                <div 
                  style={{backgroundColor: '#2F7CF6', padding: '4px 18px', borderRadius: '100px'}}>
                    <div 
                      style={{fontSize: '12px', fontWeight: 'normal', color: 'white'}}>
                        받기
                    </div>
                </div>
            </div> */}
        </div>
        {/* https://apps.apple.com/kr/app/%EB%93%80%EC%97%A3%ED%88%AC%EB%91%90/id6445875698 */}    

        <div id="credit">
            <div className="credit-text">
                서비스
            </div>
            <div className="credit-link">
                <a href="https://twitter.com/widishare2021" className="credit" target="_blank">버그 신고 및 제휴 문의</a>
            </div>
            <div style={{marginBottom: '16px'}}>
            </div>
            <div className="credit-text">
                만든 사람
            </div>
            <div className="credit-link">
                <a href="https://twitter.com/FlatcherLynd" className="credit" target="_blank">윌리 👀</a>
            </div>
        </div>

        <div className="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-body z-toast">
              <div style={{marginRight: '8px'}}>
                <img src={CheckCircle} style={{width: '24px', height: '24px'}} />
              </div>
              <div>
                이미지가 복사되었어요
              </div>
            </div>
        </div>

        <div style={{display: 'none'}}>
            <canvas id="canvas" ></canvas>
            { imageList.map((image, index) => {
              return (
                <div key={index}>
                    <img id={image.file} src={image.image} alt={image.file}/>
                </div>
              )})
            }
            <img id="logo" src={Logo}/>
        </div>

        { imageData == '' && (
          <div className="float-bottom">
            <div className="createButton" onClick={onClickCreateImage}>
                이미지 만들기
            </div>
            <div className="float-bottom-text">
              <div style={{marginRight: '4px'}}>
                <input type="checkbox" id="check" name="check" 
                  checked={allowHistory}
                  onChange={(e) => setAllowHistory(e.target.checked)}
                />
              </div>
              <div>
                만든 기록 남기기
              </div>
            </div>
            
          </div>
        )}

        {/* <div className="modal" id="modal" onClick={closeModal}>
            <div className="modal-content" onClick={doNothing}>
                <div>
                    <img className="closeButton" onClick={closeModal} src={ButtonClose} />
                </div>
                <div className="">
                    <p className="modal-emoji">🎉</p>
                    <p className="modal-text">짠! 이미지가 만들어졌어요</p>
                    <div id='result'>
                      {imageData != '' && <img src={imageData} onCopy={sendCopyLog} />}
                    </div>
                </div>
                <div className="modal-bottom">
                    <div className="modal-button share-button" onClick={shareImage}>
                        공유하기
                    </div>
                    <div className="modal-button save-button" onClick={saveImage}>
                        이미지 저장
                    </div>
                </div>
            </div>
            <div className="lottie-div">
                <lottie-player className="lottie-player" src="./image/lottie_ani.json" background="transparent" speed="1" ></lottie-player>
            </div>
        </div> */}

      </div>
    </>
  );
}